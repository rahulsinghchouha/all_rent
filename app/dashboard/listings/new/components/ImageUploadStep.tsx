"use client";

import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { updateDraft, nextStep, type ImageFile } from "@/app/store/listingSlice";
import { useRef, useState } from "react";

const MAX_IMAGES = 10;
const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUploadStep() {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.listing.draft);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) return `${file.name}: Only JPG, PNG, WebP allowed.`;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return `${file.name}: Max ${MAX_SIZE_MB}MB.`;
    return null;
  }

  async function uploadFilesToMinIO(files: File[]) {
    setUploading(true);
    setErrors([]);
    
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const result = await response.json();
        setErrors([result.error || "Upload failed."]);
        setUploading(false);
        return;
      }

      const result = await response.json();
      const uploadedUrls = result.data;

      const newImages: ImageFile[] = uploadedUrls.map((upload: any, i: number) => ({
        id: `${Date.now()}-${i}`,
        file: undefined,
        preview: upload.url,
        isCover: draft.images.length === 0 && i === 0,
        minioUrl: upload.url,
      }));

      dispatch(updateDraft({ images: [...draft.images, ...newImages] }));
      setUploadProgress({});
    } catch (error: any) {
      setErrors([error?.message || "Upload failed."]);
    } finally {
      setUploading(false);
    }
  }

  async function addFiles(files: FileList | File[]) {
    const fileArr = Array.from(files);
    const remaining = MAX_IMAGES - draft.images.length;
    if (remaining <= 0) {
      setErrors([`Maximum ${MAX_IMAGES} images allowed.`]);
      return;
    }

    const newErrors: string[] = [];
    const validFiles: File[] = [];
    fileArr.slice(0, remaining).forEach((f) => {
      const err = validateFile(f);
      if (err) newErrors.push(err);
      else validFiles.push(f);
    });

    setErrors(newErrors);
    if (validFiles.length > 0) {
      await uploadFilesToMinIO(validFiles);
    }
  }

  function removeImage(id: string) {
    const filtered = draft.images.filter((img) => img.id !== id);
    if (filtered.length > 0 && !filtered.some((img) => img.isCover)) {
      filtered[0].isCover = true;
    }
    dispatch(updateDraft({ images: filtered }));
  }

  function setCover(id: string) {
    dispatch(updateDraft({
      images: draft.images.map((img) => ({ ...img, isCover: img.id === id })),
    }));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }

  const canProceed = draft.images.length >= 1 && !uploading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-accent font-heading">Upload Images</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Add up to {MAX_IMAGES} photos. The first image will be your cover photo.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          uploading ? "opacity-50 cursor-not-allowed" : ""
        } ${
          dragOver && !uploading
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary/40 hover:bg-muted/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          multiple
          disabled={uploading}
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            {uploading ? (
              <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            )}
          </div>
          <div>
            <p className="font-semibold text-accent">
              {uploading ? "Uploading..." : (
                <>
                  Drag & drop images here, or <span className="text-primary">browse</span>
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, WebP · Max {MAX_SIZE_MB}MB each · Up to {MAX_IMAGES} images
            </p>
          </div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-destructive font-medium">{err}</p>
          ))}
        </div>
      )}

      {/* Image Grid */}
      {draft.images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {draft.images.map((img) => (
            <div
              key={img.id}
              className={`relative group rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                img.isCover ? "border-primary shadow-lg shadow-primary/20" : "border-border"
              }`}
            >
              <img
                src={img.preview}
                alt="Upload preview"
                className="w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => { e.stopPropagation(); setCover(img.id); }}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-accent hover:text-primary transition-colors shadow"
                  title="Set as cover"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-destructive hover:bg-destructive hover:text-white transition-colors shadow"
                  title="Remove"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              {/* Cover badge */}
              {img.isCover && (
                <span className="absolute top-2 left-2 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
        </svg>
        {draft.images.length}/{MAX_IMAGES} images uploaded. At least 1 required.
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-4">
        <button
          onClick={() => dispatch(nextStep())}
          disabled={!canProceed}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all ${
            canProceed
              ? "bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-100 shadow-lg shadow-primary/30"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          Next: Details
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import minioClient, { ensureBucketExists, MINIO_BUCKET, MINIO_PUBLIC_URL } from "@/app/utils/minIo";

function isFile(value: FormDataEntryValue): value is File {
  return value instanceof File;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("images").filter(isFile);

    if (files.length === 0) {
      return NextResponse.json({ error: "No images uploaded." }, { status: 400 });
    }

    await ensureBucketExists();

    const uploads = await Promise.all(
      files.map(async (file) => {
        const objectName = `${Date.now()}-${randomUUID()}-${file.name}`.replace(/\s+/g, "-");
        const buffer = await file.arrayBuffer();

        await minioClient.putObject(MINIO_BUCKET, objectName, Buffer.from(buffer), file.size, {
          "Content-Type": file.type,
        });

        return {
          url: `${MINIO_PUBLIC_URL}/${MINIO_BUCKET}/${encodeURIComponent(objectName)}`,
          key: objectName,
        };
      })
    );

    return NextResponse.json({ data: uploads }, { status: 201 });
  } catch (error) {
    console.error("🔴 IMAGE UPLOAD ERROR:", error);
    return NextResponse.json({ error: "Failed to upload images." }, { status: 500 });
  }
}

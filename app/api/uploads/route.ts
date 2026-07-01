import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import minioClient, { ensureBucketExists, MINIO_BUCKET, MINIO_PUBLIC_URL } from "@/app/utils/minIo";
import { verifyAccessToken } from "@/app/services/auth";

function getBearerToken(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
}

function requireAuth(req: Request) {
  const token = getBearerToken(req);
  if (!token) {
    throw new Error("Missing access token");
  }
  return verifyAccessToken(token);
}

function isFile(value: FormDataEntryValue): value is File {
  return value instanceof File;
}

export async function POST(req: Request) {
  try {
    requireAuth(req);
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
  } catch (error: any) {
    console.error("🔴 IMAGE UPLOAD ERROR:", error?.message || error);
    if (typeof error?.message === "string" && (error.message.includes("Missing access token") || error.message.includes("jwt"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to upload images." }, { status: 500 });
  }
}

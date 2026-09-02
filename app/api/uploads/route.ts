import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import minioClient, { ensureBucketExists, MINIO_BUCKET, MINIO_PUBLIC_URL } from "@/app/utils/minIo";
import { verifyAccessToken, verifyRefreshToken } from "@/app/services/auth";

function getBearerToken(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
}

async function getAccessToken(req: Request) {
  const headerToken = getBearerToken(req);
  if (headerToken) {
    return headerToken;
  }

  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value ?? null;
}

async function requireAuth(req: Request) {
  const token = await getAccessToken(req);
  if (token) {
    try {
      return verifyAccessToken(token);
    } catch {
      // continue to refresh token fallback
    }
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken) {
    throw new Error("Missing access token");
  }

  return verifyRefreshToken(refreshToken);
}

function isFile(value: FormDataEntryValue): value is File {
  return value instanceof File;
}

export async function POST(req: Request) {
  try {
    await requireAuth(req);
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("🔴 IMAGE UPLOAD ERROR:", errorMessage);
    if (errorMessage.includes("Missing access token") || errorMessage.includes("jwt")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to upload images." }, { status: 500 });
  }
}

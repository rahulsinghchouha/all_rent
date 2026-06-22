import Minio from "minio";

export const MINIO_BUCKET = process.env.MINIO_BUCKET ?? "rents-images";
export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT ?? "localhost";
export const MINIO_PORT = Number(process.env.MINIO_PORT ?? 9000);
export const MINIO_USE_SSL = process.env.MINIO_USE_SSL === "true";
export const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY ?? "admin";
export const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY ?? "password123";
export const MINIO_PUBLIC_URL =
  process.env.MINIO_PUBLIC_URL ??
  `http://${MINIO_ENDPOINT}:${MINIO_PORT}`;

const minioClient = new Minio.Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: MINIO_USE_SSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

export async function ensureBucketExists() {
  const exists = await minioClient.bucketExists(MINIO_BUCKET);
  if (!exists) {
    await minioClient.makeBucket(MINIO_BUCKET, "us-east-1");
  }
}

export async function uploadImage(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string = "image/jpeg"
): Promise<string> {
  await ensureBucketExists();
  
  const objectName = `${Date.now()}-${fileName}`;
  
  await minioClient.putObject(
    MINIO_BUCKET,
    objectName,
    fileBuffer,
    fileBuffer.length,
    { "Content-Type": mimeType }
  );
  
  return `${MINIO_PUBLIC_URL}/${MINIO_BUCKET}/${objectName}`;
}

export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    const url = new URL(imageUrl);
    const objectName = url.pathname.split('/').pop();
    
    if (objectName) {
      await minioClient.removeObject(MINIO_BUCKET, objectName);
    }
  } catch (error) {
    console.error("Error deleting image from MinIO:", error);
  }
}

export default minioClient;
import { Client as MinioClient } from "minio";

export const MINIO_BUCKET = process.env.MINIO_BUCKET ?? "rental-images";
export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT ?? "localhost";
export const MINIO_PORT = Number(process.env.MINIO_PORT ?? 9000);
export const MINIO_USE_SSL = process.env.MINIO_USE_SSL === "true";
export const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY ?? "minioadmin";
export const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY ?? "minioadmin";
export const MINIO_PUBLIC_URL =
  process.env.MINIO_PUBLIC_URL ??
  `http://${MINIO_ENDPOINT}:${MINIO_PORT}`;

const minioClient = new MinioClient({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: MINIO_USE_SSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

const PUBLIC_READ_POLICY = (bucket: string) => JSON.stringify({
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Principal: { AWS: ["*"] },
      Action: ["s3:GetObject"],
      Resource: [`arn:aws:s3:::${bucket}/*`],
    },
  ],
});

export async function ensureBucketExists() {
  const exists = await minioClient.bucketExists(MINIO_BUCKET);
  if (!exists) {
    await minioClient.makeBucket(MINIO_BUCKET, "us-east-1");
  }
  await minioClient.setBucketPolicy(MINIO_BUCKET, PUBLIC_READ_POLICY(MINIO_BUCKET));
}

export default minioClient;
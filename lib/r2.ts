import { S3Client } from "@aws-sdk/client-s3";

export const R2_CONFIG_ERR =
  "R2 storage not configured: set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME in environment.";

let _r2: S3Client | null = null;

/** Lazy-initialized R2 client. Throws with clear message if env vars missing. */
export function getR2(): S3Client {
  if (_r2) return _r2;
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(R2_CONFIG_ERR);
  }
  _r2 = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
  return _r2;
}

export function getR2Bucket(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error(R2_CONFIG_ERR);
  return bucket;
}

export function getR2PublicBaseUrl(): string {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base?.trim()) throw new Error("R2_PUBLIC_BASE_URL is not set.");
  return base.replace(/\/$/, "");
}

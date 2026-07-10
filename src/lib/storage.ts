import crypto from "crypto";

export type StorageConfig = {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
  publicBaseUrl?: string;
};

function hmac(key: Buffer | string, value: string) {
  return crypto.createHmac("sha256", key).update(value).digest();
}

function sha256Hex(value: Buffer | string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function encodePath(value: string) {
  return value.split("/").map((part) => encodeURIComponent(part)).join("/");
}

function ymd(date: Date) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

function amzDate(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

export function storageConfig(): StorageConfig {
  return {
    endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
    region: process.env.S3_REGION || "us-east-1",
    bucket: process.env.S3_BUCKET || "licogi-os",
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "minioadmin",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "minioadmin",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL,
  };
}

export function objectPublicUrl(objectKey: string, config = storageConfig()) {
  const base = (config.publicBaseUrl || `${config.endpoint.replace(/\/$/, "")}/${config.bucket}`).replace(/\/$/, "");
  return `${base}/${encodePath(objectKey)}`;
}

export function buildObjectRequestUrl(objectKey: string, config = storageConfig()) {
  const endpoint = new URL(config.endpoint);
  if (config.forcePathStyle) {
    endpoint.pathname = `${endpoint.pathname.replace(/\/$/, "")}/${config.bucket}/${encodePath(objectKey)}`;
  } else {
    endpoint.hostname = `${config.bucket}.${endpoint.hostname}`;
    endpoint.pathname = `${endpoint.pathname.replace(/\/$/, "")}/${encodePath(objectKey)}`;
  }
  return endpoint;
}

function signingKey(secretAccessKey: string, dateStamp: string, region: string) {
  const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, "s3");
  return hmac(kService, "aws4_request");
}

export function signS3Request(method: "PUT" | "GET" | "DELETE", objectKey: string, body: Buffer | string, contentType = "application/octet-stream", config = storageConfig()) {
  const now = new Date();
  const dateStamp = ymd(now);
  const xAmzDate = amzDate(now);
  const url = buildObjectRequestUrl(objectKey, config);
  const host = url.host;
  const payloadHash = sha256Hex(body);
  const canonicalUri = url.pathname || "/";
  const canonicalQuerystring = "";
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${xAmzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [method, canonicalUri, canonicalQuerystring, canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", xAmzDate, credentialScope, sha256Hex(canonicalRequest)].join("\n");
  const signature = crypto.createHmac("sha256", signingKey(config.secretAccessKey, dateStamp, config.region)).update(stringToSign).digest("hex");
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  return {
    url: url.toString(),
    headers: {
      "content-type": contentType,
      "x-amz-date": xAmzDate,
      "x-amz-content-sha256": payloadHash,
      authorization,
    },
  };
}

export async function putObject(objectKey: string, buffer: Buffer, contentType?: string) {
  const config = storageConfig();
  const signed = signS3Request("PUT", objectKey, buffer, contentType || "application/octet-stream", config);
  const body = new Uint8Array(buffer);
  const response = await fetch(signed.url, { method: "PUT", headers: signed.headers, body });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`S3/MinIO upload failed: ${response.status} ${text.slice(0, 300)}`);
  }
  return { bucket: config.bucket, objectKey, publicUrl: objectPublicUrl(objectKey, config), provider: "S3_COMPATIBLE" };
}

export function safeObjectKey(input: { organizationCode: string; module: string; fileName: string }) {
  const ext = input.fileName.includes(".") ? input.fileName.split(".").pop() : "bin";
  const cleanExt = String(ext || "bin").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12) || "bin";
  const cleanModule = input.module.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  return `${input.organizationCode}/${cleanModule}/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${cleanExt}`;
}

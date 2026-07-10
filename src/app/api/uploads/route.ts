import crypto from "crypto";
import { NextResponse } from "next/server";
import { ModuleCode, PermissionAction } from "@prisma/client";
import { audit, authorize } from "../../../lib/authServer";
import { prisma } from "../../../lib/prisma";
import { putObject, safeObjectKey, storageConfig } from "../../../lib/storage";

export const runtime = "nodejs";

export async function GET() {
  const auth = await authorize(ModuleCode.STORAGE, PermissionAction.VIEW);
  if ("response" in auth) return auth.response;
  const files = await prisma.uploadFile.findMany({ where: { organizationId: auth.user.organizationId }, include: { project: true, createdBy: true, document: true }, orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ ok: true, files: files.map((file) => ({ id: file.id, fileName: file.fileName, originalName: file.originalName, mimeType: file.mimeType, sizeBytes: file.sizeBytes, bucket: file.bucket, objectKey: file.objectKey, publicUrl: file.publicUrl, status: file.status, project: file.project?.name ?? "", document: file.document?.name ?? "", createdBy: file.createdBy?.name ?? "", createdAt: file.createdAt })) });
}

export async function POST(request: Request) {
  const auth = await authorize(ModuleCode.STORAGE, PermissionAction.CREATE);
  if ("response" in auth) return auth.response;
  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ ok: false, message: "Thiếu file upload." }, { status: 400 });
  const moduleName = String(form.get("module") || "documents");
  const projectId = String(form.get("projectId") || "") || null;
  const documentId = String(form.get("documentId") || "") || null;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (buffer.byteLength > Number(process.env.MAX_UPLOAD_BYTES || 50_000_000)) {
    return NextResponse.json({ ok: false, message: "File vượt quá dung lượng cho phép." }, { status: 413 });
  }
  const objectKey = safeObjectKey({ organizationCode: auth.user.organizationCode, module: moduleName, fileName: file.name });
  const stored = await putObject(objectKey, buffer, file.type || "application/octet-stream");
  const checksumSha256 = crypto.createHash("sha256").update(buffer).digest("hex");
  const record = await prisma.uploadFile.create({
    data: {
      organizationId: auth.user.organizationId,
      projectId,
      documentId,
      createdById: auth.user.id,
      provider: stored.provider,
      bucket: stored.bucket,
      objectKey: stored.objectKey,
      fileName: file.name,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: buffer.byteLength,
      checksumSha256,
      publicUrl: stored.publicUrl,
      metadata: { module: moduleName },
    },
  });
  await audit(auth.user, ModuleCode.STORAGE, PermissionAction.CREATE, `Upload file ${file.name}.`, "uploadFile", record.id, { objectKey, sizeBytes: buffer.byteLength });
  return NextResponse.json({ ok: true, file: record, config: { bucket: storageConfig().bucket } }, { status: 201 });
}

import { NextResponse } from "next/server";
import { ModuleCode, PermissionAction } from "@prisma/client";
import { appendRows, bulkUpdateRows, deleteRows, isValidEntity, readRows, replaceRows, StoredRow } from "../../../../lib/serverDataStore";
import { audit, authorize } from "../../../../lib/authServer";

type Context = { params: Promise<{ entity: string }> };

type WriteBody = {
  mode?: "append" | "replace";
  rows?: Record<string, string>[];
};

type PatchBody = {
  ids?: string[];
  patch?: Record<string, string>;
  row?: StoredRow;
};

type DeleteBody = {
  ids?: string[];
  all?: boolean;
};

async function getEntity(context: Context) {
  const { entity } = await context.params;
  if (!isValidEntity(entity)) return null;
  return entity;
}

export async function GET(_request: Request, context: Context) {
  const auth = await authorize(ModuleCode.DATA_CENTER, PermissionAction.VIEW);
  if ("response" in auth) return auth.response;
  const entity = await getEntity(context);
  if (!entity) return NextResponse.json({ ok: false, message: "Nhóm dữ liệu không hợp lệ." }, { status: 404 });
  const rows = await readRows(entity, { user: auth.user });
  return NextResponse.json({ ok: true, entity, total: rows.length, rows });
}

export async function POST(request: Request, context: Context) {
  const auth = await authorize(ModuleCode.DATA_CENTER, PermissionAction.IMPORT);
  if ("response" in auth) return auth.response;
  const entity = await getEntity(context);
  if (!entity) return NextResponse.json({ ok: false, message: "Nhóm dữ liệu không hợp lệ." }, { status: 404 });
  const body = await request.json().catch(() => null) as WriteBody | null;
  const rows = Array.isArray(body?.rows) ? body.rows : [];
  const saved = body?.mode === "replace" ? await replaceRows(entity, rows, { user: auth.user }) : await appendRows(entity, rows, { user: auth.user });
  await audit(auth.user, ModuleCode.DATA_CENTER, PermissionAction.IMPORT, `${body?.mode === "replace" ? "Thay thế" : "Nhập"} ${rows.length} dòng dữ liệu ${entity}.`, entity, undefined, { mode: body?.mode ?? "append", rows: rows.length });
  return NextResponse.json({ ok: true, entity, total: saved.length, rows: saved });
}

export async function PATCH(request: Request, context: Context) {
  const auth = await authorize(ModuleCode.DATA_CENTER, PermissionAction.UPDATE);
  if ("response" in auth) return auth.response;
  const entity = await getEntity(context);
  if (!entity) return NextResponse.json({ ok: false, message: "Nhóm dữ liệu không hợp lệ." }, { status: 404 });
  const body = await request.json().catch(() => null) as PatchBody | null;
  if (body?.row?._id) {
    const saved = await appendRows(entity, [body.row], { user: auth.user });
    await audit(auth.user, ModuleCode.DATA_CENTER, PermissionAction.UPDATE, `Cập nhật 1 dòng dữ liệu ${entity}.`, entity, body.row._id);
    return NextResponse.json({ ok: true, entity, total: saved.length, rows: saved });
  }
  const requestedIds = Array.isArray(body?.ids) ? body.ids : [];
  const visibleIds = new Set((await readRows(entity, { user: auth.user })).map((row) => row._id));
  const ids = requestedIds.filter((id) => visibleIds.has(id));
  const patch = body?.patch ?? {};
  if (!ids.length || !Object.keys(patch).length) return NextResponse.json({ ok: false, message: "Thiếu dòng hoặc dữ liệu cần sửa, hoặc bạn không sở hữu các dòng đã chọn." }, { status: 400 });
  const saved = await bulkUpdateRows(entity, ids, patch, { user: auth.user });
  await audit(auth.user, ModuleCode.DATA_CENTER, PermissionAction.UPDATE, `Cập nhật hàng loạt ${ids.length} dòng dữ liệu ${entity}.`, entity, undefined, { ids, fields: Object.keys(patch) });
  return NextResponse.json({ ok: true, entity, total: saved.length, rows: saved });
}

export async function DELETE(request: Request, context: Context) {
  const auth = await authorize(ModuleCode.DATA_CENTER, PermissionAction.DELETE);
  if ("response" in auth) return auth.response;
  const entity = await getEntity(context);
  if (!entity) return NextResponse.json({ ok: false, message: "Nhóm dữ liệu không hợp lệ." }, { status: 404 });
  const body = await request.json().catch(() => null) as DeleteBody | null;
  if (body?.all) {
    const saved = await replaceRows(entity, [], { user: auth.user });
    await audit(auth.user, ModuleCode.DATA_CENTER, PermissionAction.DELETE, `Xóa toàn bộ dữ liệu ${entity}.`, entity);
    return NextResponse.json({ ok: true, entity, total: saved.length, rows: saved });
  }
  const requestedIds = Array.isArray(body?.ids) ? body.ids : [];
  const visibleIds = new Set((await readRows(entity, { user: auth.user })).map((row) => row._id));
  const ids = requestedIds.filter((id) => visibleIds.has(id));
  if (!ids.length) return NextResponse.json({ ok: false, message: "Chưa chọn dòng cần xóa, hoặc bạn không sở hữu các dòng đã chọn." }, { status: 400 });
  const saved = await deleteRows(entity, ids, { user: auth.user });
  await audit(auth.user, ModuleCode.DATA_CENTER, PermissionAction.DELETE, `Xóa ${ids.length} dòng dữ liệu ${entity}.`, entity, undefined, { ids });
  return NextResponse.json({ ok: true, entity, total: saved.length, rows: saved });
}

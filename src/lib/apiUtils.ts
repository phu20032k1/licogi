import { NextResponse } from "next/server";
import { ModuleCode, PermissionAction } from "@prisma/client";
import { authorize, audit, AuthUser } from "./authServer";

export function moduleCode(value: string) {
  return value as ModuleCode;
}

export function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function dateValue(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function cleanString(value: unknown, fallback = "") {
  return String(value ?? fallback).trim();
}

export async function requireModule(module: string, action: PermissionAction) {
  return authorize(moduleCode(module), action);
}

export async function writeAudit(user: AuthUser, module: string, action: PermissionAction, message: string, entity?: string, entityId?: string, metadata?: Record<string, unknown>) {
  return audit(user, moduleCode(module), action, message, entity, entityId, metadata);
}

export function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

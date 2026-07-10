import { NextResponse } from "next/server";
import { dataEntities, importChecklist, systemAccounts } from "../../../data/dataCenter";

export async function GET() {
  return NextResponse.json({
    ok: true,
    dataEntities,
    importChecklist,
    systemAccounts: systemAccounts.map((account) => ({
      role: account.role,
      email: account.email,
      passwordEnv: account.passwordEnv,
      scope: account.scope,
    })),
  });
}

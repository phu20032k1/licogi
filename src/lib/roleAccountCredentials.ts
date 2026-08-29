import "server-only";

import type { RoleAccountProfile } from "../data/roleAccounts";

const executiveDefaults: Record<string, string> = {
  CHAIRMAN: "L183.Chairman@2026!",
  CONTROL_BOARD: "L183.Control@2026!",
  GENERAL_DIRECTOR: "L183.CEO@2026!",
  DEPUTY_FINANCE: "L183.PGD.Fin@2026!",
  DEPUTY_BUSINESS: "L183.PGD.Biz@2026!",
  DEPUTY_CONSTRUCTION: "L183.PGD.Const@2026!",
  DEPUTY_WARRANTY: "L183.PGD.Warranty@2026!",
  DEPUTY_SAFETY: "L183.PGD.Safety@2026!",
};

function generatedDefault(code: string) {
  if (code.startsWith("DEPUTY_HEAD_")) return `L183.Deputy.${code.slice("DEPUTY_HEAD_".length)}@2026!`;
  if (code.startsWith("HEAD_")) return `L183.Head.${code.slice("HEAD_".length)}@2026!`;
  if (code.startsWith("STAFF_")) return `L183.Staff.${code.slice("STAFF_".length)}@2026!`;
  return `L183.${code}@2026!`;
}

export function getRoleAccountPassword(profile: RoleAccountProfile) {
  return process.env[profile.passwordEnv] || executiveDefaults[profile.code] || generatedDefault(profile.code);
}

export function roleAccountProvisioningEnabled() {
  return process.env.LICOGI_ROLE_ACCOUNTS_ENABLED !== "false";
}

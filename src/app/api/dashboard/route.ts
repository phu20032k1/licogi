import { NextResponse } from "next/server";
import { ModuleCode, PermissionAction } from "@prisma/client";
import { dataLakeGroups, operatingModules } from "../../../data/enterprise";
import { readRows } from "../../../lib/serverDataStore";
import { authorize } from "../../../lib/authServer";

export async function GET() {
  const auth = await authorize(ModuleCode.DASHBOARD, PermissionAction.VIEW);
  if ("response" in auth) return auth.response;
  const projects = await readRows("projects", { user: auth.user });
  const warranty = await readRows("warranty", { user: auth.user });
  const documents = await readRows("documents", { user: auth.user });
  const equipment = await readRows("equipment", { user: auth.user });
  const ongoing = projects.filter((project) => project.status === "ongoing");
  const progressValues = ongoing.map((project) => Number(project.progress)).filter(Number.isFinite);
  const healthValues = projects.map((project) => Number(project.health_score)).filter(Number.isFinite);
  const averageProgress = progressValues.length ? Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length) : 0;
  const averageHealth = healthValues.length ? Math.round(healthValues.reduce((sum, value) => sum + value, 0) / healthValues.length) : 0;
  return NextResponse.json({
    ok: true,
    data: {
      kpi: {
        projects: projects.length,
        ongoing: ongoing.length,
        highRisk: ongoing.filter((project) => project.risk === "high").length,
        averageProgress,
        averageHealth,
        warrantyOpen: warranty.filter((ticket) => ticket.status !== "Hoàn thành").length,
      },
      modules: operatingModules,
      dataLake: dataLakeGroups.map((group) => ({
        ...group,
        count: group.name === "Projects" ? String(projects.length) : group.name === "Drawings" ? String(documents.length) : group.name === "Equipment" ? String(equipment.length) : group.count,
      })),
      constructionTasks: [],
    },
  });
}

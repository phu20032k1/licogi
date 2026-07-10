import { ProjectRisk, ProjectStatus, riskLabels, statusLabels } from "../../data/projects";

const statusClass: Record<ProjectStatus, string> = {
  ongoing: "border-amber-200 bg-amber-50 text-amber-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warranty: "border-sky-200 bg-sky-50 text-sky-700",
};

const riskClass: Record<ProjectRisk, string> = {
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  high: "border-red-200 bg-red-50 text-red-700",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${statusClass[status]}`}>{statusLabels[status]}</span>;
}

export function RiskBadge({ risk }: { risk: ProjectRisk }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${riskClass[risk]}`}>Rủi ro {riskLabels[risk].toLowerCase()}</span>;
}

export type ConstructionTask = {
  id: string;
  project: string;
  package: string;
  owner: string;
  planned: number;
  actual: number;
  deadline: string;
  status: "normal" | "warning" | "late";
};

export const constructionTasks: ConstructionTask[] = [];
export const resourceData: { label: string; used: number; total: number }[] = [];
export const incidents: { code: string; project: string; category: string; severity: string; date: string; status: string }[] = [];
export const documents: { code: string; name: string; project: string; type: string; revision: string; owner: string; updated: string; status: string }[] = [];
export const warrantyTickets: { code: string; project: string; title: string; customer: string; priority: string; assignee: string; created: string; deadline: string; status: string }[] = [];
export const partners: { code: string; name: string; category: string; region: string; rating: number; projects: number; safety: number; status: string }[] = [];

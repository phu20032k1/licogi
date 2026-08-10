export type PublicProjectStatus = "ongoing" | "completed" | "warranty";

export type PublicProjectFinancial = {
  contractValueVnd?: number;
  paymentRequestedVnd?: number;
  paymentPaidVnd?: number;
  receivableVnd?: number;
  receivablePaidVnd?: number;
  outstandingReceivableVnd?: number;
  contractCount?: number;
  paymentRequestCount?: number;
  debtLedgerCount?: number;
};

export type PublicProjectRelated = {
  documents?: number;
  equipment?: number;
  tasks?: number;
  contracts?: number;
  paymentRequests?: number;
  debtLedgers?: number;
  warranties?: number;
  dailyReports?: number;
  bimModels?: number;
};

export type PublicProjectRecord = {
  id: string;
  numericId?: number;
  code: string;
  name: string;
  type: string;
  rawType?: string;
  status: PublicProjectStatus;
  investor: string;
  customerCode?: string;
  customerIndustry?: string;
  investorCountry?: string;
  projectCountry?: string;
  province: string;
  legacyProvince?: string;
  contractValueVnd?: number | null;
  valueRange?: string;
  constructionArea?: string;
  floorArea?: string;
  scale?: string;
  contractorRole?: string;
  contractNumber?: string;
  packageName?: string;
  startDate?: string;
  endDate?: string;
  mapsUrl?: string;
  progress: number;
  risk?: string;
  healthScore?: number;
  source?: string;
  lat: number;
  lng: number;
  description?: string;
  dataCompleteness?: number;
  financial?: PublicProjectFinancial;
  related?: PublicProjectRelated;
  createdAt?: string;
  updatedAt?: string;
};

export type PublicProjectsResponse = {
  ok: boolean;
  total?: number;
  projects?: PublicProjectRecord[];
  generatedAt?: string;
  administrativeModel?: string;
  message?: string;
};

export const publicStatusLabels: Record<PublicProjectStatus, string> = {
  completed: "Đã hoàn thành",
  ongoing: "Đang thi công",
  warranty: "Bảo hành",
};

export function projectMoney(project: PublicProjectRecord) {
  return Number(project.financial?.contractValueVnd || project.contractValueVnd || 0);
}

export function formatVnd(value?: number | null, empty = "Chưa có dữ liệu") {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return empty;
  if (amount >= 1_000_000_000_000) {
    return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(amount / 1_000_000_000_000)} nghìn tỷ đồng`;
  }
  if (amount >= 1_000_000_000) {
    return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: amount >= 100_000_000_000 ? 0 : 1 }).format(amount / 1_000_000_000)} tỷ đồng`;
  }
  if (amount >= 1_000_000) {
    return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(amount / 1_000_000)} triệu đồng`;
  }
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(amount)} đồng`;
}

export function formatPublicDate(value?: string) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN").format(date);
}

export function sumProjectMoney(projects: PublicProjectRecord[]) {
  return projects.reduce((sum, project) => sum + projectMoney(project), 0);
}

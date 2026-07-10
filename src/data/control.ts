export type ApprovalStatus = "Chờ duyệt" | "Đã duyệt" | "Từ chối";
export type ApprovalPriority = "Khẩn" | "Cao" | "Bình thường";

export type ApprovalItem = {
  id: string;
  title: string;
  project: string;
  requester: string;
  department: string;
  submittedAt: string;
  deadline: string;
  priority: ApprovalPriority;
  status: ApprovalStatus;
  amount?: string;
};

export type TaskStatus = "Chưa làm" | "Đang làm" | "Chờ duyệt" | "Hoàn thành";
export type TaskItem = {
  id: string;
  title: string;
  project: string;
  assignee: string;
  due: string;
  status: TaskStatus;
  priority: "Cao" | "Trung bình" | "Thấp";
  progress: number;
};

export type UserRole = "Quản trị hệ thống" | "Ban lãnh đạo" | "Quản lý dự án" | "Kỹ thuật" | "Chủ đầu tư";
export type SystemUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  status: "Đang hoạt động" | "Tạm khóa" | "Chờ kích hoạt";
  lastSeen: string;
  initials: string;
};

export type ActivityItem = {
  id: string;
  actor: string;
  action: string;
  object: string;
  module: string;
  time: string;
  ip: string;
  level: "Thông tin" | "Quan trọng" | "Cảnh báo";
};

export const approvals: ApprovalItem[] = [];
export const tasks: TaskItem[] = [];
export const systemUsers: SystemUser[] = [];
export const activityLog: ActivityItem[] = [];
export const notifications: { id: string; title: string; detail: string; time: string; type: "risk" | "approval" | "document" | "warranty"; href: string; unread: boolean }[] = [];

export type TailgTone = "green" | "yellow" | "red" | "blue" | "slate";

export type TailgTeam = {
  id: string;
  leader: string;
  shortName: string;
  responsibility: string[];
  progressNotes: string[];
  tone: TailgTone;
  priority: string;
};

export type TailgMilestone = {
  id: string;
  label: string;
  start: string;
  finish: string;
  scope: string;
  status: "done" | "active" | "upcoming";
  note?: string;
};

export type TailgProgressKey =
  | "duc_x1"
  | "duc_x2"
  | "toan_x1"
  | "toan_tran_x1"
  | "tuan_x1"
  | "quang_x3"
  | "quang_parking_foundation"
  | "quang_parking_beam"
  | "quang_parking_column"
  | "tho_x3"
  | "tho_infrastructure";

export type TailgProgressField = {
  key: TailgProgressKey;
  label: string;
  owner: string;
  area: string;
  baseline: number | null;
  note?: string;
};

export const tailgProject = {
  code: "TAILG-VN",
  name: "Dự án Nhà máy TAILG (Việt Nam)",
  contractor: "LICOGI 18.3",
  reportDate: "05/09/2026",
  scheduleStart: "15/07/2026",
  scheduleFinish: "30/06/2027",
  officialDurationDays: 341,
  stage1Finish: "30/03/2027",
  stage2Finish: "02/06/2027",
  sourceNote: "Biểu tiến độ thi công TAILG + ảnh hiện trường cập nhật 05/09/2026",
} as const;

export const tailgProgressFields: TailgProgressField[] = [
  { key: "duc_x1", label: "1/4 Xưởng 1", owner: "Bùi Văn Đức", area: "Xưởng 1", baseline: 92 },
  { key: "duc_x2", label: "Xưởng 2", owner: "Bùi Văn Đức", area: "Xưởng 2", baseline: 15 },
  { key: "toan_x1", label: "1/4 Xưởng 1", owner: "Tăng Văn Toán", area: "Xưởng 1", baseline: 92 },
  { key: "toan_tran_x1", label: "1/4 Xưởng 1", owner: "Trần Văn Toãn", area: "Xưởng 1", baseline: 85 },
  { key: "tuan_x1", label: "1/4 Xưởng 1", owner: "Nguyễn Văn Tuần", area: "Xưởng 1", baseline: 85 },
  { key: "quang_x3", label: "1/2 Xưởng 3", owner: "Nguyễn Ánh Quang", area: "Xưởng 3", baseline: 0 },
  { key: "quang_parking_foundation", label: "Đài móng nhà xe", owner: "Nguyễn Ánh Quang", area: "Nhà xe", baseline: 83.4, note: "38/44 đài móng" },
  { key: "quang_parking_beam", label: "Dầm móng nhà xe", owner: "Nguyễn Ánh Quang", area: "Nhà xe", baseline: 30 },
  { key: "quang_parking_column", label: "Cột nhà xe", owner: "Nguyễn Ánh Quang", area: "Nhà xe", baseline: 30, note: "15/50 cột" },
  { key: "tho_x3", label: "1/2 Xưởng 3", owner: "Nguyễn Duy Thọ", area: "Xưởng 3", baseline: 0 },
  { key: "tho_infrastructure", label: "Hạ tầng", owner: "Nguyễn Duy Thọ", area: "Hạ tầng", baseline: null, note: "Chỉ nhập khi có số liệu định lượng được xác nhận" },
];

export const tailgTeams: TailgTeam[] = [
  {
    id: "duc",
    leader: "Bùi Văn Đức",
    shortName: "Đức",
    responsibility: ["1/4 Xưởng 1", "Xưởng 2"],
    progressNotes: ["Xưởng 1: 92%", "Xưởng 2: 15%"],
    tone: "green",
    priority: "Khóa phần còn lại của 1/4 Xưởng 1 trước mốc hoàn thành móng; đồng thời giữ nhịp Xưởng 2.",
  },
  {
    id: "toan",
    leader: "Tăng Văn Toán",
    shortName: "Toán",
    responsibility: ["1/4 Xưởng 1"],
    progressNotes: ["Xưởng 1: 92%"],
    tone: "green",
    priority: "Hoàn tất phần móng còn lại, chuẩn bị chuyển mặt bằng sang công tác kết cấu tầng 1.",
  },
  {
    id: "toan-tran",
    leader: "Trần Văn Toãn",
    shortName: "Toãn",
    responsibility: ["1/4 Xưởng 1"],
    progressNotes: ["Xưởng 1: 85%"],
    tone: "yellow",
    priority: "Tăng tốc 15% khối lượng còn lại của phân khu Xưởng 1 để bám mốc 07/09/2026.",
  },
  {
    id: "tuan",
    leader: "Nguyễn Văn Tuần",
    shortName: "Tuần",
    responsibility: ["1/4 Xưởng 1"],
    progressNotes: ["Xưởng 1: 85%"],
    tone: "yellow",
    priority: "Tập trung phần móng còn lại và phối hợp bàn giao mặt bằng cho bước kết cấu tiếp theo.",
  },
  {
    id: "quang",
    leader: "Nguyễn Ánh Quang",
    shortName: "Quang",
    responsibility: ["1/2 Xưởng 3", "Nhà ăn", "Nhà xe", "Bể ngầm", "Bể XLNT"],
    progressNotes: ["Xưởng 3: 0%", "Nhà xe: 38/44 đài móng ≈ 83,4%", "Nhà xe: dầm móng ≈ 30%", "Nhà xe: 15/50 cột ≈ 30%"],
    tone: "yellow",
    priority: "Mở mặt trận 1/2 Xưởng 3 song song với việc hoàn thiện nhà xe; kiểm soát chặt nhiều đầu việc phụ trợ cùng lúc.",
  },
  {
    id: "tho",
    leader: "Nguyễn Duy Thọ",
    shortName: "Thọ",
    responsibility: ["1/2 Xưởng 3", "Hạ tầng"],
    progressNotes: ["Xưởng 3: 0%", "Hạ tầng: chưa có % xác nhận trong ảnh/file"],
    tone: "yellow",
    priority: "Khởi động rõ sản lượng 1/2 Xưởng 3 và tách kế hoạch hạ tầng theo tuyến/khối lượng để theo dõi hàng ngày.",
  },
];

export const tailgMilestones: TailgMilestone[] = [
  {
    id: "overall",
    label: "Tổng tiến độ dự án",
    start: "15/07/2026",
    finish: "30/06/2027",
    scope: "Toàn dự án",
    status: "active",
    note: "Thời lượng chính thức 341 ngày theo biểu tiến độ.",
  },
  {
    id: "factory1-foundation",
    label: "Hoàn thành công tác móng Xưởng 1",
    start: "16/07/2026",
    finish: "07/09/2026",
    scope: "Xưởng 1",
    status: "active",
    note: "Mốc gần nhất; ảnh hiện trường 05/09 cho thấy 4 phân khu đạt 85%–92%.",
  },
  {
    id: "factory1-floor1-structure",
    label: "Kết cấu tầng 1 Xưởng 1",
    start: "24/08/2026",
    finish: "08/10/2026",
    scope: "Xưởng 1",
    status: "active",
  },
  {
    id: "factory23-foundation",
    label: "Công tác móng Xưởng 2 + 3",
    start: "29/08/2026",
    finish: "08/11/2026",
    scope: "Xưởng 2 + 3",
    status: "active",
    note: "Ép cọc thí nghiệm 29/08–09/09; ép cọc đại trà 31/08–14/10.",
  },
  {
    id: "stage1-outdoor",
    label: "Ngoài nhà đồng bộ giai đoạn 1",
    start: "30/07/2026",
    finish: "06/03/2027",
    scope: "Bể ngầm · thoát nước · đường nội bộ · nhà phụ trợ · cơ điện",
    status: "active",
    note: "Các bể ngầm và hệ thống thoát nước theo kế hoạch 30/07–30/11/2026.",
  },
  {
    id: "stage1",
    label: "Hoàn thành thi công giai đoạn 1",
    start: "07/03/2027",
    finish: "30/03/2027",
    scope: "Giai đoạn 1",
    status: "upcoming",
  },
  {
    id: "stage2",
    label: "Hoàn thành giai đoạn 2",
    start: "29/08/2026",
    finish: "02/06/2027",
    scope: "Xưởng 2 + 3 và phần còn lại",
    status: "active",
  },
  {
    id: "commissioning",
    label: "Sửa lỗi & nghiệm thu đưa vào sử dụng",
    start: "25/05/2027",
    finish: "30/06/2027",
    scope: "Toàn dự án",
    status: "upcoming",
    note: "Bao gồm nghiệm thu PCCC 25/05–13/06/2027 và nghiệm thu hoàn thành 14/06–29/06/2027.",
  },
  {
    id: "handover",
    label: "Bàn giao công trình đưa vào sử dụng",
    start: "30/06/2027",
    finish: "30/06/2027",
    scope: "Toàn dự án",
    status: "upcoming",
  },
];

export const tailgWorkfronts = [
  {
    id: "factory1",
    label: "Xưởng 1",
    value: "88,5%",
    sublabel: "Bình quân 4 phân khu",
    detail: "Đức 92% · Toán 92% · Toãn 85% · Tuần 85%",
    tone: "yellow" as TailgTone,
  },
  {
    id: "factory2",
    label: "Xưởng 2",
    value: "15%",
    sublabel: "Bùi Văn Đức phụ trách",
    detail: "Đang trong giai đoạn công tác móng/ép cọc theo tiến độ tổng.",
    tone: "blue" as TailgTone,
  },
  {
    id: "factory3",
    label: "Xưởng 3",
    value: "0%",
    sublabel: "Quang 1/2 · Thọ 1/2",
    detail: "Cần mở sản lượng rõ theo hai nửa mặt bằng; mốc móng Xưởng 2+3 kết thúc 08/11/2026.",
    tone: "red" as TailgTone,
  },
  {
    id: "parking",
    label: "Nhà xe",
    value: "83,4%",
    sublabel: "38/44 đài móng",
    detail: "Dầm móng ≈ 30% · 15/50 cột ≈ 30% · Nguyễn Ánh Quang phụ trách.",
    tone: "green" as TailgTone,
  },
] as const;

export const tailgDirectorAlerts = [
  {
    title: "Móng Xưởng 1 sát mốc 07/09/2026",
    detail: "Ảnh 05/09 cho thấy hai phân khu còn ở 85%; cần chốt sản lượng còn lại theo ca và điều kiện bàn giao.",
    tone: "red" as TailgTone,
  },
  {
    title: "Xưởng 3 chưa ghi nhận sản lượng",
    detail: "Hai nửa Xưởng 3 của đội Quang và Thọ đang 0% trong khi gói móng Xưởng 2+3 đã bắt đầu từ 29/08/2026.",
    tone: "red" as TailgTone,
  },
  {
    title: "Đội Quang có nhiều mặt trận song song",
    detail: "1/2 Xưởng 3, nhà ăn, nhà xe, bể ngầm và bể XLNT cần được tách kế hoạch ngày/tuần để tránh mất trọng tâm.",
    tone: "yellow" as TailgTone,
  },
  {
    title: "Hạ tầng chưa có % xác nhận",
    detail: "Đội Thọ phụ trách hạ tầng nhưng ảnh/file hiện tại chưa đủ số liệu định lượng; dashboard phải hiển thị thiếu dữ liệu thay vì tự tạo số.",
    tone: "blue" as TailgTone,
  },
] as const;

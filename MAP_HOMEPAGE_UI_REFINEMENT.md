# Homepage & Map refinement

## Mục tiêu
- Cho phép zoom bản đồ bằng lăn chuột/trackpad.
- Đưa video năng lực sang cột trái của hero.
- Tăng chiều sâu dữ liệu năng lực bằng KPI, tỷ lệ tiến độ, giá trị hợp đồng, cơ cấu trạng thái và phân bổ lĩnh vực.
- Chuẩn hóa typography cho tiếng Việt và giảm cảm giác landing page do AI sinh.

## Thay đổi
- `MapViewportController`: bật wheel zoom, double-click zoom và touch zoom; vẫn giữ khung Việt Nam mặc định khi chưa lọc.
- `PublicLiveMetrics`: bổ sung tiến độ bình quân, tỷ lệ hoàn thành, tổng giá trị hợp đồng ghi nhận, biểu đồ trạng thái và biểu đồ lĩnh vực; các phần có thể bấm để lọc map.
- `home-overview.css`: video nằm cột trái, dashboard nằm cột phải; giảm pill/gradient/bo góc và làm layout corporate hơn.
- `vietnamese-typography.css`: dùng Segoe UI Variable / Segoe UI / Noto Sans / Arial, giảm uppercase và font-weight quá nặng, giữ hỗ trợ đầy đủ tiếng Việt.

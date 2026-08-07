# Bulk UI & Catalog Upgrade

Lượt nâng cấp sau PR #2 tập trung vào khả năng quản trị danh mục dài và sự nhất quán giao diện.

## Đã nâng cấp

- Danh mục dùng `EnterpriseModuleConsole`: chọn dòng, chọn tất cả, xóa từng bản ghi, xóa hàng loạt, sticky header/action và vùng cuộn riêng.
- Dự án: chọn/xóa hàng loạt ở cả bảng và thẻ; danh sách dài có scroll.
- Đối tác: DELETE API theo mã, chọn/xóa hàng loạt, card list có scroll.
- Tài khoản: DELETE API hàng loạt, chặn xóa tài khoản đang đăng nhập, bảng sticky + scroll.
- Công việc: DELETE API hàng loạt, mỗi cột Kanban có scroll, xóa từng việc hoặc nhiều việc.
- Bảo hành: chọn/xóa hàng loạt qua Data Center API, bảng sticky + scroll.
- Hồ sơ: chọn/xóa hàng loạt qua Data Center API, bảng sticky + scroll.
- Data Center giữ nguyên các chức năng xóa nhiều/xóa toàn bộ/sửa nhiều đã có.
- Chuẩn hóa button, icon button, bo góc, hover/focus, scrollbar và modal dài.
- GIS public/admin: viewport ổn định hơn, validate tọa độ, fit bounds có padding, zoom 0.5 bước và thước tỷ lệ metric.

## Quy tắc an toàn

- Xóa hàng loạt luôn yêu cầu xác nhận.
- API xóa được giới hạn theo organization/permission hiện tại.
- Tài khoản đang đăng nhập không thể tự xóa.
- Đăng nhập demo và đăng ký từ PR #2 không bị thay đổi trong lượt này.

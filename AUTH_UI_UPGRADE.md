# UI & Authentication Polish

## Bản đồ
- Giảm zoom khi chọn marker từ mức rất gần xuống mức vùng/tỉnh.
- Giới hạn auto-fit để một hoặc vài dự án không phóng quá sát.
- Rút gọn toolbar, popup, legend và các nhãn đồng bộ dư thừa.
- Đồng bộ cách hiển thị giữa bản đồ công khai và bản đồ quản trị.

## Đăng nhập
- Màn hình đăng nhập mới gọn như các SaaS hiện đại.
- Nút `Vào bản demo` đăng nhập một chạm, không cần hiện danh sách mật khẩu seed.
- Giữ hỗ trợ redirect `?next=` sau khi đăng nhập.
- Thông báo sai tài khoản/mật khẩu được gom chung để tránh lộ trạng thái tài khoản.
- Tôn trọng `mustChangePassword` thay vì bỏ qua.

## Đăng ký
- Thêm `/register` và `/api/auth/register`.
- Tài khoản tự đăng ký luôn nhận role `CUSTOMER`; không thể tự chọn quyền admin.
- Tạo Customer tương ứng, ghi audit log, sau đó tự đăng nhập và chuyển vào Portal.

## Sau đăng nhập
- Topbar gọn hơn.
- Menu avatar theo kiểu SaaS: trang chính theo role, tài khoản/cài đặt nếu có quyền, website công khai và đăng xuất.
- Đăng xuất xong chuyển thẳng về `/login`.

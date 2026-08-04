# BÀI TẬP LỚN MÔN PHÁT TRIỂN ỨNG DỤNG WEB CT449

## THÔNG TIN CHUNG
- Đại học Cần Thơ
- Trường Công nghệ thông tin và Truyền thông
- Bài tập lớn môn: Phát triển ứng dụng Web CT449

## THÔNG TIN SINH VIÊN
- Tên sinh viên: Huỳnh Ngọc Phi Yến
- Mã số sinh viên: B2308407

## GIẢNG VIÊN HƯỚNG DẪN
- ThS. Nguyễn Minh Trung

## MÔ TẢ HỆ THỐNG
Dự án là Hệ thống quản lý thư viện trực tuyến, cung cấp nền tảng số hóa cho các nghiệp vụ thư viện cơ bản. Hệ thống hỗ trợ quản lý danh mục, sách, bản sao sách, nhà xuất bản, và quản lý người dùng với phân quyền chặt chẽ (Quản trị viên, Nhân viên, Độc giả). Nổi bật với quy trình mượn/trả sách tự động hóa, theo dõi tình trạng mượn, cảnh báo sắp đến hạn và tự động xử lý tiền phạt quá hạn.

## CÔNG NGHỆ SỬ DỤNG
- **Frontend**: Vue.js 3 (Composition API), Vite, Vue Router, Pinia
- **Backend**: Node.js, Express.js
- **Cơ sở dữ liệu**: MongoDB (Mongoose ODM)
- **Bảo mật**: JSON Web Token (JWT) cho xác thực, bcrypt mã hóa mật khẩu
- **Tự động hóa (Cron Job)**: Sử dụng node-cron để xử lý kiểm tra và cập nhật trạng thái phiếu mượn quá hạn mỗi ngày.
- **Xử lý file**: Multer (Upload hình ảnh)

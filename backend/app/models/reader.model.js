const mongoose = require('mongoose');

/**
 * DocGia – Hồ sơ độc giả, liên kết 1-1 với TaiKhoan
 */
const docGiaSchema = new mongoose.Schema(
    {
        MaTaiKhoan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        HoTen: {
            type: String,
            required: [true, 'Họ tên không được bỏ trống'],
            trim: true,
        },
        NgaySinh: {
            type: Date,
        },
        Phai: {
            type: String,
            enum: ['Nam', 'Nu', 'Khac'],
        },
        DiaChi: {
            type: String,
            trim: true,
        },
        DienThoai: {
            type: String,
            required: [true, 'Số điện thoại không được bỏ trống'],
            trim: true,
        },
        /**
         * TrangThaiHoSo – Trạng thái xác minh hồ sơ độc giả:
         * - ChuaXacMinh : Tự đăng ký online, chờ nhân viên xác minh CCCD tại quầy
         * - DaXacMinh   : Đã xác minh, được phép tạo phiếu mượn
         * - BiKhoa      : Bị khóa do vi phạm quy định
         */
        TrangThaiHoSo: {
            type: String,
            enum: ['ChuaXacMinh', 'DaXacMinh', 'BiKhoa'],
            default: 'ChuaXacMinh',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('DocGia', docGiaSchema);
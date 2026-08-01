const mongoose = require('mongoose');

/**
 * NhanVien – Hồ sơ nhân viên thư viện, liên kết 1-1 với TaiKhoan
 */
const nhanVienSchema = new mongoose.Schema(
    {
        MaTaiKhoan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        HoTenNV: {
            type: String,
            required: [true, 'Họ tên nhân viên không được bỏ trống'],
            trim: true,
        },
        ChucVu: {
            type: String,
            trim: true,
        },
        DiaChi: {
            type: String,
            trim: true,
        },
        SoDienThoai: {
            type: String,
            trim: true,
        },
        TrangThai: {
            type: String,
            enum: ['DangLamViec', 'NghiViec'],
            default: 'DangLamViec',
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('NhanVien', nhanVienSchema);

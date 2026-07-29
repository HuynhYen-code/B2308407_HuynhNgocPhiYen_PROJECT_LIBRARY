const mongoose = require('mongoose');

/**
 * ThongBao – Thông báo nội bộ gửi đến hộp thư của TaiKhoan
 */
const thongBaoSchema = new mongoose.Schema(
    {
        MaTaiKhoan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        TieuDe: {
            type: String,
            required: [true, 'Tiêu đề thông báo không được bỏ trống'],
            trim: true,
        },
        NoiDung: {
            type: String,
            required: [true, 'Nội dung thông báo không được bỏ trống'],
            trim: true,
        },
        DaDoc: {
            type: Boolean,
            default: false,
        },
        NgayTao: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: false } // Dùng NgayTao thay cho createdAt để đúng ERD
);

module.exports = mongoose.model('ThongBao', thongBaoSchema);

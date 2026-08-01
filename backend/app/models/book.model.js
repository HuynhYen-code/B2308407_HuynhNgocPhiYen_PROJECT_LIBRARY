const mongoose = require('mongoose');

/**
 * DauSach – Đầu sách (thông tin chung), không phải bản vật lý cụ thể
 */
const dauSachSchema = new mongoose.Schema(
    {
        TenSach: {
            type: String,
            required: [true, 'Tên sách không được bỏ trống'],
            trim: true,
        },
        TacGia: {
            type: [String],
            required: [true, 'Tên tác giả không được bỏ trống'],
        },
        TheLoaiIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'TheLoai',
            },
        ],
        NamXuatBan: {
            type: Number,
        },
        NhaXuatBanId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'NhaXuatBan',
        },
        DonGia: {
            type: Number,
            min: [0, 'Đơn giá không thể âm'],
        },
        MoTa: {
            type: String,
            trim: true,
        },
        HinhAnh: {
            type: String,
            trim: true,
        },
        LuotMuon: {
            type: Number,
            default: 0,
        }
    },
    { timestamps: true }
);

// Index hỗ trợ tìm kiếm full-text theo tên sách và tác giả
dauSachSchema.index({ TenSach: 'text', TacGia: 'text' });

module.exports = mongoose.model('DauSach', dauSachSchema);

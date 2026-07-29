const mongoose = require('mongoose');

/**
 * NhaXuatBan – Nhà xuất bản
 */
const nhaXuatBanSchema = new mongoose.Schema(
    {
        TenNXB: {
            type: String,
            required: [true, 'Tên nhà xuất bản không được bỏ trống'],
            trim: true,
            unique: true,
        },
        DiaChi: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('NhaXuatBan', nhaXuatBanSchema);

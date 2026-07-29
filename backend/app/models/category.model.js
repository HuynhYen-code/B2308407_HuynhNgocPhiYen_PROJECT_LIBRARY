const mongoose = require('mongoose');

/**
 * TheLoai – Thể loại sách
 */
const theLoaiSchema = new mongoose.Schema(
    {
        TenTheLoai: {
            type: String,
            required: [true, 'Tên thể loại không được bỏ trống'],
            trim: true,
            unique: true,
        },
        MoTa: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('TheLoai', theLoaiSchema);

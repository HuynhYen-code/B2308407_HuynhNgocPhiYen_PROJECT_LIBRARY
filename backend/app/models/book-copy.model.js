const mongoose = require('mongoose');

/**
 * CuonSach – Bản sao vật lý của một đầu sách.
 * Mỗi CuonSach có mã định danh riêng (chuỗi mã vạch/số sê-ri).
 */
const cuonSachSchema = new mongoose.Schema(
    {
        // _id của MongoDB sẽ được dùng làm CuonSachId (String) trong PhieuMuon
        DauSachId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DauSach',
            required: [true, 'Đầu sách không được bỏ trống'],
        },
        TinhTrangVatLy: {
            type: String,
            trim: true,
            default: 'Tốt',
        },
        /**
         * TrangThai – Trạng thái hiện tại của cuốn sách:
         * - SanSang  : Có sẵn, sẵn sàng cho mượn
         * - Pending  : Đang chờ nhân viên duyệt phiếu mượn
         * - DangMuon : Đang được mượn
         * - HongMat  : Hỏng hoặc mất
         */
        TrangThai: {
            type: String,
            enum: ['SanSang', 'Pending', 'DangMuon', 'HongMat'],
            default: 'SanSang',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('CuonSach', cuonSachSchema);

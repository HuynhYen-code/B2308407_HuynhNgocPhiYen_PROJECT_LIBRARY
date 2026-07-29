const mongoose = require('mongoose');

/**
 * Embedded_ChiTietMuon – Chi tiết từng cuốn sách trong phiếu mượn
 */
const chiTietMuonSchema = new mongoose.Schema(
    {
        /**
         * CuonSachId – ID vật lý của cuốn sách (String vì ERD định nghĩa là String,
         * trong thực tế sẽ lưu ObjectId.toString() của CuonSach)
         */
        CuonSachId: {
            type: String,
            required: [true, 'Mã cuốn sách không được bỏ trống'],
        },
        // Hạn trả dự kiến
        HanTra: {
            type: Date,
            required: true,
        },
        // Ngày trả thực tế (null nếu chưa trả)
        NgayTraThucTe: {
            type: Date,
            default: null,
        },
        // Số lần đã gia hạn
        SoLanGiaHan: {
            type: Number,
            default: 0,
        },
        // Tiền phạt tích lũy (VNĐ) – cron job cập nhật mỗi ngày khi QuaHan
        TienPhat: {
            type: Number,
            default: 0,
        },
        GhiChu: {
            type: String,
            default: '',
        },
        /**
         * TrangThaiChiTiet:
         * - DangMuon  : Đang trong thời hạn mượn
         * - SapDenHan : Còn 2 ngày đến hạn (cron set)
         * - QuaHan    : Đã quá hạn trả (cron set)
         * - DaTraDung : Đã trả đúng hạn
         * - DaTraTre  : Đã trả nhưng bị trễ (có TienPhat)
         */
        TrangThaiChiTiet: {
            type: String,
            enum: ['DangMuon', 'SapDenHan', 'QuaHan', 'DaTraDung', 'DaTraTre'],
            default: 'DangMuon',
        },
    },
    { _id: true }
);

/**
 * PhieuMuon – Phiếu mượn sách
 */
const phieuMuonSchema = new mongoose.Schema(
    {
        DocGiaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DocGia',
            required: true,
        },
        // NhanVienId được set khi nhân viên duyệt phiếu
        NhanVienId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'NhanVien',
            default: null,
        },
        NgayLapPhieu: {
            type: Date,
            default: Date.now,
        },
        /**
         * TrangThaiPhieu:
         * - ChoDuyet   : Độc giả vừa tạo, chờ nhân viên duyệt
         * - DangMuon   : Nhân viên đã duyệt, sách đang được mượn
         * - DaHoanTat  : Tất cả sách đã được trả
         * - DaHuy      : Nhân viên từ chối hoặc hủy phiếu
         */
        TrangThaiPhieu: {
            type: String,
            enum: ['ChoDuyet', 'DangMuon', 'DaHoanTat', 'DaHuy'],
            default: 'ChoDuyet',
        },
        ChiTiet: [chiTietMuonSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model('PhieuMuon', phieuMuonSchema);
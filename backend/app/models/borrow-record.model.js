const mongoose = require('mongoose');

/**
 * Embedded_ChiTietMuon – Chi tiết từng đầu sách trong phiếu mượn
 *
 * Flow mới:
 *  - Khi độc giả tạo phiếu: DauSachId (bắt buộc), CuonSachId = null (chưa gán)
 *  - Khi nhân viên duyệt:   CuonSachId được gán + HanTra được set
 */
const chiTietMuonSchema = new mongoose.Schema(
    {
        /** DauSachId – Đầu sách (title) mà độc giả muốn mượn */
        DauSachId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DauSach',
            required: [true, 'Mã đầu sách không được bỏ trống'],
        },
        /**
         * CuonSachId – Bản sao vật lý được nhân viên gán khi duyệt.
         * null = chưa được gán (phiếu đang chờ duyệt)
         */
        CuonSachId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CuonSach',
            default: null,
        },
        // Hạn trả dự kiến (set khi nhân viên duyệt)
        HanTra: {
            type: Date,
            default: null,
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
         * - ChoGanBan  : Chờ nhân viên gán bản copy (mới tạo, chưa duyệt)
         * - DangMuon   : Đang trong thời hạn mượn
         * - SapDenHan  : Còn 2 ngày đến hạn (cron set)
         * - QuaHan     : Đã quá hạn trả (cron set)
         * - DaTraDung  : Đã trả đúng hạn
         * - DaTraTre   : Đã trả nhưng bị trễ (có TienPhat)
         * - DaHuy      : Phiếu mượn bị hủy / từ chối
         */
        TrangThaiChiTiet: {
            type: String,
            enum: ['ChoGanBan', 'DangMuon', 'SapDenHan', 'QuaHan', 'DaTraDung', 'DaTraTre', 'DaHuy'],
            default: 'ChoGanBan',
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
         * - ChoDuyet   : Độc giả vừa tạo, chờ nhân viên duyệt & gán bản copy
         * - DangMuon   : Nhân viên đã duyệt + gán bản copy, sách đang được mượn
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

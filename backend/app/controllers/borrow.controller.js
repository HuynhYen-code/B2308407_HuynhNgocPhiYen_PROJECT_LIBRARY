const PhieuMuon = require('../models/borrow-record.model');
const DocGia = require('../models/reader.model');
const NhanVien = require('../models/staff.model');
const CuonSach = require('../models/book-copy.model');
const ThongBao = require('../models/notification.model');
const config = require('../config');
const ApiError = require('../utils/api-error');

const { finePerDay, maxRenewTimes, loanDurationDays } = config.library;

// ─────────────────────────────────────────────────────────────
// HELPER: Tạo thông báo nội bộ cho một TaiKhoan
// ─────────────────────────────────────────────────────────────
async function createNotification(maTaiKhoan, tieuDe, noiDung) {
    try {
        await ThongBao.create({ MaTaiKhoan: maTaiKhoan, TieuDe: tieuDe, NoiDung: noiDung });
    } catch (err) {
        console.error('[Notification Error]', err.message);
    }
}

// ─────────────────────────────────────────────────────────────
// GET /api/borrows
// Danh sách phiếu mượn (Staff/Admin), lọc theo trạng thái / độc giả
// ─────────────────────────────────────────────────────────────
exports.getAll = async (req, res, next) => {
    try {
        const { trangThai, docGiaId, search, ngayLap, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {};
        if (trangThai) {
            if (trangThai === 'QuaHan') {
                filter.TrangThaiPhieu = 'DangMuon';
                filter['ChiTiet.TrangThaiChiTiet'] = 'QuaHan';
            } else {
                filter.TrangThaiPhieu = trangThai;
            }
        }
        if (docGiaId) filter.DocGiaId = docGiaId;

        if (ngayLap) {
            const date = new Date(ngayLap);
            if (!isNaN(date)) {
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);
                filter.NgayLapPhieu = { $gte: startOfDay, $lte: endOfDay };
            }
        }

        if (search) {
            const regex = new RegExp(search, 'i');
            const readers = await DocGia.find({
                $or: [{ HoTen: regex }, { DienThoai: regex }]
            }).select('_id');
            const readerIds = readers.map(r => r._id);

            filter.$or = [
                { DocGiaId: { $in: readerIds } },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: '$_id' },
                            regex: search,
                            options: 'i'
                        }
                    }
                }
            ];
        }

        const [records, total] = await Promise.all([
            PhieuMuon.find(filter)
                .populate({ path: 'DocGiaId', select: 'HoTen DienThoai' })
                .populate({ path: 'NhanVienId', select: 'HoTenNV ChucVu' })
                .populate({ path: 'ChiTiet.DauSachId', select: 'TenSach TacGia HinhAnh' })
                .populate({ path: 'ChiTiet.CuonSachId', select: 'TinhTrangVatLy TrangThai' })
                .sort({ createdAt: -1, _id: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            PhieuMuon.countDocuments(filter),
        ]);

        const mappedRecords = records.map((r) => {
            const obj = r.toObject();
            if (obj.TrangThaiPhieu === 'DangMuon' && obj.ChiTiet && obj.ChiTiet.some(ct => ct.TrangThaiChiTiet === 'QuaHan')) {
                obj.TrangThaiPhieu = 'QuaHan';
            }
            return obj;
        });

        return res.status(200).json({
            data: mappedRecords,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi lấy danh sách phiếu mượn'));
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/borrows/my
// Độc giả xem phiếu mượn của chính mình
// ─────────────────────────────────────────────────────────────
exports.getMy = async (req, res, next) => {
    try {
        const reader = await DocGia.findOne({ MaTaiKhoan: req.user.id });
        if (!reader) return next(new ApiError(404, 'Bạn chưa có hồ sơ độc giả'));

        const records = await PhieuMuon.find({ DocGiaId: reader._id })
            .populate({ path: 'NhanVienId', select: 'HoTenNV' })
            .populate({ path: 'ChiTiet.DauSachId', select: 'TenSach TacGia HinhAnh' })
            .populate({ path: 'ChiTiet.CuonSachId', select: 'TinhTrangVatLy TrangThai' })
            .sort({ createdAt: -1 });

        const mappedRecords = records.map((r) => {
            const obj = r.toObject();
            if (obj.TrangThaiPhieu === 'DangMuon' && obj.ChiTiet && obj.ChiTiet.some(ct => ct.TrangThaiChiTiet === 'QuaHan')) {
                obj.TrangThaiPhieu = 'QuaHan';
            }
            return obj;
        });

        return res.status(200).json({ data: mappedRecords });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi lấy phiếu mượn'));
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/borrows/:id
// Chi tiết phiếu mượn
// ─────────────────────────────────────────────────────────────
exports.getById = async (req, res, next) => {
    try {
        const record = await PhieuMuon.findById(req.params.id)
            .populate({ path: 'DocGiaId', select: 'HoTen DienThoai DiaChi' })
            .populate({ path: 'NhanVienId', select: 'HoTenNV ChucVu' })
            .populate({ path: 'ChiTiet.DauSachId', select: 'TenSach TacGia HinhAnh' })
            .populate({ path: 'ChiTiet.CuonSachId', select: 'TinhTrangVatLy TrangThai' });
        if (!record) return next(new ApiError(404, 'Không tìm thấy phiếu mượn'));

        // Phân quyền: Reader chỉ xem phiếu của chính mình
        if (req.user.role === 'Reader') {
            const myReader = await DocGia.findOne({ MaTaiKhoan: req.user.id });
            if (!myReader || record.DocGiaId._id.toString() !== myReader._id.toString()) {
                return next(new ApiError(403, 'Bạn không có quyền xem phiếu mượn này'));
            }
        }

        const obj = record.toObject();
        if (obj.TrangThaiPhieu === 'DangMuon' && obj.ChiTiet && obj.ChiTiet.some(ct => ct.TrangThaiChiTiet === 'QuaHan')) {
            obj.TrangThaiPhieu = 'QuaHan';
        }

        return res.status(200).json({ data: obj });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi lấy thông tin phiếu mượn'));
    }
};

// ─────────────────────────────────────────────────────────────
// POST /api/borrows
// Độc giả tạo yêu cầu mượn sách.
// Body: { dauSachIds: [ObjectId, ...] } – Danh sách đầu sách muốn mượn.
// Độc giả KHÔNG chọn bản copy – nhân viên sẽ gán khi duyệt.
// ─────────────────────────────────────────────────────────────
exports.create = async (req, res, next) => {
    try {
        const { dauSachIds } = req.body;

        if (!dauSachIds || !Array.isArray(dauSachIds) || dauSachIds.length === 0) {
            return next(new ApiError(400, 'Danh sách đầu sách mượn không hợp lệ'));
        }

        // Tìm hồ sơ độc giả
        const reader = await DocGia.findOne({ MaTaiKhoan: req.user.id });
        if (!reader) {
            return next(new ApiError(404, 'Bạn chưa có hồ sơ độc giả. Vui lòng tạo hồ sơ trước.'));
        }

        // ── GUARD: Kiểm tra trạng thái hồ sơ ──────────────────────────
        if (reader.TrangThaiHoSo === 'ChuaXacMinh') {
            return next(new ApiError(403,
                'Hồ sơ của bạn chưa được xác minh. ' +
                'Vui lòng mang CCCD/CMND đến quầy thư viện để nhân viên kích hoạt tài khoản mượn sách.'
            ));
        }
        if (reader.TrangThaiHoSo === 'BiKhoa') {
            return next(new ApiError(403,
                'Tài khoản mượn sách của bạn đã bị khóa. Vui lòng liên hệ nhân viên thư viện để được hỗ trợ.'
            ));
        }
        // ── END GUARD ──────────────────────────────────────────────────

        // Không cho phép có 2 phiếu ChoDuyet cùng lúc
        const pendingRecord = await PhieuMuon.findOne({
            DocGiaId: reader._id,
            TrangThaiPhieu: 'ChoDuyet',
        });
        if (pendingRecord) {
            return next(new ApiError(400, 'Bạn đã có yêu cầu mượn đang chờ duyệt. Vui lòng chờ nhân viên xử lý.'));
        }

        // Kiểm tra từng đầu sách có tồn tại và còn bản sẵn sàng không
        const DauSach = require('../models/book.model');
        const availabilityChecks = await Promise.all(
            dauSachIds.map(async (dauSachId) => {
                const ds = await DauSach.findById(dauSachId);
                if (!ds) return { ok: false, msg: `Không tìm thấy đầu sách ID: ${dauSachId}` };
                const sobanSanSang = await CuonSach.countDocuments({ DauSachId: dauSachId, TrangThai: 'SanSang' });
                if (sobanSanSang === 0) return { ok: false, msg: `"${ds.TenSach}" hiện không có bản nào sẵn sàng để mượn.` };
                return { ok: true };
            })
        );

        const failed = availabilityChecks.find(c => !c.ok);
        if (failed) return next(new ApiError(400, failed.msg));

        // Tạo ChiTiet: chỉ có DauSachId, CuonSachId = null (staff gán sau)
        const chiTiet = dauSachIds.map((id) => ({
            DauSachId: id,
            CuonSachId: null,
            HanTra: null,
            TrangThaiChiTiet: 'ChoGanBan',
        }));

        // Tạo phiếu mượn
        const phieu = await PhieuMuon.create({
            DocGiaId: reader._id,
            ChiTiet: chiTiet,
        });

        // Gửi thông báo cho độc giả
        await createNotification(
            req.user.id,
            'Yêu cầu mượn sách đã được ghi nhận',
            `Phiếu mượn #${phieu._id} của bạn đang chờ nhân viên thư viện duyệt. Vui lòng chờ xác nhận.`
        );

        return res.status(201).json({
            data: phieu,
            message: 'Tạo yêu cầu mượn sách thành công. Vui lòng chờ nhân viên duyệt.',
        });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi tạo phiếu mượn'));
    }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/borrows/:id/approve
// Nhân viên duyệt phiếu mượn và GÁN bản copy cho từng đầu sách.
// Body: { assignments: [{ chiTietId, cuonSachId }] }
// ─────────────────────────────────────────────────────────────
exports.approve = async (req, res, next) => {
    try {
        const { assignments } = req.body;
        // assignments = [{ chiTietId: '...', cuonSachId: '...' }, ...]

        if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
            return next(new ApiError(400, 'Cần cung cấp danh sách gán bản sách (assignments)'));
        }

        const record = await PhieuMuon.findById(req.params.id).populate('DocGiaId');
        if (!record) return next(new ApiError(404, 'Không tìm thấy phiếu mượn'));

        if (record.TrangThaiPhieu !== 'ChoDuyet') {
            return next(new ApiError(400, `Phiếu mượn ở trạng thái "${record.TrangThaiPhieu}", không thể duyệt`));
        }

        if (assignments.length !== record.ChiTiet.length) {
            return next(new ApiError(400, `Cần gán đủ ${record.ChiTiet.length} bản sách cho ${record.ChiTiet.length} đầu sách trong phiếu`));
        }

        const staff = await NhanVien.findOne({ MaTaiKhoan: req.user.id });
        if (!staff && req.user.role !== 'Admin') {
            return next(new ApiError(404, 'Không tìm thấy hồ sơ nhân viên'));
        }

        // Tính hạn trả
        const hanTra = new Date();
        hanTra.setDate(hanTra.getDate() + loanDurationDays);

        // Kiểm tra và gán từng bản copy
        const cuonSachIdsToUpdate = [];
        const dauSachIdsToUpdate = [];
        for (const assign of assignments) {
            const detail = record.ChiTiet.id(assign.chiTietId);
            if (!detail) return next(new ApiError(404, `Không tìm thấy chi tiết mượn: ${assign.chiTietId}`));

            // Kiểm tra bản copy còn sẵn sàng
            const copy = await CuonSach.findOne({ _id: assign.cuonSachId, TrangThai: 'SanSang' });
            if (!copy) return next(new ApiError(400, `Bản sách ID ${assign.cuonSachId} không tồn tại hoặc không sẵn sàng`));

            detail.CuonSachId = assign.cuonSachId;
            detail.HanTra = hanTra;
            detail.TrangThaiChiTiet = 'DangMuon';
            cuonSachIdsToUpdate.push(assign.cuonSachId);
            dauSachIdsToUpdate.push(detail.DauSachId);
        }

        record.TrangThaiPhieu = 'DangMuon';
        if (staff) {
            record.NhanVienId = staff._id;
        }
        await record.save();

        // Cập nhật bản copy → DangMuon
        await CuonSach.updateMany(
            { _id: { $in: cuonSachIdsToUpdate } },
            { $set: { TrangThai: 'DangMuon' } }
        );

        // Tăng lượt mượn cho các đầu sách
        if (dauSachIdsToUpdate.length > 0) {
            const DauSach = require('../models/book.model');
            await DauSach.updateMany(
                { _id: { $in: dauSachIdsToUpdate } },
                { $inc: { LuotMuon: 1 } }
            );
        }

        await createNotification(
            record.DocGiaId.MaTaiKhoan,
            'Phiếu mượn đã được duyệt',
            `Phiếu mượn #${record._id} đã được duyệt. Bạn có thể đến quầy nhận sách. Hạn trả: ${hanTra.toLocaleDateString('vi-VN')}.`
        );

        return res.status(200).json({ data: record, message: 'Duyệt phiếu mượn thành công' });
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'Lỗi khi duyệt phiếu mượn'));
    }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/borrows/:id/reject
// Nhân viên từ chối phiếu mượn → TrangThaiPhieu = 'DaHuy'
// ─────────────────────────────────────────────────────────────
exports.reject = async (req, res, next) => {
    try {
        const { lyDo } = req.body;
        const record = await PhieuMuon.findById(req.params.id).populate('DocGiaId');
        if (!record) return next(new ApiError(404, 'Không tìm thấy phiếu mượn'));

        if (record.TrangThaiPhieu !== 'ChoDuyet') {
            return next(
                new ApiError(400, `Phiếu mượn ở trạng thái "${record.TrangThaiPhieu}", không thể từ chối`)
            );
        }

        record.TrangThaiPhieu = 'DaHuy';
        if (record.ChiTiet && record.ChiTiet.length > 0) {
            record.ChiTiet.forEach(ct => {
                ct.TrangThaiChiTiet = 'DaHuy';
            });
        }
        await record.save();

        // Trả về SanSang những bản copy đã được gán (CuonSachId != null)
        const copyIds = record.ChiTiet.map((ct) => ct.CuonSachId).filter(Boolean);
        if (copyIds.length > 0) {
            await CuonSach.updateMany(
                { _id: { $in: copyIds } },
                { $set: { TrangThai: 'SanSang' } }
            );
        }

        // Thông báo cho độc giả
        await createNotification(
            record.DocGiaId.MaTaiKhoan,
            'Yêu cầu mượn sách bị từ chối',
            `Phiếu mượn #${record._id} đã bị từ chối.${lyDo ? ' Lý do: ' + lyDo : ''}`
        );

        return res.status(200).json({ message: 'Đã từ chối phiếu mượn' });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi từ chối phiếu mượn'));
    }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/borrows/:id/cancel
// Độc giả tự hủy phiếu mượn (chỉ hợp lệ khi trạng thái ChoDuyet)
// ─────────────────────────────────────────────────────────────
exports.cancel = async (req, res, next) => {
    try {
        const record = await PhieuMuon.findById(req.params.id).populate('DocGiaId');
        if (!record) return next(new ApiError(404, 'Không tìm thấy phiếu mượn'));

        // Kiểm tra quyền (chỉ người tạo mới được hủy)
        const myReader = await DocGia.findOne({ MaTaiKhoan: req.user.id });
        if (!myReader || record.DocGiaId._id.toString() !== myReader._id.toString()) {
            return next(new ApiError(403, 'Bạn không có quyền hủy phiếu mượn này'));
        }

        if (record.TrangThaiPhieu !== 'ChoDuyet') {
            return next(
                new ApiError(400, `Phiếu mượn đã được xử lý (trạng thái: "${record.TrangThaiPhieu}"), không thể tự hủy`)
            );
        }

        record.TrangThaiPhieu = 'DaHuy';
        if (record.ChiTiet && record.ChiTiet.length > 0) {
            record.ChiTiet.forEach(ct => {
                ct.TrangThaiChiTiet = 'DaHuy';
            });
        }
        await record.save();

        return res.status(200).json({ message: 'Đã hủy phiếu mượn thành công' });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi hủy phiếu mượn'));
    }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/borrows/:id/details/:detailId/renew
// Độc giả gia hạn – Điều kiện: SapDenHan / DangMuon, chưa quá hạn,
//   chưa vượt số lần gia hạn tối đa
// ─────────────────────────────────────────────────────────────
exports.renew = async (req, res, next) => {
    try {
        const record = await PhieuMuon.findById(req.params.id).populate('DocGiaId');
        if (!record) return next(new ApiError(404, 'Không tìm thấy phiếu mượn'));

        // Phân quyền
        if (req.user.role === 'Reader') {
            const myReader = await DocGia.findOne({ MaTaiKhoan: req.user.id });
            if (!myReader || record.DocGiaId._id.toString() !== myReader._id.toString()) {
                return next(new ApiError(403, 'Bạn không có quyền gia hạn phiếu mượn này'));
            }
        }

        const detail = record.ChiTiet.id(req.params.detailId);
        if (!detail) return next(new ApiError(404, 'Không tìm thấy chi tiết mượn'));

        // Kiểm tra trạng thái – chỉ gia hạn được khi DangMuon hoặc SapDenHan
        if (!['DangMuon', 'SapDenHan'].includes(detail.TrangThaiChiTiet)) {
            return next(
                new ApiError(
                    400,
                    `Không thể gia hạn khi sách đang ở trạng thái "${detail.TrangThaiChiTiet}".` +
                        ' Gia hạn chỉ khả dụng trước khi sách quá hạn.'
                )
            );
        }

        // Kiểm tra số lần gia hạn
        if (detail.SoLanGiaHan >= maxRenewTimes) {
            return next(
                new ApiError(400, `Bạn đã gia hạn tối đa ${maxRenewTimes} lần. Không thể gia hạn thêm.`)
            );
        }

        // Kiểm tra chưa quá hạn
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const hanTra = new Date(detail.HanTra);
        hanTra.setHours(0, 0, 0, 0);

        if (hanTra < now) {
            return next(new ApiError(400, 'Sách đã quá hạn trả. Không thể gia hạn.'));
        }

        // Gia hạn thêm loanDurationDays ngày từ HanTra hiện tại
        const newHanTra = new Date(detail.HanTra);
        newHanTra.setDate(newHanTra.getDate() + loanDurationDays);

        detail.HanTra = newHanTra;
        detail.SoLanGiaHan += 1;
        detail.TrangThaiChiTiet = 'DangMuon'; // Reset về DangMuon sau khi gia hạn

        await record.save();

        await createNotification(
            record.DocGiaId.MaTaiKhoan,
            'Gia hạn sách thành công 🔄',
            `Cuốn sách trong phiếu #${record._id} đã được gia hạn. Hạn trả mới: ${newHanTra.toLocaleDateString('vi-VN')}.`
        );

        return res.status(200).json({
            data: detail,
            message: `Gia hạn thành công. Hạn trả mới: ${newHanTra.toLocaleDateString('vi-VN')}`,
        });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi gia hạn phiếu mượn'));
    }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/borrows/:id/details/:detailId/return
// Nhân viên xác nhận nhận lại sách:
//  - Chốt NgayTraThucTe
//  - Tính TienPhat chính xác
//  - Cập nhật trạng thái cuốn sách → SanSang
//  - Kiểm tra nếu tất cả chi tiết đã trả → đóng phiếu mượn
// ─────────────────────────────────────────────────────────────
exports.returnBook = async (req, res, next) => {
    try {
        const { tinhTrangVatLy = 'Tốt' } = req.body || {};
        const record = await PhieuMuon.findById(req.params.id).populate('DocGiaId');
        if (!record) return next(new ApiError(404, 'Không tìm thấy phiếu mượn'));

        if (!['DangMuon'].includes(record.TrangThaiPhieu)) {
            return next(
                new ApiError(400, `Phiếu mượn ở trạng thái "${record.TrangThaiPhieu}", không thể xử lý trả sách`)
            );
        }

        const detail = record.ChiTiet.id(req.params.detailId);
        if (!detail) return next(new ApiError(404, 'Không tìm thấy chi tiết mượn'));

        if (['DaTraDung', 'DaTraTre'].includes(detail.TrangThaiChiTiet)) {
            return next(new ApiError(400, 'Cuốn sách này đã được xác nhận trả rồi'));
        }

        // Chốt ngày trả thực tế
        const ngayTraThucTe = new Date();
        detail.NgayTraThucTe = ngayTraThucTe;

        // Tính số ngày trễ
        const hanTra = new Date(detail.HanTra);
        hanTra.setHours(0, 0, 0, 0);
        const ngayTra = new Date(ngayTraThucTe);
        ngayTra.setHours(0, 0, 0, 0);

        const msPerDay = 1000 * 60 * 60 * 24;
        const soNgayTre = Math.max(0, Math.floor((ngayTra - hanTra) / msPerDay));

        // Tính tiền phạt cuối cùng
        const tienPhat = soNgayTre * finePerDay;
        detail.TienPhat = tienPhat;
        detail.TrangThaiChiTiet = soNgayTre > 0 ? 'DaTraTre' : 'DaTraDung';

        await record.save();

        // Cập nhật trạng thái cuốn sách vật lý
        const newStatus = tinhTrangVatLy === 'HongMat' ? 'HongMat' : 'SanSang';
        await CuonSach.findByIdAndUpdate(detail.CuonSachId, {
            TrangThai: newStatus,
            ...(tinhTrangVatLy && { TinhTrangVatLy: tinhTrangVatLy }),
        });

        // Kiểm tra tất cả chi tiết đã trả chưa → đóng phiếu
        const allReturned = record.ChiTiet.every((ct) =>
            ['DaTraDung', 'DaTraTre'].includes(ct.TrangThaiChiTiet)
        );

        if (allReturned) {
            record.TrangThaiPhieu = 'DaHoanTat';
            await record.save();
        }

        // Thông báo cho độc giả
        const msg =
            soNgayTre > 0
                ? `Bạn đã trả sách trễ ${soNgayTre} ngày. Tiền phạt: ${tienPhat.toLocaleString('vi-VN')} VNĐ.`
                : 'Bạn đã trả sách đúng hạn. Cảm ơn!';

        await createNotification(record.DocGiaId.MaTaiKhoan, 'Xác nhận trả sách 📚', msg);

        return res.status(200).json({
            data: {
                chiTiet: detail,
                soNgayTre,
                tienPhat,
                phieuDaHoanTat: allReturned,
            },
            message: `Xác nhận trả sách thành công. ${soNgayTre > 0 ? `Tiền phạt: ${tienPhat.toLocaleString('vi-VN')} VNĐ.` : 'Đúng hạn, không có phí phạt.'}`,
        });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi xử lý trả sách'));
    }
};

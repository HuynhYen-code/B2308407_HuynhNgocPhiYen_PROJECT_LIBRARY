const CuonSach = require('../models/book-copy.model');
const ApiError = require('../utils/api-error');

/**
 * GET /api/book-copies
 * Danh sách tất cả cuốn sách (Staff/Admin), lọc theo đầu sách hoặc trạng thái
 */
exports.getAll = async (req, res, next) => {
    try {
        const { dauSachId, trangThai } = req.query;
        const filter = {};
        if (dauSachId) filter.DauSachId = dauSachId;
        if (trangThai) filter.TrangThai = trangThai;

        const copies = await CuonSach.find(filter)
            .populate('DauSachId', 'TenSach TacGia HinhAnh')
            .sort({ createdAt: -1 });

        return res.status(200).json({ data: copies });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi lấy danh sách cuốn sách'));
    }
};

/**
 * GET /api/book-copies/:id
 */
exports.getById = async (req, res, next) => {
    try {
        const copy = await CuonSach.findById(req.params.id).populate(
            'DauSachId',
            'TenSach TacGia'
        );
        if (!copy) return next(new ApiError(404, 'Không tìm thấy cuốn sách'));
        return res.status(200).json({ data: copy });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi lấy thông tin cuốn sách'));
    }
};

/**
 * POST /api/book-copies
 * Nhập thêm cuốn sách vật lý mới (Staff/Admin)
 */
exports.create = async (req, res, next) => {
    try {
        const { DauSachId, TinhTrangVatLy } = req.body;
        if (!DauSachId) return next(new ApiError(400, 'Đầu sách không được bỏ trống'));

        const copy = await CuonSach.create({ DauSachId, TinhTrangVatLy });
        return res.status(201).json({ data: copy, message: 'Thêm cuốn sách thành công' });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi thêm cuốn sách'));
    }
};

/**
 * PUT /api/book-copies/:id
 * Cập nhật tình trạng vật lý hoặc trạng thái (Staff/Admin)
 */
exports.update = async (req, res, next) => {
    try {
        const { TinhTrangVatLy, TrangThai } = req.body;
        const copy = await CuonSach.findByIdAndUpdate(
            req.params.id,
            { TinhTrangVatLy, TrangThai },
            { new: true, runValidators: true }
        );
        if (!copy) return next(new ApiError(404, 'Không tìm thấy cuốn sách'));
        return res.status(200).json({ data: copy, message: 'Cập nhật thành công' });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi cập nhật cuốn sách'));
    }
};

/**
 * DELETE /api/book-copies/:id
 * Xóa cuốn sách (Admin) – chỉ xóa được khi không đang mượn
 */
exports.remove = async (req, res, next) => {
    try {
        const copy = await CuonSach.findById(req.params.id);
        if (!copy) return next(new ApiError(404, 'Không tìm thấy cuốn sách'));

        if (['DangMuon', 'Pending'].includes(copy.TrangThai)) {
            return next(new ApiError(400, 'Không thể xóa cuốn sách đang được mượn hoặc chờ duyệt'));
        }

        await copy.deleteOne();
        return res.status(200).json({ message: 'Xóa cuốn sách thành công' });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi xóa cuốn sách'));
    }
};

const DauSach = require('../models/book.model');
const CuonSach = require('../models/book-copy.model');
const ApiError = require('../utils/api-error');

/**
 * GET /api/books
 * Lấy danh sách đầu sách với các bộ lọc:
 * - search: tìm theo tên sách hoặc tác giả (full-text index)
 * - category: lọc theo ObjectId thể loại
 * - publisher: lọc theo ObjectId nhà xuất bản
 * - page, limit: phân trang
 */
exports.getAll = async (req, res, next) => {
    try {
        const { search, category, publisher, sort, page = 1, limit = 12 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {};

        if (search) {
            filter.$text = { $search: search };
        }

        if (category) {
            filter.TheLoaiIds = category;
        }

        if (publisher) {
            filter.NhaXuatBanId = publisher;
        }

        let sortOptions = { NamXuatBan: -1, _id: 1 };
        
        if (search && !sort) {
            sortOptions = { score: { $meta: 'textScore' } };
        } else if (sort === 'priceAsc') {
            sortOptions = { DonGia: 1, _id: 1 };
        } else if (sort === 'priceDesc') {
            sortOptions = { DonGia: -1, _id: 1 };
        } else if (sort === 'nameAsc') {
            sortOptions = { TenSach: 1, _id: 1 };
        } else if (sort === 'nameDesc') {
            sortOptions = { TenSach: -1, _id: 1 };
        } else if (sort === 'popular') {
            sortOptions = { LuotMuon: -1, _id: 1 };
        }

        const [books, total] = await Promise.all([
            DauSach.find(filter)
                .populate('TheLoaiIds', 'TenTheLoai')
                .populate('NhaXuatBanId', 'TenNXB')
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit)),
            DauSach.countDocuments(filter),
        ]);

        return res.status(200).json({
            data: books,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi lấy danh sách sách'));
    }
};

/**
 * GET /api/books/:id
 * Chi tiết đầu sách kèm danh sách cuốn sách vật lý
 */
exports.getById = async (req, res, next) => {
    try {
        const book = await DauSach.findById(req.params.id)
            .populate('TheLoaiIds', 'TenTheLoai MoTa')
            .populate('NhaXuatBanId', 'TenNXB DiaChi');

        if (!book) return next(new ApiError(404, 'Không tìm thấy đầu sách'));

        // Đếm số lượng cuốn sách theo từng trạng thái
        const copies = await CuonSach.find({ DauSachId: req.params.id });
        const summary = {
            total: copies.length,
            SanSang: copies.filter((c) => c.TrangThai === 'SanSang').length,
            DangMuon: copies.filter((c) => c.TrangThai === 'DangMuon').length,
            Pending: copies.filter((c) => c.TrangThai === 'Pending').length,
            HongMat: copies.filter((c) => c.TrangThai === 'HongMat').length,
        };

        return res.status(200).json({ data: book, copies, summary });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi lấy thông tin sách'));
    }
};

/**
 * POST /api/books
 * Thêm đầu sách mới (Staff/Admin)
 */
exports.create = async (req, res, next) => {
    try {
        const { TenSach, TacGia, TheLoaiIds, NamXuatBan, NhaXuatBanId, DonGia, MoTa, HinhAnh } =
            req.body;

        if (!TenSach || !TacGia) {
            return next(new ApiError(400, 'Tên sách và tác giả không được bỏ trống'));
        }

        const book = await DauSach.create({
            TenSach,
            TacGia: Array.isArray(TacGia) ? TacGia : [TacGia],
            TheLoaiIds,
            NamXuatBan,
            NhaXuatBanId,
            DonGia,
            MoTa,
            HinhAnh,
        });

        return res.status(201).json({ data: book, message: 'Thêm đầu sách thành công' });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi thêm đầu sách'));
    }
};

/**
 * PUT /api/books/:id
 * Cập nhật đầu sách (Staff/Admin)
 */
exports.update = async (req, res, next) => {
    try {
        const { TenSach, TacGia, TheLoaiIds, NamXuatBan, NhaXuatBanId, DonGia, MoTa, HinhAnh } =
            req.body;

        const book = await DauSach.findByIdAndUpdate(
            req.params.id,
            { TenSach, TacGia, TheLoaiIds, NamXuatBan, NhaXuatBanId, DonGia, MoTa, HinhAnh },
            { new: true, runValidators: true }
        );

        if (!book) return next(new ApiError(404, 'Không tìm thấy đầu sách'));
        return res.status(200).json({ data: book, message: 'Cập nhật thành công' });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi cập nhật đầu sách'));
    }
};

/**
 * DELETE /api/books/:id
 * Xóa đầu sách (Admin) – chỉ xóa được nếu không có cuốn nào đang mượn
 */
exports.remove = async (req, res, next) => {
    try {
        const activeCopies = await CuonSach.countDocuments({
            DauSachId: req.params.id,
            TrangThai: { $in: ['DangMuon', 'Pending'] },
        });

        if (activeCopies > 0) {
            return next(
                new ApiError(400, 'Không thể xóa đầu sách đang có cuốn sách đang được mượn')
            );
        }

        const book = await DauSach.findByIdAndDelete(req.params.id);
        if (!book) return next(new ApiError(404, 'Không tìm thấy đầu sách'));

        // Xóa luôn tất cả cuốn sách thuộc đầu sách này
        await CuonSach.deleteMany({ DauSachId: req.params.id });

        return res.status(200).json({ message: 'Xóa đầu sách thành công' });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi xóa đầu sách'));
    }
};

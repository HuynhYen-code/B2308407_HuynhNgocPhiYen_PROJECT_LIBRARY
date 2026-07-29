const DocGia = require('../models/reader.model');
const User = require('../models/user.model');
const ApiError = require('../utils/api-error');

// ─────────────────────────────────────────────────────────────
// STAFF/ADMIN – Quản lý danh sách độc giả
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/readers
 * Danh sách tất cả độc giả (Staff/Admin), lọc theo trạng thái xác minh
 */
exports.getAll = async (req, res, next) => {
    try {
        const { search, trangThai, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {};
        if (search) {
            filter.$or = [
                { HoTen: { $regex: search, $options: 'i' } },
                { DienThoai: { $regex: search, $options: 'i' } },
            ];
        }
        if (trangThai) {
            filter.TrangThaiHoSo = trangThai;
        }

        const [readers, total] = await Promise.all([
            DocGia.find(filter)
                .populate('MaTaiKhoan', '-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            DocGia.countDocuments(filter),
        ]);

        return res.status(200).json({
            data: readers,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi lấy danh sách độc giả'));
    }
};

/**
 * GET /api/readers/:id
 * Chi tiết một độc giả
 */
exports.getById = async (req, res, next) => {
    try {
        const reader = await DocGia.findById(req.params.id).populate('MaTaiKhoan', '-password');
        if (!reader) {
            return next(new ApiError(404, 'Không tìm thấy độc giả'));
        }
        return res.status(200).json({ data: reader });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi lấy thông tin độc giả'));
    }
};

/**
 * POST /api/readers
 * Staff/Admin tạo hồ sơ và xác minh luôn (mặc định DaXacMinh khi staff tạo tại quầy)
 */
exports.create = async (req, res, next) => {
    try {
        const { MaTaiKhoan, HoTen, NgaySinh, Phai, DiaChi, DienThoai } = req.body;

        const user = await User.findById(MaTaiKhoan);
        if (!user) {
            return next(new ApiError(404, 'Tài khoản không tồn tại'));
        }

        const existing = await DocGia.findOne({ MaTaiKhoan });
        if (existing) {
            return next(new ApiError(400, 'Tài khoản này đã có hồ sơ độc giả'));
        }

        // Staff tạo tại quầy → xác minh ngay
        const reader = new DocGia({
            MaTaiKhoan,
            HoTen,
            NgaySinh,
            Phai,
            DiaChi,
            DienThoai,
            TrangThaiHoSo: 'DaXacMinh',
        });
        const saved = await reader.save();

        return res.status(201).json({
            data: saved,
            message: 'Tạo hồ sơ độc giả thành công (đã xác minh)',
        });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi tạo hồ sơ độc giả'));
    }
};

/**
 * PUT /api/readers/:id
 * Cập nhật hồ sơ độc giả (Staff/Admin)
 */
exports.update = async (req, res, next) => {
    try {
        const { HoTen, NgaySinh, Phai, DiaChi, DienThoai } = req.body;

        const reader = await DocGia.findByIdAndUpdate(
            req.params.id,
            { HoTen, NgaySinh, Phai, DiaChi, DienThoai },
            { new: true, runValidators: true }
        );

        if (!reader) {
            return next(new ApiError(404, 'Không tìm thấy độc giả'));
        }

        return res.status(200).json({ data: reader, message: 'Cập nhật hồ sơ thành công' });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi cập nhật hồ sơ độc giả'));
    }
};

/**
 * DELETE /api/readers/:id
 * Xóa hồ sơ độc giả (Admin)
 */
exports.remove = async (req, res, next) => {
    try {
        const reader = await DocGia.findByIdAndDelete(req.params.id);
        if (!reader) {
            return next(new ApiError(404, 'Không tìm thấy độc giả'));
        }
        return res.status(200).json({ message: 'Xóa hồ sơ độc giả thành công' });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi xóa hồ sơ độc giả'));
    }
};

/**
 * PATCH /api/readers/:id/verify
 * Nhân viên xác minh hồ sơ độc giả (ChuaXacMinh → DaXacMinh)
 */
exports.verify = async (req, res, next) => {
    try {
        const reader = await DocGia.findById(req.params.id);
        if (!reader) {
            return next(new ApiError(404, 'Không tìm thấy độc giả'));
        }

        if (reader.TrangThaiHoSo === 'DaXacMinh') {
            return next(new ApiError(400, 'Hồ sơ này đã được xác minh trước đó'));
        }

        reader.TrangThaiHoSo = 'DaXacMinh';
        await reader.save();

        return res.status(200).json({
            data: reader,
            message: `Đã xác minh hồ sơ của độc giả "${reader.HoTen}". Họ có thể mượn sách ngay bây giờ.`,
        });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi xác minh hồ sơ'));
    }
};

/**
 * PATCH /api/readers/:id/lock
 * Nhân viên khóa / mở khóa hồ sơ độc giả
 */
exports.lock = async (req, res, next) => {
    try {
        const { khoa, lyDo } = req.body; // khoa: true/false

        const reader = await DocGia.findById(req.params.id);
        if (!reader) {
            return next(new ApiError(404, 'Không tìm thấy độc giả'));
        }

        if (reader.TrangThaiHoSo === 'ChuaXacMinh') {
            return next(new ApiError(400, 'Hồ sơ chưa được xác minh, không thể thao tác khóa'));
        }

        reader.TrangThaiHoSo = khoa ? 'BiKhoa' : 'DaXacMinh';
        await reader.save();

        const action = khoa ? 'Khóa' : 'Mở khóa';
        return res.status(200).json({
            data: reader,
            message: `${action} hồ sơ độc giả "${reader.HoTen}" thành công.${lyDo ? ' Lý do: ' + lyDo : ''}`,
        });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi thao tác khóa hồ sơ'));
    }
};

// ─────────────────────────────────────────────────────────────
// READER – Tự quản lý hồ sơ
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/readers/profile/me
 * Độc giả xem hồ sơ của chính mình
 */
exports.getMyProfile = async (req, res, next) => {
    try {
        const reader = await DocGia.findOne({ MaTaiKhoan: req.user.id }).populate(
            'MaTaiKhoan',
            '-password'
        );
        if (!reader) {
            return next(new ApiError(404, 'Bạn chưa có hồ sơ độc giả. Hãy tạo hồ sơ để bắt đầu mượn sách.'));
        }
        return res.status(200).json({ data: reader });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi lấy hồ sơ độc giả'));
    }
};

/**
 * POST /api/readers/profile/me
 * Độc giả tự đăng ký hồ sơ online → TrangThaiHoSo = 'ChuaXacMinh'
 * Cần đến quầy để được nhân viên xác minh trước khi mượn sách
 */
exports.selfRegister = async (req, res, next) => {
    try {
        const { HoTen, NgaySinh, Phai, DiaChi, DienThoai } = req.body;

        if (!HoTen || !DienThoai) {
            return next(new ApiError(400, 'Họ tên và số điện thoại không được bỏ trống'));
        }

        // Kiểm tra đã có hồ sơ chưa
        const existing = await DocGia.findOne({ MaTaiKhoan: req.user.id });
        if (existing) {
            return next(new ApiError(400, 'Bạn đã có hồ sơ độc giả trong hệ thống'));
        }

        const reader = await DocGia.create({
            MaTaiKhoan: req.user.id,
            HoTen,
            NgaySinh,
            Phai,
            DiaChi,
            DienThoai,
            TrangThaiHoSo: 'ChuaXacMinh', // Mặc định khi tự đăng ký
        });

        return res.status(201).json({
            data: reader,
            message:
                'Tạo hồ sơ thành công! Hồ sơ của bạn đang chờ xác minh. ' +
                'Vui lòng mang CCCD/CMND đến quầy thư viện để nhân viên xác minh và kích hoạt tài khoản mượn sách.',
        });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi tạo hồ sơ độc giả'));
    }
};

/**
 * PUT /api/readers/profile/me
 * Độc giả cập nhật thông tin hồ sơ của chính mình
 * Lưu ý: Cập nhật thông tin sẽ reset trạng thái về ChuaXacMinh để staff re-verify
 */
exports.updateMyProfile = async (req, res, next) => {
    try {
        const { HoTen, NgaySinh, Phai, DiaChi, DienThoai } = req.body;

        const reader = await DocGia.findOne({ MaTaiKhoan: req.user.id });
        if (!reader) {
            return next(new ApiError(404, 'Không tìm thấy hồ sơ của bạn'));
        }

        // Cập nhật chỉ các trường thông tin cá nhân (không cho tự thay đổi TrangThaiHoSo)
        if (HoTen) reader.HoTen = HoTen;
        if (NgaySinh) reader.NgaySinh = NgaySinh;
        if (Phai) reader.Phai = Phai;
        if (DiaChi) reader.DiaChi = DiaChi;
        if (DienThoai) reader.DienThoai = DienThoai;

        await reader.save();

        return res.status(200).json({
            data: reader,
            message: 'Cập nhật hồ sơ thành công',
        });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi cập nhật hồ sơ'));
    }
};

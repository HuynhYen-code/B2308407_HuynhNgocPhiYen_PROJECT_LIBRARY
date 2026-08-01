const NhanVien = require('../models/staff.model');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const ApiError = require('../utils/api-error');

/**
 * GET /api/staff
 * Danh sách nhân viên (Admin)
 */
exports.getAll = async (req, res, next) => {
    try {
        const { search } = req.query;
        let query = {};
        
        if (search) {
            query = {
                $or: [
                    { HoTenNV: { $regex: search, $options: 'i' } },
                    { SoDienThoai: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const staff = await NhanVien.find(query).populate('MaTaiKhoan', '-password').sort({ createdAt: -1 });
        return res.status(200).json({ data: staff });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi lấy danh sách nhân viên'));
    }
};

/**
 * GET /api/staff/:id
 * Chi tiết nhân viên
 */
exports.getById = async (req, res, next) => {
    try {
        const staff = await NhanVien.findById(req.params.id).populate('MaTaiKhoan', '-password');
        if (!staff) return next(new ApiError(404, 'Không tìm thấy nhân viên'));
        return res.status(200).json({ data: staff });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi lấy thông tin nhân viên'));
    }
};

/**
 * POST /api/staff
 * Tạo tài khoản + hồ sơ nhân viên mới (Admin)
 */
exports.create = async (req, res, next) => {
    try {
        const { username, password, HoTenNV, ChucVu, DiaChi, SoDienThoai } = req.body;

        if (!username || !password || !HoTenNV) {
            return next(new ApiError(400, 'Thiếu thông tin bắt buộc'));
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return next(new ApiError(400, 'Tên đăng nhập đã tồn tại'));
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, password: hashedPassword, role: 'Staff' });

        const staff = await NhanVien.create({
            MaTaiKhoan: newUser._id,
            HoTenNV,
            ChucVu,
            DiaChi,
            SoDienThoai,
        });

        return res.status(201).json({ data: staff, message: 'Tạo nhân viên thành công' });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi tạo nhân viên'));
    }
};

/**
 * PUT /api/staff/:id
 * Cập nhật hồ sơ nhân viên
 */
exports.update = async (req, res, next) => {
    try {
        const { HoTenNV, ChucVu, DiaChi, SoDienThoai } = req.body;
        const staff = await NhanVien.findByIdAndUpdate(
            req.params.id,
            { HoTenNV, ChucVu, DiaChi, SoDienThoai },
            { new: true, runValidators: true }
        );
        if (!staff) return next(new ApiError(404, 'Không tìm thấy nhân viên'));
        return res.status(200).json({ data: staff, message: 'Cập nhật thành công' });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi cập nhật nhân viên'));
    }
};

/**
 * DELETE /api/staff/:id
 * Cập nhật trạng thái nhân viên thành nghỉ việc (thay thế xóa cứng)
 */
exports.remove = async (req, res, next) => {
    try {
        const staff = await NhanVien.findById(req.params.id);
        if (!staff) return next(new ApiError(404, 'Không tìm thấy nhân viên'));

        // Kiểm tra chống tự khóa tài khoản của chính mình
        if (staff.MaTaiKhoan.toString() === req.user.id) {
            return next(new ApiError(400, 'Bạn không thể tự vô hiệu hóa tài khoản của chính mình!'));
        }

        staff.TrangThai = staff.TrangThai === 'NghiViec' ? 'DangLamViec' : 'NghiViec';
        await staff.save();

        return res.status(200).json({ message: 'Cập nhật trạng thái nhân viên thành công' });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi cập nhật trạng thái nhân viên'));
    }
};

/**
 * PATCH /api/staff/:id/credentials
 * Cập nhật tên đăng nhập và mật khẩu (Admin)
 */
exports.resetCredentials = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return next(new ApiError(400, 'Tên đăng nhập và mật khẩu không được bỏ trống'));
        }

        const staff = await NhanVien.findById(req.params.id);
        if (!staff) return next(new ApiError(404, 'Không tìm thấy nhân viên'));

        // Kiểm tra xem username mới có bị trùng với user khác không
        const existingUser = await User.findOne({ username, _id: { $ne: staff.MaTaiKhoan } });
        if (existingUser) {
            return next(new ApiError(400, 'Tên đăng nhập đã tồn tại'));
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(staff.MaTaiKhoan, { username, password: hashedPassword });

        return res.status(200).json({ message: 'Cập nhật thông tin đăng nhập thành công' });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi cập nhật thông tin đăng nhập'));
    }
};

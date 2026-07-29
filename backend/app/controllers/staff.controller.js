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
        const staff = await NhanVien.find().populate('MaTaiKhoan', '-password').sort({ createdAt: -1 });
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
 * Xóa nhân viên + tài khoản (Admin)
 */
exports.remove = async (req, res, next) => {
    try {
        const staff = await NhanVien.findByIdAndDelete(req.params.id);
        if (!staff) return next(new ApiError(404, 'Không tìm thấy nhân viên'));

        // Xóa luôn tài khoản liên kết
        await User.findByIdAndDelete(staff.MaTaiKhoan);

        return res.status(200).json({ message: 'Xóa nhân viên thành công' });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi xóa nhân viên'));
    }
};

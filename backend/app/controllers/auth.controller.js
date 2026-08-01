const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config');
const ApiError = require('../utils/api-error');
const DocGia = require('../models/reader.model');

/**
 * POST /api/auth/register
 * Đăng ký tài khoản mới. Mặc định role là 'Reader'.
 * Chỉ Admin mới có thể tạo tài khoản Staff/Admin.
 */
exports.register = async (req, res, next) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return next(new ApiError(400, 'Tên đăng nhập và mật khẩu không được bỏ trống'));
        }

        // Kiểm tra trùng tên đăng nhập (sửa lỗi: findone → findOne)
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return next(new ApiError(400, 'Tên đăng nhập đã tồn tại trong hệ thống'));
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Chỉ cho phép đăng ký với role 'Reader' từ endpoint công khai
        const newUser = new User({
            username,
            password: hashedPassword,
            role: 'Reader',
        });

        const savedUser = await newUser.save();

        const { password: _pw, ...userData } = savedUser.toObject();
        return res.status(201).json({
            data: userData,
            message: 'Đăng ký thành công',
        });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi hệ thống khi đăng ký tài khoản'));
    }
};

/**
 * POST /api/auth/login
 * Đăng nhập, trả về JWT token.
 */
exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return next(new ApiError(400, 'Tên đăng nhập và mật khẩu không được bỏ trống'));
        }

        const user = await User.findOne({ username });
        if (!user) {
            return next(new ApiError(401, 'Tên đăng nhập hoặc mật khẩu không chính xác'));
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return next(new ApiError(401, 'Tên đăng nhập hoặc mật khẩu không chính xác'));
        }

        if (user.role === 'Staff') {
            const NhanVien = require('../models/staff.model');
            const staff = await NhanVien.findOne({ MaTaiKhoan: user._id });
            if (staff && staff.TrangThai === 'NghiViec') {
                return next(new ApiError(401, 'Tài khoản nhân viên này đã bị đình chỉ hoặc cho nghỉ việc. Vui lòng liên hệ quản trị viên.'));
            }
        }

        const payload = {
            id: user._id,
            role: user.role,
        };

        const token = jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
        });

        const { password: _pw, ...userData } = user.toObject();

        let accountStatus = 'HoatDong';
        if (userData.role === 'Reader') {
            const reader = await DocGia.findOne({ MaTaiKhoan: user._id });
            if (reader && reader.TrangThaiHoSo) {
                accountStatus = reader.TrangThaiHoSo;
            }
        }
        userData.accountStatus = accountStatus;

        return res.status(200).json({
            data: userData,
            token,
            message: 'Đăng nhập thành công',
        });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi phát sinh trong quá trình xử lý đăng nhập'));
    }
};

/**
 * GET /api/auth/me
 * Lấy thông tin tài khoản hiện tại từ token.
 */
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return next(new ApiError(404, 'Không tìm thấy tài khoản'));
        }
        const userObj = user.toObject();
        let accountStatus = 'HoatDong';
        if (userObj.role === 'Reader') {
            const reader = await DocGia.findOne({ MaTaiKhoan: userObj._id });
            if (reader && reader.TrangThaiHoSo) {
                accountStatus = reader.TrangThaiHoSo;
            }
        }
        userObj.accountStatus = accountStatus;
        return res.status(200).json({ data: userObj });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi hệ thống'));
    }
};

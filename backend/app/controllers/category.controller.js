const TheLoai = require('../models/category.model');
const ApiError = require('../utils/api-error');

exports.getAll = async (req, res, next) => {
    try {
        const categories = await TheLoai.find().sort({ TenTheLoai: 1 });
        return res.status(200).json({ data: categories });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi lấy danh sách thể loại'));
    }
};

exports.getById = async (req, res, next) => {
    try {
        const category = await TheLoai.findById(req.params.id);
        if (!category) return next(new ApiError(404, 'Không tìm thấy thể loại'));
        return res.status(200).json({ data: category });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi lấy thông tin thể loại'));
    }
};

exports.create = async (req, res, next) => {
    try {
        const { TenTheLoai, MoTa } = req.body;
        if (!TenTheLoai) return next(new ApiError(400, 'Tên thể loại không được bỏ trống'));

        const category = await TheLoai.create({ TenTheLoai, MoTa });
        return res.status(201).json({ data: category, message: 'Thêm thể loại thành công' });
    } catch (error) {
        if (error.code === 11000) {
            return next(new ApiError(400, 'Thể loại này đã tồn tại'));
        }
        return next(new ApiError(500, 'Lỗi khi thêm thể loại'));
    }
};

exports.update = async (req, res, next) => {
    try {
        const { TenTheLoai, MoTa } = req.body;
        const category = await TheLoai.findByIdAndUpdate(
            req.params.id,
            { TenTheLoai, MoTa },
            { new: true, runValidators: true }
        );
        if (!category) return next(new ApiError(404, 'Không tìm thấy thể loại'));
        return res.status(200).json({ data: category, message: 'Cập nhật thành công' });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi cập nhật thể loại'));
    }
};

exports.remove = async (req, res, next) => {
    try {
        const category = await TheLoai.findByIdAndDelete(req.params.id);
        if (!category) return next(new ApiError(404, 'Không tìm thấy thể loại'));
        return res.status(200).json({ message: 'Xóa thể loại thành công' });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi xóa thể loại'));
    }
};

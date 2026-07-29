const NhaXuatBan = require('../models/publisher.model');
const ApiError = require('../utils/api-error');

exports.getAll = async (req, res, next) => {
    try {
        const publishers = await NhaXuatBan.find().sort({ TenNXB: 1 });
        return res.status(200).json({ data: publishers });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi lấy danh sách nhà xuất bản'));
    }
};

exports.getById = async (req, res, next) => {
    try {
        const publisher = await NhaXuatBan.findById(req.params.id);
        if (!publisher) return next(new ApiError(404, 'Không tìm thấy nhà xuất bản'));
        return res.status(200).json({ data: publisher });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi lấy thông tin nhà xuất bản'));
    }
};

exports.create = async (req, res, next) => {
    try {
        const { TenNXB, DiaChi } = req.body;
        if (!TenNXB) return next(new ApiError(400, 'Tên nhà xuất bản không được bỏ trống'));

        const publisher = await NhaXuatBan.create({ TenNXB, DiaChi });
        return res.status(201).json({ data: publisher, message: 'Thêm nhà xuất bản thành công' });
    } catch (error) {
        if (error.code === 11000) {
            return next(new ApiError(400, 'Nhà xuất bản này đã tồn tại'));
        }
        return next(new ApiError(500, 'Lỗi khi thêm nhà xuất bản'));
    }
};

exports.update = async (req, res, next) => {
    try {
        const { TenNXB, DiaChi } = req.body;
        const publisher = await NhaXuatBan.findByIdAndUpdate(
            req.params.id,
            { TenNXB, DiaChi },
            { new: true, runValidators: true }
        );
        if (!publisher) return next(new ApiError(404, 'Không tìm thấy nhà xuất bản'));
        return res.status(200).json({ data: publisher, message: 'Cập nhật thành công' });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi cập nhật nhà xuất bản'));
    }
};

exports.remove = async (req, res, next) => {
    try {
        const publisher = await NhaXuatBan.findByIdAndDelete(req.params.id);
        if (!publisher) return next(new ApiError(404, 'Không tìm thấy nhà xuất bản'));
        return res.status(200).json({ message: 'Xóa nhà xuất bản thành công' });
    } catch (error) {
        return next(new ApiError(500, 'Lỗi khi xóa nhà xuất bản'));
    }
};

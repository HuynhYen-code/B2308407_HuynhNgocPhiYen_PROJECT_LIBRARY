const ApiError = require('../utils/api-error');

exports.uploadImage = (req, res, next) => {
    if (!req.file) {
        return next(new ApiError(400, 'Không tìm thấy file ảnh.'));
    }
    
    // File was uploaded and saved by multer. We just need to return its path.
    // Assuming backend server is hosted at root, the path will be /uploads/filename
    const imageUrl = `/uploads/${req.file.filename}`;
    
    return res.status(200).json({
        message: 'Upload thành công',
        url: imageUrl
    });
};

const express = require('express');
const cors = require('cors');
const ApiError = require('./app/utils/api-error');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Chào mừng đến hệ thống Quản lý Thư viện!' });
});

app.use((req, res, next) => {
    return next(new ApiError(404, 'Không tìm thấy tài nguyên yêu cầu!'));
});

app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        messagg: err.message || 'Lỗi máy chủ nội bộ!',
    });
});

module.exports = app;

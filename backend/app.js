require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ApiError = require('./app/utils/api-error');
const routes = require('./app/routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Chào mừng đến Hệ thống Quản lý Thư viện API!', version: '1.0.0' });
});

// Tất cả API routes
app.use('/api', routes);

// 404 handler
app.use((req, res, next) => {
    return next(new ApiError(404, 'Không tìm thấy tài nguyên yêu cầu!'));
});

// Global error handler
app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || 'Lỗi máy chủ nội bộ!',
    });
});

module.exports = app;


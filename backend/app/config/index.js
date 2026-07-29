require('dotenv').config();

const config = {
    app: {
        port: process.env.PORT || 3000,
    },
    db: {
        uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quan_ly_thu_vien',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'thu_vien_super_secret_key_2026',
        expiresIn: '1d',
    },
    library: {
        // Phí phạt mỗi ngày trễ hạn (VNĐ)
        finePerDay: parseInt(process.env.FINE_PER_DAY) || 5000,
        // Số lần gia hạn tối đa cho mỗi chi tiết mượn
        maxRenewTimes: parseInt(process.env.MAX_RENEW_TIMES) || 1,
        // Thời hạn mượn mặc định (ngày)
        loanDurationDays: parseInt(process.env.LOAN_DURATION_DAYS) || 14,
        // Số ngày cảnh báo trước khi đến hạn
        warnBeforeDueDays: parseInt(process.env.WARN_BEFORE_DUE_DAYS) || 2,
    },
};

module.exports = config;

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Tên đăng nhập không được bỏ trống'],
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Mật khẩu không được bỏ trống'],
        },
        role: {
            type: String,
            enum: ['Reader', 'Staff', 'Admin'],
            default: 'Reader',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
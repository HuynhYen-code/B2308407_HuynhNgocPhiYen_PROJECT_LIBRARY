const mongoose = require('mongoose');

const readerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: [true, 'Họ tên không được bỏ trống'],
        },
        birthDate: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
        },
        address: {
            type: String,
        },
        phone: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Reader', readerSchema);
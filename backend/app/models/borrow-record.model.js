const mongoose = require('mongoose');

const borrowRecordSchema = new mongoose.Schema(
    {
        readerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reader',
            required: true,
        },
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff', 
            required: true,
        },
        status: {
            type: String,
            enum: ['Borrowing', 'Returned', 'Overdue'],
            default: 'Borrowing',
        },
        details: [
            {
                bookId: {
                    type: String, 
                    required: true,
                },
                dueDate: {
                    type: Date,
                    required: true,
                },
                returnDate: {
                    type: Date,
                    default: null,
                },
                notes: {
                    type: String,
                    default: '',
                },
            }
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);
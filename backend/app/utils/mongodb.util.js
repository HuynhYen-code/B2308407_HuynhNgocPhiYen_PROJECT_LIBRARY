const mongoose = require('mongoose');

class MongoDB {
    static connect = async (uri) => {
        if (this.client) return this.client;

        try {
            this.client = await mongoose.connect(uri);
            console.log('Khởi tạo kết nối với MongoDB thành công!');
            return this.client;
        } catch (error) {
            console.error('Không thể kết nối với MongoDB:', error);
            process.exit(1);
        }
    };
}

module.exports = MongoDB;

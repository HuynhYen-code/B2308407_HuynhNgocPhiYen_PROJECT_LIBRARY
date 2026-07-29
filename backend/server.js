require('dotenv').config();
const app = require('./app');
const config = require('./app/config');
const MongoDB = require('./app/utils/mongodb.util');
const { startOverdueJob } = require('./app/jobs/overdue.job');

async function startServer() {
    try {
        await MongoDB.connect(config.db.uri);

        // Khởi động cron job sau khi kết nối DB thành công
        startOverdueJob();

        const PORT = config.app.port;
        app.listen(PORT, () => {
            console.log(`Máy chủ đang chạy tại URL http://localhost:${PORT}`);
            console.log(`Môi trường: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Không thể kết nối đến cơ sở dữ liệu!', error);
        process.exit(1);
    }
}

startServer();

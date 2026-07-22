const app = require('./app');
const config = require('./app/config');
const MongoDB = require('./app/utils/mongodb.util');

async function startServer() {
    try {
        await MongoDB.connect(config.db.uri);
        
        const PORT = config.app.port;
        app.listen(PORT, () => {
            console.log(`Máy chủ đang chạy tại cổng ${PORT}.`);
        });
    } catch (error) {
        console.error('Không thể kết nối đến cơ sở dữ liệu!', error);
        process.exit(1);
    }
}

startServer();
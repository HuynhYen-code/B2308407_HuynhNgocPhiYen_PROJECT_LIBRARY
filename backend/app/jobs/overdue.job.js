/**
 * overdue.job.js
 *
 * Cron job xử lý quá hạn mượn sách.
 * Chạy mỗi ngày lúc 00:05 AM (sau nửa đêm 5 phút).
 *
 * Thực hiện 2 tác vụ tuần tự:
 *
 * TASK 1 – Cảnh báo sắp đến hạn (T-2 ngày)
 *   Gửi thông báo nội bộ cho độc giả sắp đến hạn trả sách.
 *   Trạng thái chuyển sang 'SapDenHan' → frontend bật nút "Gia hạn".
 *
 * TASK 2 – Xử lý quá hạn (biến đổi trạng thái lưu trữ)
 *   - Cập nhật TrangThaiChiTiet → 'QuaHan'
 *   - Tính TienPhat tích lũy theo ngày (soNgayTre × finePerDay)
 *   - Ghi vào DB ngay lập tức (không chỉ gửi thông báo)
 *   - Thông báo chỉ là kết quả phụ từ sự biến đổi trạng thái này
 */

const cron = require('node-cron');
const PhieuMuon = require('../models/borrow-record.model');
const ThongBao = require('../models/notification.model');
const DocGia = require('../models/reader.model');
const config = require('../config');

const { finePerDay, warnBeforeDueDays } = config.library;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// ─────────────────────────────────────────────────────────────
// HELPER: Tạo thông báo hàng loạt
// ─────────────────────────────────────────────────────────────
async function bulkNotify(notifications) {
    if (notifications.length === 0) return;
    try {
        await ThongBao.insertMany(notifications, { ordered: false });
    } catch (err) {
        console.error('[Overdue Job] Lỗi khi tạo thông báo hàng loạt:', err.message);
    }
}

// ─────────────────────────────────────────────────────────────
// TASK 1: Cảnh báo sắp đến hạn (T-2 ngày)
// ─────────────────────────────────────────────────────────────
async function task1_WarnUpcomingDue(today) {
    const warnDate = new Date(today);
    warnDate.setDate(warnDate.getDate() + warnBeforeDueDays);

    const startOfWarnDate = new Date(warnDate);
    startOfWarnDate.setHours(0, 0, 0, 0);
    const endOfWarnDate = new Date(warnDate);
    endOfWarnDate.setHours(23, 59, 59, 999);

    // Tìm tất cả phiếu đang mượn có chi tiết sắp đến hạn
    const records = await PhieuMuon.find({
        TrangThaiPhieu: 'DangMuon',
        'ChiTiet.TrangThaiChiTiet': 'DangMuon',
        'ChiTiet.HanTra': { $gte: startOfWarnDate, $lte: endOfWarnDate },
    }).populate('DocGiaId');

    if (records.length === 0) {
        console.log('[Task 1] Không có phiếu nào sắp đến hạn.');
        return;
    }

    const notifications = [];
    const bulkOps = [];

    for (const record of records) {
        const reader = record.DocGiaId;
        if (!reader) continue;

        for (const detail of record.ChiTiet) {
            const hanTra = new Date(detail.HanTra);
            hanTra.setHours(0, 0, 0, 0);

            if (
                detail.TrangThaiChiTiet === 'DangMuon' &&
                hanTra >= startOfWarnDate &&
                hanTra <= endOfWarnDate
            ) {
                // Cập nhật trạng thái sang SapDenHan
                bulkOps.push({
                    updateOne: {
                        filter: { _id: record._id, 'ChiTiet._id': detail._id },
                        update: { $set: { 'ChiTiet.$.TrangThaiChiTiet': 'SapDenHan' } },
                    },
                });

                // Chuẩn bị thông báo
                notifications.push({
                    MaTaiKhoan: reader.MaTaiKhoan,
                    TieuDe: '⚠️ Sắp đến hạn trả sách',
                    NoiDung: `Cuốn sách trong phiếu mượn #${record._id} sẽ đến hạn trả vào ngày ${hanTra.toLocaleDateString('vi-VN')}. Bạn có thể gia hạn ngay bây giờ nếu cần.`,
                    NgayTao: new Date(),
                });
            }
        }
    }

    if (bulkOps.length > 0) {
        await PhieuMuon.bulkWrite(bulkOps);
        console.log(`[Task 1] Đã cập nhật ${bulkOps.length} chi tiết → SapDenHan`);
    }

    await bulkNotify(notifications);
    console.log(`[Task 1] Đã gửi ${notifications.length} thông báo sắp đến hạn.`);
}

// ─────────────────────────────────────────────────────────────
// TASK 2: Xử lý quá hạn – Biến đổi trạng thái lưu trữ
// ─────────────────────────────────────────────────────────────
async function task2_ProcessOverdue(today) {
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    // Tìm tất cả phiếu đang mượn có chi tiết chưa trả và đã quá HanTra
    const records = await PhieuMuon.find({
        TrangThaiPhieu: 'DangMuon',
        'ChiTiet.TrangThaiChiTiet': { $in: ['DangMuon', 'SapDenHan'] },
        'ChiTiet.HanTra': { $lt: startOfToday },
    }).populate('DocGiaId');

    if (records.length === 0) {
        console.log('[Task 2] Không có phiếu nào quá hạn.');
        return;
    }

    const notifications = [];
    const bulkOps = [];
    let totalOverdueDetails = 0;

    for (const record of records) {
        const reader = record.DocGiaId;
        if (!reader) continue;

        let recordModified = false;

        for (const detail of record.ChiTiet) {
            if (!['DangMuon', 'SapDenHan'].includes(detail.TrangThaiChiTiet)) continue;

            const hanTra = new Date(detail.HanTra);
            hanTra.setHours(0, 0, 0, 0);

            if (hanTra >= startOfToday) continue; // Chưa quá hạn

            // *** CORE BUSINESS LOGIC: Tính toán và ghi vào DB ***
            const soNgayTre = Math.floor((startOfToday - hanTra) / MS_PER_DAY);
            const tienPhat = soNgayTre * finePerDay;

            // Ghi nhận biến đổi trạng thái vào cơ sở dữ liệu
            bulkOps.push({
                updateOne: {
                    filter: { _id: record._id, 'ChiTiet._id': detail._id },
                    update: {
                        $set: {
                            'ChiTiet.$.TrangThaiChiTiet': 'QuaHan',
                            'ChiTiet.$.TienPhat': tienPhat, // Ghi TienPhat tích lũy vào DB
                        },
                    },
                },
            });

            // Thông báo là kết quả phụ họa từ biến đổi trạng thái
            notifications.push({
                MaTaiKhoan: reader.MaTaiKhoan,
                TieuDe: 'Quá hạn trả sách - Phát sinh phí phạt',
                NoiDung: `Bạn đã trễ hạn trả sách trong phiếu #${record._id} được ${soNgayTre} ngày. Tiền phạt hiện tại: ${tienPhat.toLocaleString('vi-VN')} VNĐ (${finePerDay.toLocaleString('vi-VN')} VNĐ/ngày). Vui lòng đến thư viện trả sách ngay để tránh phát sinh thêm phí.`,
                NgayTao: new Date(),
            });

            recordModified = true;
            totalOverdueDetails++;
        }

        // Nếu record bị thay đổi, không cần làm gì thêm — bulkWrite sẽ xử lý
        void recordModified;
    }

    // Thực thi cập nhật hàng loạt vào DB (CORE: đây là tác động chính)
    if (bulkOps.length > 0) {
        await PhieuMuon.bulkWrite(bulkOps);
        console.log(
            `[Task 2] Đã cập nhật ${totalOverdueDetails} chi tiết → QuaHan + ghi TienPhat vào DB`
        );
    }

    // Gửi thông báo (kết quả phụ)
    await bulkNotify(notifications);
    console.log(`[Task 2] Đã gửi ${notifications.length} thông báo quá hạn.`);
}

// ─────────────────────────────────────────────────────────────
// MAIN: Khởi động Cron Job
// ─────────────────────────────────────────────────────────────
function startOverdueJob() {
    // Chạy mỗi ngày lúc 00:05 AM
    cron.schedule(
        '5 0 * * *',
        async () => {
            const today = new Date();
            console.log(`\n[Overdue Job] Bắt đầu chạy lúc ${today.toLocaleString('vi-VN')}`);

            try {
                await task1_WarnUpcomingDue(today);
            } catch (err) {
                console.error('[Overdue Job][Task 1] Lỗi:', err.message);
            }

            try {
                await task2_ProcessOverdue(today);
            } catch (err) {
                console.error('[Overdue Job][Task 2] Lỗi:', err.message);
            }

            console.log('[Overdue Job] Hoàn thành.\n');
        },
        {
            timezone: 'Asia/Ho_Chi_Minh', // Múi giờ Việt Nam
        }
    );

    console.log('[Overdue Job] Đã đăng ký cron job (00:05 AM hàng ngày, múi giờ VN)');
}

/**
 * Hàm chạy thủ công để test (dùng trong development)
 * Gọi qua: GET /api/borrows/admin/trigger-overdue-job
 */
async function runManually() {
    const today = new Date();
    console.log(`\n[Overdue Job - MANUAL] Kích hoạt thủ công lúc ${today.toLocaleString('vi-VN')}`);
    await task1_WarnUpcomingDue(today);
    await task2_ProcessOverdue(today);
    console.log('[Overdue Job - MANUAL] Xong.\n');
}

module.exports = { startOverdueJob, runManually };

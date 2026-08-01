const mongoose = require('mongoose');
const config = require('./app/config/index')
const MongoDB = require('./app/utils/mongodb.util');
const DauSach = require('./app/models/book.model');
const TheLoai = require('./app/models/category.model');
const NhaXuatBan = require('./app/models/publisher.model');
const CuonSach = require('./app/models/book-copy.model');


async function seedData() {
    try {
        console.log('Đang kết nối tới cơ sở dữ liệu...');
        await MongoDB.connect(config.db.uri);
        console.log('Kết nối thành công. Bắt đầu dọn dẹp dữ liệu cũ...');

        await Promise.all([
            CuonSach.deleteMany({}),
            DauSach.deleteMany({}),
            TheLoai.deleteMany({}),
            NhaXuatBan.deleteMany({})
        ]);

        console.log('Khởi tạo Thể loại và Nhà xuất bản...');
        
        const theLoaiData = await TheLoai.insertMany([
            { TenTheLoai: 'Văn học trong nước', MoTa: 'Tác phẩm văn xuôi, thơ ca của tác giả Việt Nam' },
            { TenTheLoai: 'Văn học nước ngoài', MoTa: 'Các tác phẩm văn học dịch thuật, kinh điển thế giới' },
            { TenTheLoai: 'Khoa học Công nghệ', MoTa: 'Tài liệu tin học, lập trình, trí tuệ nhân tạo' },
            { TenTheLoai: 'Kinh tế - Đầu tư', MoTa: 'Kiến thức thị trường tài chính, quản trị kinh doanh' },
            { TenTheLoai: 'Tâm lý - Kỹ năng', MoTa: 'Phát triển bản thân, ngoại ngữ, tâm lý học' },
            { TenTheLoai: 'Đời sống - Nghệ thuật', MoTa: 'Nông nghiệp cảnh quan, sức khỏe, thiết kế' },
            { TenTheLoai: 'Giáo trình Đại học', MoTa: 'Tài liệu học tập chính quy' }
        ]);

        const nxbData = await NhaXuatBan.insertMany([
            { TenNXB: 'NXB Trẻ', DiaChi: '161B Lý Chính Thắng, Quận 3, TP.HCM' },
            { TenNXB: 'NXB Kim Đồng', DiaChi: '22 Hàng Bài, Hoàn Kiếm, Hà Nội' },
            { TenNXB: 'NXB Tổng hợp TP.HCM', DiaChi: '62 Nguyễn Thị Minh Khai, Quận 1, TP.HCM' },
            { TenNXB: 'NXB Đại học Cần Thơ', DiaChi: 'Khu II, Đường 3/2, Ninh Kiều, Cần Thơ' },
            { TenNXB: 'NXB Thông tin và Truyền thông', DiaChi: '115 Trần Duy Hưng, Cầu Giấy, Hà Nội' }
        ]);

        console.log('Khởi tạo 30 Đầu sách (sách có thật, phổ biến tại các thư viện)...');

        const ds = await DauSach.insertMany([
            // ===== Văn học trong nước =====
            {
                TenSach: 'Mắt Biếc', TacGia: ['Nguyễn Nhật Ánh'], TheLoaiIds: [theLoaiData[0]._id], NamXuatBan: 2018,
                NhaXuatBanId: nxbData[0]._id, DonGia: 110000,
                MoTa: 'Tiểu thuyết kinh điển của Nguyễn Nhật Ánh kể về mối tình đơn phương âm thầm, day dứt của Ngạn dành cho Hà Lan từ thuở thiếu thời cho đến khi trưởng thành. Qua giọng văn nhẹ nhàng, hoài niệm, tác phẩm khắc họa vẻ đẹp làng quê Việt Nam cùng những xúc cảm trong trẻo, buồn man mác của tuổi trẻ. Đây là một trong những tác phẩm được yêu thích và tái bản nhiều nhất của tác giả.',
                HinhAnh: ''
            },
            {
                TenSach: 'Số Đỏ', TacGia: ['Vũ Trọng Phụng'], TheLoaiIds: [theLoaiData[0]._id], NamXuatBan: 2019,
                NhaXuatBanId: nxbData[0]._id, DonGia: 85000,
                MoTa: 'Tiểu thuyết hiện thực trào phúng nổi tiếng, khắc họa xã hội thành thị Việt Nam thời kỳ Âu hóa nửa đầu thế kỷ 20 qua nhân vật Xuân Tóc Đỏ. Bằng bút pháp châm biếm sắc sảo, Vũ Trọng Phụng phơi bày sự lố lăng, giả tạo của tầng lớp thượng lưu rởm đời. Tác phẩm được xem là đỉnh cao của thể loại tiểu thuyết trào phúng trong văn học Việt Nam hiện đại.',
                HinhAnh: ''
            },
            {
                TenSach: 'Dế Mèn Phiêu Lưu Ký', TacGia: ['Tô Hoài'], TheLoaiIds: [theLoaiData[0]._id], NamXuatBan: 2020,
                NhaXuatBanId: nxbData[1]._id, DonGia: 65000,
                MoTa: 'Tác phẩm thiếu nhi kinh điển kể về hành trình trưởng thành của chú Dế Mèn, từ một chàng trai kiêu ngạo, bồng bột trở thành một hiệp sĩ giàu lòng nhân ái sau nhiều chuyến phiêu lưu. Câu chuyện gửi gắm những bài học sâu sắc về tình bạn, lòng dũng cảm và sự khiêm tốn. Đây là một trong những cuốn sách gối đầu giường của nhiều thế hệ độc giả Việt Nam.',
                HinhAnh: ''
            },
            {
                TenSach: 'Đất Rừng Phương Nam', TacGia: ['Đoàn Giỏi'], TheLoaiIds: [theLoaiData[0]._id], NamXuatBan: 2021,
                NhaXuatBanId: nxbData[1]._id, DonGia: 95000,
                MoTa: 'Bức tranh thiên nhiên và con người Nam Bộ được tái hiện sống động qua hành trình lưu lạc của cậu bé An giữa những cánh rừng U Minh hoang sơ. Tác phẩm khắc họa đời sống sông nước, những con người chất phác, nghĩa hiệp và bối cảnh kháng chiến của vùng đất phương Nam. Với lối kể chuyện mộc mạc, cuốn sách đã trở thành tư liệu văn học quý về văn hóa Nam Bộ.',
                HinhAnh: ''
            },
            {
                TenSach: 'Truyện Kiều', TacGia: ['Nguyễn Du'], TheLoaiIds: [theLoaiData[0]._id], NamXuatBan: 2022,
                NhaXuatBanId: nxbData[2]._id, DonGia: 98000,
                MoTa: 'Kiệt tác thơ Nôm lục bát kể về cuộc đời đầy truân chuyên của nàng Thúy Kiều, người con gái tài sắc phải trải qua mười lăm năm lưu lạc để giữ trọn chữ hiếu và tình. Tác phẩm là đỉnh cao của ngôn ngữ và nghệ thuật thơ ca dân tộc, phản ánh sâu sắc số phận con người trong xã hội phong kiến. Truyện Kiều được xem là áng văn chương tiêu biểu nhất của văn học cổ điển Việt Nam.',
                HinhAnh: ''
            },

            // ===== Văn học nước ngoài =====
            {
                TenSach: 'Nhà Giả Kim', TacGia: ['Paulo Coelho'], TheLoaiIds: [theLoaiData[1]._id], NamXuatBan: 2020,
                NhaXuatBanId: nxbData[0]._id, DonGia: 79000,
                MoTa: 'Cuốn tiểu thuyết ngụ ngôn nổi tiếng kể về hành trình của cậu bé chăn cừu Santiago đi tìm kho báu ở vùng đất Ai Cập xa xôi. Trên đường đi, cậu gặp gỡ nhiều con người và học được những bài học quý giá về việc lắng nghe trái tim, tin vào vận mệnh và ý nghĩa thực sự của hành trình sống. Tác phẩm đã được dịch ra hàng chục thứ tiếng và trở thành một trong những cuốn sách bán chạy nhất mọi thời đại.',
                HinhAnh: ''
            },
            {
                TenSach: 'Hai Số Phận', TacGia: ['Jeffrey Archer'], TheLoaiIds: [theLoaiData[1]._id], NamXuatBan: 2019,
                NhaXuatBanId: nxbData[0]._id, DonGia: 155000,
                MoTa: 'Cuộc đời song song của hai con người có xuất thân đối lập, một sinh ra trong nhung lụa và một lớn lên trong nghèo khó, được đan xen tài tình qua nhiều thập kỷ đầy biến động. Tiểu thuyết khai thác chủ đề giai cấp, tham vọng và số phận con người trong bối cảnh lịch sử nước Anh và Mỹ đầu thế kỷ 20. Với cốt truyện lôi cuốn, tác phẩm là một trong những cuốn sách được yêu thích nhất của Jeffrey Archer.',
                HinhAnh: ''
            },
            {
                TenSach: 'Suối Nguồn', TacGia: ['Ayn Rand'], TheLoaiIds: [theLoaiData[1]._id], NamXuatBan: 2018,
                NhaXuatBanId: nxbData[0]._id, DonGia: 250000,
                MoTa: 'Tiểu thuyết triết học đồ sộ xoay quanh kiến trúc sư Howard Roark, người kiên định theo đuổi lý tưởng nghệ thuật của riêng mình bất chấp áp lực từ xã hội. Tác phẩm đặt ra những câu hỏi lớn về tính độc lập tư duy, sự thỏa hiệp và giá trị của cái tôi sáng tạo. Đây là một trong những tác phẩm gây tranh luận và có ảnh hưởng nhất của Ayn Rand.',
                HinhAnh: ''
            },
            {
                TenSach: 'Không Gia Đình', TacGia: ['Hector Malot'], TheLoaiIds: [theLoaiData[1]._id], NamXuatBan: 2021,
                NhaXuatBanId: nxbData[1]._id, DonGia: 135000,
                MoTa: 'Câu chuyện cảm động về cậu bé mồ côi Remi cùng gánh xiếc rong ruổi khắp nước Pháp để mưu sinh và đi tìm nguồn cội của mình. Xuyên suốt hành trình đầy gian truân, Remi học được lòng biết ơn, tình bạn và nghị lực vượt qua nghịch cảnh. Tác phẩm kinh điển của văn học thiếu nhi thế giới đã lay động biết bao thế hệ độc giả.',
                HinhAnh: ''
            },
            {
                TenSach: 'Tội Ác Và Hình Phạt', TacGia: ['Fyodor Dostoevsky'], TheLoaiIds: [theLoaiData[1]._id], NamXuatBan: 2020,
                NhaXuatBanId: nxbData[2]._id, DonGia: 180000,
                MoTa: 'Kiệt tác phân tích tâm lý tội phạm, theo chân sinh viên nghèo Raskolnikov sau khi gây ra tội ác giết người và những giằng xé nội tâm dằn vặt sau đó. Dostoevsky khắc họa sâu sắc bi kịch đạo đức, sự cắn rứt lương tâm và hành trình tìm kiếm sự cứu rỗi của con người. Tác phẩm được coi là một trong những đỉnh cao của văn học hiện thực tâm lý Nga.',
                HinhAnh: ''
            },

            // ===== Khoa học Công nghệ / Giáo trình Đại học =====
            {
                TenSach: 'Cấu Trúc Dữ Liệu Và Giải Thuật', TacGia: ['Đỗ Xuân Lôi'], TheLoaiIds: [theLoaiData[2]._id, theLoaiData[6]._id], NamXuatBan: 2019,
                NhaXuatBanId: nxbData[3]._id, DonGia: 145000,
                MoTa: 'Giáo trình kinh điển được nhiều trường đại học Việt Nam sử dụng, trình bày có hệ thống các cấu trúc dữ liệu cơ bản như danh sách, ngăn xếp, hàng đợi, cây và đồ thị cùng các giải thuật xử lý tương ứng. Sách chú trọng phân tích độ phức tạp thuật toán và cách lựa chọn cấu trúc dữ liệu phù hợp cho từng bài toán cụ thể. Đây là tài liệu nền tảng quan trọng cho sinh viên ngành Công nghệ thông tin.',
                HinhAnh: ''
            },
            {
                TenSach: 'Giải Thuật Và Lập Trình', TacGia: ['Lê Minh Hoàng'], TheLoaiIds: [theLoaiData[2]._id, theLoaiData[6]._id], NamXuatBan: 2020,
                NhaXuatBanId: nxbData[4]._id, DonGia: 165000,
                MoTa: 'Cuốn sách nổi tiếng và quen thuộc với nhiều thế hệ học sinh, sinh viên yêu thích lập trình thi đấu tại Việt Nam, biên soạn bởi giảng viên Đại học Sư phạm Hà Nội. Nội dung bao quát các thuật toán liệt kê, quay lui, quy hoạch động, đồ thị và nhiều kỹ thuật lập trình nâng cao khác, kèm ví dụ minh họa cụ thể. Sách là tài liệu ôn luyện quan trọng cho các kỳ thi học sinh giỏi Tin học và lập trình thi đấu.',
                HinhAnh: ''
            },
            {
                TenSach: 'Kỹ Thuật Lập Trình C Căn Bản Và Nâng Cao', TacGia: ['Phạm Văn Ất'], TheLoaiIds: [theLoaiData[2]._id, theLoaiData[6]._id], NamXuatBan: 2021,
                NhaXuatBanId: nxbData[4]._id, DonGia: 175000,
                MoTa: 'Giáo trình phổ biến trình bày ngôn ngữ lập trình C từ cú pháp cơ bản, con trỏ, mảng, cấu trúc dữ liệu cho đến các kỹ thuật lập trình nâng cao và làm việc với tệp. Sách có nhiều ví dụ minh họa và bài tập thực hành giúp người học rèn luyện tư duy lập trình một cách bài bản. Đây là tài liệu quen thuộc trong chương trình đào tạo Tin học tại nhiều trường đại học, cao đẳng Việt Nam.',
                HinhAnh: ''
            },
            {
                TenSach: 'Toán Rời Rạc', TacGia: ['Nguyễn Đức Nghĩa', 'Nguyễn Tô Thành'], TheLoaiIds: [theLoaiData[2]._id, theLoaiData[6]._id], NamXuatBan: 2022,
                NhaXuatBanId: nxbData[3]._id, DonGia: 155000,
                MoTa: 'Giáo trình nền tảng về toán rời rạc dành cho sinh viên ngành Công nghệ thông tin, bao gồm các nội dung về logic mệnh đề, tập hợp, quan hệ, tổ hợp, đồ thị và cây. Sách trình bày chặt chẽ cơ sở toán học cần thiết để hiểu và phân tích các thuật toán trong khoa học máy tính. Đây là tài liệu tham khảo quan trọng, được nhiều trường đại học kỹ thuật tại Việt Nam sử dụng.',
                HinhAnh: ''
            },
            {
                TenSach: 'Nhập Môn Cơ Sở Dữ Liệu', TacGia: ['Đỗ Trung Tuấn'], TheLoaiIds: [theLoaiData[2]._id, theLoaiData[6]._id], NamXuatBan: 2020,
                NhaXuatBanId: nxbData[3]._id, DonGia: 125000,
                MoTa: 'Giáo trình cung cấp kiến thức nền tảng về hệ cơ sở dữ liệu, mô hình thực thể liên kết, chuẩn hóa dữ liệu và ngôn ngữ truy vấn có cấu trúc SQL. Sách hướng dẫn từng bước cách thiết kế cơ sở dữ liệu quan hệ và quản trị dữ liệu hiệu quả. Tài liệu phù hợp cho sinh viên các ngành công nghệ thông tin, hệ thống thông tin quản lý tại các trường đại học.',
                HinhAnh: ''
            },

            // ===== Kinh tế - Đầu tư =====
            {
                TenSach: 'Cha Giàu Cha Nghèo', TacGia: ['Robert Kiyosaki'], TheLoaiIds: [theLoaiData[3]._id], NamXuatBan: 2019,
                NhaXuatBanId: nxbData[0]._id, DonGia: 115000,
                MoTa: 'Cuốn sách kể qua câu chuyện đối lập giữa hai người cha với hai tư duy tài chính khác nhau, nhấn mạnh tầm quan trọng của việc phân biệt tài sản và tiêu sản. Tác giả khuyến khích xây dựng nguồn thu nhập thụ động và hiểu biết tài chính thay vì chỉ dựa vào lương. Đây là một trong những cuốn sách phổ biến nhất về giáo dục tài chính cá nhân trên toàn thế giới.',
                HinhAnh: ''
            },
            {
                TenSach: 'Nhà Đầu Tư Thông Minh', TacGia: ['Benjamin Graham'], TheLoaiIds: [theLoaiData[3]._id], NamXuatBan: 2021,
                NhaXuatBanId: nxbData[2]._id, DonGia: 245000,
                MoTa: 'Được xem là "kinh thánh" của giới đầu tư giá trị, cuốn sách trình bày các nguyên tắc đầu tư an toàn, phân biệt giữa đầu tư và đầu cơ, cùng khái niệm biên độ an toàn khi định giá cổ phiếu. Tác giả, người thầy của Warren Buffett, nhấn mạnh kỷ luật và tư duy dài hạn thay vì chạy theo biến động ngắn hạn của thị trường. Cuốn sách có ảnh hưởng sâu rộng đến nhiều thế hệ nhà đầu tư trên thế giới.',
                HinhAnh: ''
            },
            {
                TenSach: 'Bước Đi Ngẫu Nhiên Trên Phố Wall', TacGia: ['Burton G. Malkiel'], TheLoaiIds: [theLoaiData[3]._id], NamXuatBan: 2020,
                NhaXuatBanId: nxbData[0]._id, DonGia: 210000,
                MoTa: 'Cuốn sách phân tích thị trường chứng khoán qua lăng kính lý thuyết thị trường hiệu quả, chỉ ra vì sao phần lớn nỗ lực "đánh bại thị trường" thường không mang lại kết quả bền vững. Tác giả đề xuất chiến lược đầu tư dài hạn vào quỹ chỉ số như một giải pháp thực tế cho nhà đầu tư cá nhân. Cuốn sách đã trở thành kinh điển trong lĩnh vực tài chính cá nhân và đầu tư thụ động.',
                HinhAnh: ''
            },
            {
                TenSach: 'Phân Tích Kỹ Thuật Thị Trường Chứng Khoán', TacGia: ['John J. Murphy'], TheLoaiIds: [theLoaiData[3]._id], NamXuatBan: 2021,
                NhaXuatBanId: nxbData[2]._id, DonGia: 350000,
                MoTa: 'Cẩm nang toàn diện về các công cụ phân tích kỹ thuật kinh điển như đường xu hướng, mô hình nến, chỉ báo dao động và phân tích khối lượng giao dịch. Sách trình bày rõ ràng nền tảng lý thuyết lẫn ứng dụng thực tế trong việc đọc biểu đồ giá và ra quyết định giao dịch. Đây là tài liệu tham khảo phổ biến cho cả nhà đầu tư mới lẫn chuyên nghiệp.',
                HinhAnh: ''
            },
            {
                TenSach: 'Từ Tốt Đến Vĩ Đại', TacGia: ['Jim Collins'], TheLoaiIds: [theLoaiData[3]._id], NamXuatBan: 2022,
                NhaXuatBanId: nxbData[2]._id, DonGia: 189000,
                MoTa: 'Công trình nghiên cứu quản trị dựa trên khảo sát nhiều năm về các doanh nghiệp đã chuyển mình từ mức trung bình lên vượt trội và duy trì thành công bền vững. Tác giả đúc kết những nguyên tắc lãnh đạo, chiến lược con người và văn hóa kỷ luật giúp doanh nghiệp trở nên vĩ đại. Cuốn sách được xem là tài liệu tham khảo kinh điển trong lĩnh vực quản trị kinh doanh.',
                HinhAnh: ''
            },

            // ===== Tâm lý - Kỹ năng =====
            {
                TenSach: 'Đắc Nhân Tâm', TacGia: ['Dale Carnegie'], TheLoaiIds: [theLoaiData[4]._id], NamXuatBan: 2018,
                NhaXuatBanId: nxbData[2]._id, DonGia: 85000,
                MoTa: 'Nghệ thuật giao tiếp và thu phục lòng người được đúc kết qua những nguyên tắc ứng xử đơn giản nhưng sâu sắc, giúp người đọc xây dựng mối quan hệ tốt đẹp trong công việc và đời sống. Sách nhấn mạnh tầm quan trọng của sự chân thành, biết lắng nghe và khen ngợi đúng lúc. Đây là một trong những cuốn sách kỹ năng sống bán chạy nhất mọi thời đại.',
                HinhAnh: ''
            },
            {
                TenSach: 'Tư Duy Nhanh Và Chậm', TacGia: ['Daniel Kahneman'], TheLoaiIds: [theLoaiData[4]._id], NamXuatBan: 2019,
                NhaXuatBanId: nxbData[2]._id, DonGia: 210000,
                MoTa: 'Nhà tâm lý học đoạt giải Nobel phân tích hai hệ thống tư duy chi phối quyết định của con người - một nhanh, trực giác và cảm tính, một chậm, logic và tốn nhiều nỗ lực - qua hàng loạt thí nghiệm kinh điển. Cuốn sách hé lộ những thiên kiến nhận thức âm thầm chi phối cách con người phán đoán và ra quyết định hàng ngày. Đây là một trong những công trình có ảnh hưởng lớn nhất về tâm lý học hành vi hiện đại.',
                HinhAnh: ''
            },
            {
                TenSach: 'Sức Mạnh Của Thói Quen', TacGia: ['Charles Duhigg'], TheLoaiIds: [theLoaiData[4]._id], NamXuatBan: 2020,
                NhaXuatBanId: nxbData[0]._id, DonGia: 160000,
                MoTa: 'Cuốn sách lý giải cách thói quen định hình cuộc sống con người qua cơ chế "vòng lặp thói quen" gồm gợi ý, hành động và phần thưởng. Tác giả dẫn chứng từ các cá nhân, doanh nghiệp và cộng đồng để minh họa cách thói quen có thể được tái lập một cách có chủ đích. Cuốn sách mang đến công cụ thiết thực để xây dựng thói quen tích cực và loại bỏ thói quen xấu.',
                HinhAnh: ''
            },
            {
                TenSach: 'Sapiens: Lược Sử Loài Người', TacGia: ['Yuval Noah Harari'], TheLoaiIds: [theLoaiData[4]._id, theLoaiData[2]._id], NamXuatBan: 2021,
                NhaXuatBanId: nxbData[2]._id, DonGia: 255000,
                MoTa: 'Hành trình phát triển của loài người được kể lại từ thời kỳ săn bắt hái lượm cho đến cách mạng nông nghiệp, khoa học và công nghệ hiện đại. Tác giả phân tích cách những câu chuyện, tôn giáo và hệ thống tiền tệ đã giúp loài người hợp tác ở quy mô lớn. Cuốn sách mang đến góc nhìn liên ngành độc đáo về vị trí của con người trong dòng chảy lịch sử.',
                HinhAnh: ''
            },
            {
                TenSach: '7 Thói Quen Để Thành Đạt', TacGia: ['Stephen R. Covey'], TheLoaiIds: [theLoaiData[4]._id], NamXuatBan: 2022,
                NhaXuatBanId: nxbData[0]._id, DonGia: 175000,
                MoTa: 'Tác phẩm kinh điển về phát triển bản thân, trình bày bảy nguyên tắc nền tảng giúp con người chuyển từ sự phụ thuộc sang độc lập rồi đến sự tương thuộc hiệu quả. Sách nhấn mạnh việc chủ động, xác định mục tiêu rõ ràng, ưu tiên việc quan trọng và không ngừng đổi mới bản thân. Đây là một trong những cuốn sách kỹ năng sống có ảnh hưởng nhất trong nhiều thập kỷ qua.',
                HinhAnh: ''
            },

            // ===== Đời sống - Nghệ thuật =====
            {
                TenSach: 'Muôn Kiếp Nhân Sinh', TacGia: ['Nguyên Phong'], TheLoaiIds: [theLoaiData[5]._id], NamXuatBan: 2021,
                NhaXuatBanId: nxbData[2]._id, DonGia: 250000,
                MoTa: 'Cuốn sách ghi lại những trải nghiệm về tiền kiếp và luật nhân quả qua lời kể của một doanh nhân từng trải qua nhiều biến cố lớn trong cuộc đời. Tác phẩm lồng ghép những suy ngẫm về ý nghĩa cuộc sống, đạo đức và sự trưởng thành tâm linh. Đây là một trong những cuốn sách được đông đảo độc giả Việt Nam tìm đọc trong những năm gần đây.',
                HinhAnh: ''
            },
            {
                TenSach: 'Cà Phê Cùng Tony', TacGia: ['Tony Buổi Sáng'], TheLoaiIds: [theLoaiData[5]._id], NamXuatBan: 2019,
                NhaXuatBanId: nxbData[0]._id, DonGia: 90000,
                MoTa: 'Tuyển tập những bài viết ngắn gọn, dí dỏm về khởi nghiệp, lối sống và tư duy tích cực, được lan truyền rộng rãi trên mạng xã hội trước khi in thành sách. Tác phẩm truyền cảm hứng cho nhiều bạn trẻ Việt Nam về tinh thần tự lập, chăm chỉ và tư duy toàn cầu. Đây là một hiện tượng xuất bản quen thuộc với độc giả trẻ trong nước.',
                HinhAnh: ''
            },
            {
                TenSach: 'Lối Sống Tối Giản Của Người Nhật', TacGia: ['Sasaki Fumio'], TheLoaiIds: [theLoaiData[5]._id], NamXuatBan: 2020,
                NhaXuatBanId: nxbData[0]._id, DonGia: 89000,
                MoTa: 'Tác giả chia sẻ hành trình cá nhân từ bỏ lối sống tiêu dùng dư thừa để hướng đến sự tối giản, gọn gàng và tập trung vào những giá trị thực sự quan trọng. Sách đưa ra những gợi ý cụ thể để giảm bớt đồ đạc, sắp xếp không gian sống và tìm lại sự bình yên trong tâm trí. Cuốn sách góp phần khơi dậy trào lưu sống tối giản phổ biến tại nhiều quốc gia, trong đó có Việt Nam.',
                HinhAnh: ''
            },
            {
                TenSach: 'Điểm Đến Của Cuộc Đời', TacGia: ['Đặng Hoàng Giang'], TheLoaiIds: [theLoaiData[5]._id], NamXuatBan: 2022,
                NhaXuatBanId: nxbData[2]._id, DonGia: 125000,
                MoTa: 'Tác phẩm ghi lại những câu chuyện có thật về hành trình đối diện với bệnh tật và cái chết của nhiều nhân vật, qua đó gợi mở những suy ngẫm về ý nghĩa của sự sống. Tác giả tiếp cận chủ đề nhạy cảm này bằng sự thấu cảm và tôn trọng, giúp người đọc nhìn nhận cái chết một cách nhẹ nhàng, nhân văn hơn. Cuốn sách nhận được nhiều sự quan tâm của độc giả Việt Nam khi bàn về chăm sóc giảm nhẹ cuối đời.',
                HinhAnh: ''
            },
            {
                TenSach: 'Ikigai - Bí Mật Sống Trường Thọ Và Hạnh Phúc Của Người Nhật', TacGia: ['Héctor García', 'Francesc Miralles'], TheLoaiIds: [theLoaiData[5]._id], NamXuatBan: 2018,
                NhaXuatBanId: nxbData[0]._id, DonGia: 128000,
                MoTa: 'Cuốn sách khám phá khái niệm "ikigai" - lý do để thức dậy mỗi sáng - qua lăng kính văn hóa và lối sống của người dân đảo Okinawa, Nhật Bản, nơi có tỷ lệ người sống thọ cao bậc nhất thế giới. Tác giả kết hợp nghiên cứu khoa học với những câu chuyện đời thường để lý giải mối liên hệ giữa mục đích sống, chế độ ăn uống và tinh thần lạc quan. Cuốn sách truyền cảm hứng cho độc giả tìm kiếm sự cân bằng và ý nghĩa trong cuộc sống hàng ngày.',
                HinhAnh: ''
            }
        ]);
        console.log('Đang phát sinh các bản copy Cuốn sách...');
        const cuonSachList = [];
        const trangThaiOptions = ['SanSang', 'Pending', 'DangMuon', 'HongMat'];
        const tinhTrangOptions = [ 'Tốt', 'Bình thường', 'Hơi sờn góc', 'Rách trang bìa'];

        ds.forEach((dauSach) => {
            const soLuongCopy = Math.floor(Math.random() * 3) + 3;
            for (let i = 0; i < soLuongCopy; i++) {
                const randomTrangThai = trangThaiOptions[Math.floor(Math.random() * trangThaiOptions.length)];
                const randomTinhTrang = tinhTrangOptions[Math.floor(Math.random() * tinhTrangOptions.length)];
                
                cuonSachList.push({
                    DauSachId: dauSach._id,
                    TinhTrangVatLy: randomTrangThai === 'HongMat' ? 'Hư hỏng nặng' : randomTinhTrang,
                    TrangThai: randomTrangThai
                });
            }
        });

        await CuonSach.insertMany(cuonSachList);

        console.log(`Hoàn tất! Đã tạo:
        - ${theLoaiData.length} Thể loại
        - ${nxbData.length} Nhà xuất bản
        - ${ds.length} Đầu sách
        - ${cuonSachList.length} Bản copy (Cuốn sách)`);

        process.exit(0);
    } catch (error) {
        console.error('Lỗi trong quá trình tạo dữ liệu:', error);
        process.exit(1);
    }
}

seedData();
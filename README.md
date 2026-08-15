# 🎙️ Thai Thong · TTS Đa Ngôn Ngữ
**Công cụ Đọc Văn Bản & Trích Xuất Nội Dung Thông Minh – Web Edition**

> Ứng dụng Text-to-Speech đa ngôn ngữ chạy hoàn toàn trên trình duyệt, hỗ trợ đọc văn bản, trích xuất nội dung từ link báo/truyện, xuất PDF chuẩn A4 và nhiều tính năng nâng cao.

**Tác giả:** Thái Thông  
**Phiên bản:** Web Edition  
**Công nghệ:** Web Speech API + Vanilla JavaScript

---
https://kcydvn-a11y.github.io/TTS-reader/
---
## ✨ TÍNH NĂNG NỔI BẬT

- **Đọc giọng máy đa ngôn ngữ**  
  Hỗ trợ hơn 20 ngôn ngữ: Tiếng Việt, English, 日本語, 中文, 한국어, Français, Deutsch, Español, Русский, ไทย, Bahasa Indonesia…

- **Tự động phát hiện ngôn ngữ**  
  Phân tích script + từ vựng để chọn đúng giọng đọc phù hợp.

- **Trích xuất nội dung từ URL**  
  Dán link báo chí, blog, truyện chữ → tự động bóc tách nội dung sạch, loại bỏ menu/quảng cáo.

- **Chuẩn bị văn bản thông minh**  
  - Chuyển số La Mã thành chữ (đặc biệt tối ưu cho tiếng Việt)  
  - Xử lý ngày tháng, giờ, viết tắt (TP.HCM, SĐT, kg, VNĐ…)  
  - Làm sạch markdown, emoji, link, ký tự rác

- **Điều khiển đọc linh hoạt**  
  - Tốc độ từ 1x → 6x  
  - Nhảy đến câu bất kỳ  
  - Tạm dừng / Tiếp tục / Dừng  
  - Chọn giọng đọc thủ công

- **Chỉnh sửa nội dung trực tiếp**  
  Sửa / xóa phần không muốn đọc ngay trên giao diện, sau đó cập nhật lại.

- **Xuất PDF chuẩn A4**  
  Phân trang đẹp, không bị cắt chữ, có header/footer chuyên nghiệp.

- **Giao diện hiện đại**  
  Dark theme, hỗ trợ mobile, modal ủng hộ dự án tiện lợi.

---

## 🧠 CÔNG NGHỆ BÊN TRONG

| Thành phần                  | Mô tả                                                                 |
|----------------------------|-----------------------------------------------------------------------|
| **Web Speech API**         | Động cơ đọc giọng máy native của trình duyệt                         |
| **Language Detection**     | Kết hợp Unicode script + scoring từ vựng đa ngôn ngữ                 |
| **Smart Text Preparation**| Xử lý số La Mã, ngày tháng, viết tắt, ký tự đặc biệt                 |
| **Chunk Engine**           | Tách văn bản thành đoạn ≤ 220 ký tự để đọc mượt, chống kẹt           |
| **URL Content Extractor**  | Jina Reader + DOM Parser + CORS Proxy đa tầng                        |
| **PDF Generator**          | html2canvas + jsPDF, phân trang A4 chuẩn, không cắt chữ              |
| **Voice Ranking**          | Tự chọn giọng Neural / Natural tốt nhất theo ngôn ngữ                |

---

## 📥 CÁCH SỬ DỤNG

### 1. Đọc văn bản
1. Dán nội dung vào ô **Văn bản**
2. Nhấn **Xử lý & Chuẩn bị đọc**
3. Chọn tốc độ / giọng đọc
4. Nhấn **ĐỌC GIỌNG MÁY**

### 2. Đọc từ link trang web
1. Chuyển sang tab **Link trang web**
2. Dán URL bài viết / báo / truyện
3. (Tùy chọn) Chỉnh CSS Selector nếu lấy sai nội dung
4. Nhấn **Xử lý & Chuẩn bị đọc**

### 3. Xuất PDF
- Sau khi có nội dung → nhấn **📄 XUẤT PDF**
- File PDF sẽ được tạo với phân trang A4 đẹp, header/footer chuyên nghiệp

---

## 🌐 NGÔN NGỮ ĐƯỢC HỖ TRỢ

| Mã   | Ngôn ngữ              | Mã   | Ngôn ngữ              |
|------|-----------------------|------|-----------------------|
| vi   | Tiếng Việt            | en   | English               |
| ja   | 日本語                | zh   | 中文                  |
| ko   | 한국어                | fr   | Français              |
| de   | Deutsch               | es   | Español               |
| ru   | Русский               | th   | ไทย                   |
| id   | Bahasa Indonesia      | pt   | Português             |
| it   | Italiano              | hi   | हिन्दी                |
| ar   | العربية               | tr   | Türkçe                |
| pl   | Polski                | nl   | Nederlands            |
| ms   | Bahasa Melayu         | uk   | Українська            |

---

## 💡 MẸO GIỌNG ĐỌC HAY HƠN

- **Khuyên dùng Microsoft Edge**: Có sẵn giọng AI **HoaiMy / An (Natural)** cực chuẩn, không cần cài thêm.
- **Windows**: Cài đặt → Thời gian & Ngôn ngữ → Giọng nói → Thêm giọng Tiếng Việt.
- **Android**: Cài đặt → Văn bản thành giọng nói → Công cụ TTS của Google → Tải gói Tiếng Việt.
- **iOS / macOS**: Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → Tải giọng “Linh (Tự nhiên)”.

---

## 📋 LƯU Ý

- Ứng dụng chạy hoàn toàn trên trình duyệt, **không cần cài đặt**.
- Chất lượng giọng đọc phụ thuộc vào hệ thống và trình duyệt của bạn.
- Một số trang web có bảo vệ chống bot có thể không trích xuất được nội dung.

---

## 🔧 LIÊN HỆ & ỦNG HỘ DỰ ÁN

- **Tác giả:** Thái Thông  
- **Email:** [ThaiThongsj@gmail.com](mailto:ThaiThongsj@gmail.com)

### 💰 Ủng hộ dự án
**Vietcombank**  
Số tài khoản: `9898661918`  
Chủ tài khoản: **NGUYỄN NGỌC THÁI THÔNG**

---

**Cảm ơn bạn đã sử dụng Thai Thong · TTS Đa Ngôn Ngữ!**  
Chúc bạn có trải nghiệm đọc văn bản mượt mà và tiện lợi. ✨

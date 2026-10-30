# HỆ THỐNG QUẢN LÝ ĐA PAGE & LỊCH VIDEO DRIVE (FB VIDEO HUB)

Hệ thống web chuyên dụng cho công việc quản trị video đa Fanpage Facebook:
- **Phía Bạn (Editor / Admin):** Quản lý đa Page, nhập trước danh sách Title (hàng loạt), kết nối Google Drive tự động quét nhận diện file video theo STT/Title, chủ động lên lịch & đổi trạng thái đăng bài, có toàn quyền sửa/thay thế video mới khi nhận đánh giá từ khách.
- **Phía Đối tác / Khách hàng (Client Reviewer):** Xem bảng lịch video, xem trước video trực tiếp, chấm sao đánh giá, gửi ghi chú / góp ý chi tiết và phản hồi nhanh.

---

## 1. Cài đặt và Khởi chạy tại máy (Local)

Hệ thống đã được cài đặt sẵn. Để chạy web:

```bash
# Chạy ở chế độ phát triển
npm run dev
```

Mở trình duyệt truy cập: **`http://localhost:3000`**

---

## 2. Hướng dẫn sử dụng chi tiết

### A. Phía Bạn (Giao diện Quản trị / Editor)

1. **Quản lý Đa Page Facebook:**
   - Bấm **`+ Thêm Page FB`** để tạo các Page khác nhau (ví dụ: Page Bất Động Sản, Page Tin Tức, Page Giải Trí...).
   - Mỗi Page có thể gắn kèm **Link thư mục Google Drive** riêng.
   - Bấm vào từng tab Page để chuyển đổi tức thì.

2. **Nhập nhanh danh sách Title (Bulk Import):**
   - Bấm nút **`+ Nhập Danh Sách Title`**.
   - Copy-paste danh sách 30 - 50 tiêu đề (mỗi dòng 1 bài).
   - Chọn ngày bắt đầu và khung giờ mẫu $\rightarrow$ Hệ thống tự động tách STT liên tục và tính ngày đăng kế tiếp cho từng bài.

3. **Quét & Tự Nhận Diện Video trên Google Drive:**
   - Bấm nút **`Quét & Tự Nhận Diện Drive`**.
   - Có 2 cách tiện lợi:
     * **Cách 1 (Nhanh nhất):** Bạn vừa xuất file hoặc up lên Drive xong, chỉ cần copy tên các file (ví dụ: `01_TieuDe.mp4`, `02_TieuDe.mp4` hoặc link drive) dán vào ô $\rightarrow$ Bấm quét, hệ thống tự động tìm đúng video theo STT và đổi trạng thái thành **"Đã có trên Drive"**.
     * **Cách 2:** Điền Google Drive API Key vào mục Cài đặt (bánh răng) để web quét tự động folder.

4. **Sửa / Thay đổi Video khi nhận góp ý của Khách:**
   - Khi khách để lại ghi chú hoặc chấm điểm, bạn sẽ thấy ngay nội dung góp ý tại cột **"Đánh giá & Góp ý từ Khách"**.
   - Bấm nút **`Sửa / Đổi video`**:
     * Bạn có thể dán link video mới (sau khi render lại).
     * Điền ghi chú phản hồi: *"Đã sửa âm thanh giây 20 và re-up bản mới"*.
     * Tích chọn: *"Đã sửa video theo góp ý của khách"*.

5. **Lên lịch & Đăng bài:**
   - Bạn chủ động click vào dropdown trạng thái để chuyển nhanh: **Chưa làm** $\rightarrow$ **Đã up Drive** $\rightarrow$ **Đã lên lịch FB** $\rightarrow$ **Đã đăng FB**.

---

### B. Phía Khách hàng / Đối tác (Giao diện Khách xem)

1. **Cách gửi link cho khách:**
   - Bấm nút **`Link gửi khách`** ở thanh menu trên cùng.
   - Link có dạng: `http://ten-mien-cua-ban/?role=client&pageId=page-1`
   - Khi khách mở link này, giao diện sẽ tự chuyển sang chế độ Khách (ẩn các nút thêm/xóa/quản trị, tập trung xem và góp ý).
   - (Bạn cũng có thể tự bấm nút **"Đổi góc nhìn"** ở góc phải trên cùng để xem trước giao diện của khách).

2. **Các thao tác của khách:**
   - Bấm **"Xem video"** để xem trực tiếp video đã up trên Drive (có trình phát nhúng tiện lợi).
   - Bấm **"Đánh giá / Note ngay"**:
     * Nút phản hồi nhanh 1 chạm: **[Rất ưng ý]**, **[Có góp ý]**, **[Cần lưu ý]**.
     * Chấm sao từ 1 đến 5 ⭐.
     * Viết ghi chú, lời góp ý chi tiết cho Editor.
     * Bấm **Lưu đánh giá** $\rightarrow$ Phía bạn nhận được ngay lập tức.

---

## 3. Hướng dẫn Deploy lên Cloud (Vercel / Render Miễn Phí)

### Deploy lên Vercel (Khuyên dùng - 3 phút):
1. Đẩy mã nguồn lên tài khoản GitHub của bạn:
   ```bash
   git init
   git add .
   git commit -m "Initial commit FB Video Hub"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo>.git
   git push -u origin main
   ```
2. Truy cập [vercel.com](https://vercel.com) (đăng nhập bằng GitHub).
3. Bấm **Add New Project** $\rightarrow$ Chọn repo vừa tạo $\rightarrow$ Bấm **Deploy**.
4. Vercel sẽ tự động cấp một domain miễn phí (ví dụ: `https://fb-hub-xyz.vercel.app`) dùng được trên cả điện thoại và máy tính.


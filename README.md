# Portfolio Next.js Template

Template portfolio cá nhân được xây bằng Next.js để mọi người có thể fork, thay nội dung và triển khai nhanh. Dự án phù hợp cho developer, sinh viên IT, freelancer hoặc bất kỳ ai muốn có một portfolio có blog, trang chứng chỉ, dashboard quản trị và khả năng mở rộng thành CMS cá nhân.

## 1. Công nghệ và cách triển khai

### Công nghệ chính

| Nhóm | Công nghệ | Vai trò |
| --- | --- | --- |
| Frontend | Next.js 16, React 19, TypeScript 5 | Khung ứng dụng chính |
| Styling | Native CSS, 98.css | Giao diện retro kết hợp CSS thuần |
| Đa ngôn ngữ | i18n tự quản lý trong `lib/i18n` | Hỗ trợ `vi` và `en` |
| Dữ liệu | Firebase Firestore | Lưu bài viết, collection, topic, analytics |
| Media | Cloudinary | Upload, resize, xóa ảnh trong trình soạn thảo |
| API | Next.js Route Handlers | Xử lý GitHub API và Cloudinary server-side |
| Biểu đồ | Recharts | Dashboard thống kê lượt xem |
| Editor | Tiptap | Soạn thảo nội dung bài viết ở trang admin |

### Yêu cầu môi trường

- Node.js 20+
- pnpm 9+
- Firebase project nếu muốn dùng Firestore thật
- Cloudinary account nếu muốn upload ảnh từ admin
- GitHub token nếu muốn hiện ô contribution ngoài trang chủ

### Chạy local

1. Clone hoặc fork repo.
2. Cài dependency:

```bash
pnpm install
```

3. Tạo file `.env.local` ở thư mục gốc.
4. Khai báo biến môi trường:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

GITHUB_TOKEN=
```

5. Chạy môi trường development:

```bash
pnpm dev
```

6. Mở trình duyệt tại `http://localhost:3000`.

### Build production

```bash
pnpm build
pnpm start
```

### Triển khai khuyến nghị

#### Vercel

Phù hợp nhất vì dự án dùng Next.js App Router và Route Handlers.

1. Import repo vào Vercel.
2. Thêm toàn bộ biến môi trường như phần local.
3. Build command: `pnpm build`.
4. Output giữ mặc định của Next.js.

#### VPS hoặc server Node.js

1. Cài Node.js và pnpm.
2. Pull source code.
3. Tạo `.env.local` hoặc biến môi trường trên server.
4. Chạy:

```bash
pnpm install
pnpm build
pnpm start
```

## 2. Mục đích của template

Repo này được định hướng làm nền tảng portfolio có thể tái sử dụng, thay vì chỉ là một website cá nhân cố định. Khi fork repo, bạn có thể dùng lại các phần sau:

- Trang chủ giới thiệu bản thân, kỹ năng, social link, project nổi bật.
- Blog cá nhân có phân loại theo collection và topic.
- Trang chứng chỉ để trưng bày học tập hoặc thành tích.
- Admin dashboard để quản lý nội dung và theo dõi page view.
- Bộ định tuyến đa ngôn ngữ `vi/en` để mở rộng nội dung song ngữ.

## 3. Tính năng hiện có

- Trang public gồm home, blog, certificates và fingerprint test.
- Tự chuyển hướng ngôn ngữ theo `accept-language`, mặc định là `vi`.
- Dashboard admin hiển thị thống kê page view 7 ngày gần nhất.
- Khu vực admin quản lý collection, topic, bài viết và upload ảnh qua Cloudinary.
- Tích hợp GitHub contributions bằng GitHub GraphQL API.
- Theo dõi lượt xem trang bằng Firestore.
- Giao diện có hỗ trợ theme và font riêng cho cả public lẫn admin.

## 4. Trạng thái hiện tại của template

Đây là điểm quan trọng nếu bạn muốn dùng repo này làm base cho dự án thật:

- Phần public của blog, certificates, project và một số nội dung trang chủ hiện đang đọc từ mock/static data trong `lib/mock` và `lib/content`.
- Phần admin đã kết nối Firestore cho collection, topic, post và analytics.
- Đăng nhập admin hiện là mock auth bằng `sessionStorage`, chưa phải cơ chế xác thực production-ready.

Nói ngắn gọn: repo đã có nền tảng tốt để làm template, nhưng nếu dùng cho production nghiêm túc bạn nên hoàn thiện thêm lớp auth và đồng bộ dữ liệu public với Firestore.

## 5. Cấu trúc thư mục chính

```text
app/
	[lang]/             Giao diện public theo ngôn ngữ
	admin/              Khu vực quản trị
	api/                Route handlers cho Cloudinary, GitHub
	style/              CSS module và global styles
lib/
	firebase/           Firestore config, query, analytics
	cloudinary/         Resize và xử lý media
	i18n/               Cấu hình locale và dictionary
	mock/               Dữ liệu mẫu cho blog, certificates, home
	content/            Nội dung tĩnh như bio, GitHub helpers
public/
	img/                Tài nguyên ảnh public
```

## 6. Các file nên sửa đầu tiên khi fork

- `lib/content/bio.ts`: thay thông tin giới thiệu cá nhân.
- `lib/mock/home.ts`: thay project, social, dữ liệu trang chủ.
- `lib/mock/blog.ts`: thay bài viết mẫu nếu chưa nối data thật.
- `lib/mock/certificates.ts`: thay chứng chỉ mẫu.
- `app/layout.tsx`: sửa metadata tổng thể của website.
- `app/[lang]/layout.tsx`: kiểm tra font, theme và layout toàn cục.

## 7. Dữ liệu và biến môi trường

### Firestore

Schema tham khảo hiện có trong file `db.md`, gồm các nhóm dữ liệu chính:

- `collections`
- `topics`
- `posts`
- `conversations`
- `analytics`

### Cloudinary

Cloudinary hiện phục vụ upload ảnh trong nội dung bài viết admin. Nếu bạn chưa cần tính năng này, có thể bỏ trống biến Cloudinary nhưng các chức năng upload/xóa media sẽ không hoạt động.

### GitHub token

`GITHUB_TOKEN` được dùng cho route `/api/github/contributions`. Nếu không cấu hình token, section contribution sẽ không tải được dữ liệu thật.

## 8. Gợi ý để dùng như template chung

- Thay toàn bộ mock data bằng Firestore hoặc CMS riêng nếu muốn nội dung cập nhật từ admin ra public.
- Thay mock auth bằng Firebase Auth, NextAuth hoặc hệ thống auth riêng.
- Thêm phân quyền admin nếu có nhiều người quản lý nội dung.
- Tách nội dung cá nhân ra file config riêng để người fork chỉnh nhanh hơn.

## 9. Lệnh thường dùng

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## 10. Tóm tắt ngắn

Nếu bạn cần một repo portfolio có giao diện riêng, có blog, có admin, có analytics và đủ chỗ để mở rộng thành CMS cá nhân, đây là một nền tảng tốt để bắt đầu. Nếu mục tiêu của bạn là triển khai production ngay, hãy ưu tiên hoàn thiện auth, đồng bộ nguồn dữ liệu public và rà lại biến môi trường theo hạ tầng bạn đang dùng.

# Blog Firestore Integration — Test Plan

## Overview
Thay thế toàn bộ mock data (`lib/mock/blog.ts`) bằng dữ liệu thật từ Firestore cho các trang blog public.  
Các Firestore collections liên quan: `collections`, `topics`, `posts`, `hints`.

---

## 1. Data Loading (BlogDataProvider)

### 1.1 Initial Load
| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 1 | Load thành công tất cả data | Mở `/vi/blog` | 4 requests song song (collections, topics, posts, hints) đều resolve. `loading` chuyển từ `true` → `false`. UI hiển thị data. |
| 2 | Loading state hiển thị | Mở `/vi/blog`, quan sát trước khi data trả về | `loading = true` → trang hiển thị trống/skeleton, không crash. |
| 3 | Empty database | Xóa hết data trong Firestore | `loading = false`, collections/posts/topics/hints = `[]`. UI hiển thị trống, không có lỗi JS. |
| 4 | Partial failure | Tắt quyền đọc collection `hints` trong Firestore Rules | Console log error. `loading = false`. Posts/collections/topics vẫn hiển thị (hints = `[]`). |
| 5 | Network offline | Tắt mạng rồi mở blog | Firestore offline cache trả dữ liệu cached (nếu có). Nếu không có cache → `loading = false`, data rỗng. |
| 6 | Component unmount trước khi load xong | Navigate ra khỏi `/blog` ngay khi đang load | Không có warning "setState on unmounted component". `cancelled` flag hoạt động. |

### 1.2 Data Mapping
| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 7 | Collections có color | Load blog page | Mỗi collection nhận 1 color từ palette `COLLECTION_COLORS`. Không collection nào thiếu color. |
| 8 | Collections hiển thị đúng thứ tự | Tạo 3 collections với order 1, 2, 3 | Sidebar và overview hiển thị đúng thứ tự order. |
| 9 | Posts có timestamps đúng | Tạo post với createdAt, updatedAt | `createdAt` và `updatedAt` hiển thị dạng date string hợp lệ (YYYY-MM-DD). |
| 10 | Posts.content là Tiptap HTML | Tạo post có HTML (bold, list, code block) | Detail page render HTML đúng (không escape thành text). |

---

## 2. Blog List Page (`/[lang]/blog`)

### 2.1 All Posts View (no `?cat=`)
| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 11 | Hiển thị tất cả collections có posts | Tạo 3 collections, mỗi collection có ≥1 post | 3 section blocks hiển thị, mỗi block có header + grid. |
| 12 | Collection không có posts bị ẩn | Tạo 1 collection rỗng (0 posts) | Collection đó không xuất hiện trong overview. |
| 13 | Post count chính xác | Collection A có 5 posts | Header hiển thị "5 posts". |
| 14 | Latest date đúng | Collection có posts ngày 01/01, 15/02, 10/03 | Header hiển thị "Updated 2026-03-10" (ngày mới nhất). |
| 15 | Chỉ hiển thị tối đa 4 items per collection | Collection có 10 posts, 2 topics | Grid hiển thị đúng 4 items + 1 "View More" card. |
| 16 | Topic card hiển thị đúng | Topic có 3 posts | Card hiển thị topic name, post count "3 posts", excerpt từ post đầu tiên. |
| 17 | Standalone post card hiển thị đúng | Post không thuộc topic nào | Card hiển thị title, excerpt (strip HTML, ≤120 chars), read time, date. |
| 18 | View More button | Click "View More" | Navigate sang view category cụ thể (`?cat=<collectionId>`), scroll lên đầu. |

### 2.2 Filtered Category View (`?cat=<collectionId>`)
| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 19 | Chỉ hiển thị posts của collection đó | Click collection "Tech" trong sidebar | Chỉ posts có `collectionId` khớp hiển thị. |
| 20 | Pinned posts hiển thị flat | Post có `isPinned: true` | Post pinned hiển thị ở grid trên, không nằm trong accordion. |
| 21 | Standalone posts hiển thị flat | Post không thuộc topic, không pinned | Post hiển thị ở standalone grid cùng vùng với pinned. |
| 22 | Topics hiển thị trong accordion | Topic có 2 posts (không pinned) | Topic accordion hiển thị, click để mở/đóng. |
| 23 | Accordion mở/đóng toggle | Click topic header | Toggle accordion state. Posts bên trong ẩn/hiện. |
| 24 | Topic rỗng bị ẩn | Topic không có posts | Topic accordion không render. |
| 25 | Collection không tồn tại | URL `?cat=non-existent-id` | Không render posts, không crash. |

---

## 3. Blog Detail Page (`/[lang]/blog/[slug]`)

### 3.1 Content Rendering
| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 26 | Post tìm thấy theo slug | Navigate tới `/vi/blog/valid-slug` | Post content hiển thị đầy đủ: title, date, read time, HTML content. |
| 27 | Post không tìm thấy | Navigate tới `/vi/blog/non-existent-slug` | Hiển thị "Not Found" + link back to blog. |
| 28 | HTML content render đúng | Post content chứa `<h2>`, `<code>`, `<ul>` | dangerouslySetInnerHTML render HTML tags đúng. |
| 29 | Read time tính đúng | Post content 400 words | Hiển thị "2 min read" (400/200 = 2). |
| 30 | Read time minimum 1 | Post content 10 words | Hiển thị "1 min read". |
| 31 | Collection name hiển thị | Post thuộc collection "Design" | Tag hiển thị "Design". |
| 32 | Collection color dot | Post thuộc collection có color "#EC4899" | Dot hiển thị đúng màu. |

### 3.2 Sidebar Navigation
| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 33 | Sidebar: post thuộc topic | Post có topicId | Sidebar hiển thị topic name + liệt kê tất cả posts cùng topic, có index (1, 2, 3...). |
| 34 | Sidebar: post không thuộc topic | Post không có topicId | Sidebar hiển thị collection name + liệt kê tất cả posts cùng collection. |
| 35 | Active post highlight | Đang xem post A | Post A trong sidebar có class `sidebarItemActive`. |
| 36 | Navigate giữa posts | Click post khác trong sidebar | Navigate đúng URL, highlight cập nhật. |
| 37 | Back to blog link | Click "← Back to Blog" | Navigate về `/vi/blog?cat=<collectionId>`. |

### 3.3 Tips & Hints
| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 38 | Tips count hiển thị | Post thuộc topic có 5 hints | Button "Tips & Hints (5)" hiển thị. |
| 39 | Tips count all hints | Post không có topicId | Button hiển thị tổng số hints toàn bộ. |
| 40 | Mở Tips Feed | Click "Tips & Hints" button | TipsFeed hiển thị thay cho article content. |
| 41 | Đóng Tips Feed | Click back button trong TipsFeed | Quay lại article content. |

### 3.4 Related Posts Overlay
| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 42 | Related overlay hiển thị | Toggle related store | Portal overlay hiển thị danh sách posts liên quan. |
| 43 | Related overlay đóng khi click ngoài | Click ngoài overlay | Overlay đóng. |
| 44 | Navigate từ related overlay | Click post trong overlay | Navigate đến post đó, overlay đóng. |

---

## 4. Tips Feed Component

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 45 | Filter hints theo topicId | Mở tips cho topic "react-ecosystem" | Chỉ hiển thị hints có `topicId === "react-ecosystem"`. |
| 46 | All hints khi không có topicId | Mở tips không truyền topicId | Hiển thị tất cả hints. |
| 47 | Hint card render đúng | Hint có type "tip" | Hiển thị "Mẹo"/"Tip" với color #3B82F6, title, HTML content. |
| 48 | Hint content là HTML | Hint chứa `<strong>`, `<code>` | dangerouslySetInnerHTML render đúng. |
| 49 | Relative time formatting | Hint tạo 2 giờ trước | Hiển thị "2 giờ trước" (vi) / "2h ago" (en). |
| 50 | Pagination (infinite scroll) | Có 10 hints | Ban đầu hiển thị 4, scroll xuống → load thêm 4, rồi 2. |
| 51 | "No more tips" message | Scroll hết hints | Hiển thị "Đã hết tips" / "No more tips". |
| 52 | Empty hints | Không có hints cho topic | Feed header hiển thị count = 0, list trống. |
| 53 | Topic name trong header | Mở tips cho topic có name "React Ecosystem" | Header hiển thị "React Ecosystem" dưới "Tips & Hints". |

---

## 5. Blog Shell (Sidebar + Layout)

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 54 | Sidebar hiển thị tất cả collections | 4 collections trong Firestore | Sidebar có 4 items + "All Posts". |
| 55 | Collection post count đúng | Collection A có 3 posts, B có 7 | Badge hiển thị 3 và 7. |
| 56 | All Posts count = tổng | 10 posts total | "All Posts" badge = 10. |
| 57 | Collection không có posts | Collection C có 0 posts | Collection C vẫn hiển thị nhưng count = 0, bị ẩn bởi CollectionSidebar logic. |
| 58 | Active collection highlight | Click collection B | Collection B có class active trong sidebar + pill strip. |
| 59 | Detail page: active collection auto-detect | Navigate tới post thuộc collection A | Sidebar highlight collection A dù không có `?cat=`. |
| 60 | Pill strip responsive | Thu hẹp viewport < 768px | Pill strip hiển thị, sidebar ẩn. |

---

## 6. Cross-cutting Concerns

### 6.1 Data Consistency
| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 61 | Post.collectionId trỏ tới collection tồn tại | Tạo post với collectionId hợp lệ | Post hiển thị đúng collection name + color. |
| 62 | Post.collectionId orphan | Post có collectionId trỏ tới collection đã bị xóa | Post vẫn hiển thị, label = collectionId (fallback), color = "#1C1C1A". |
| 63 | Post.topicId orphan | Post có topicId trỏ tới topic đã bị xóa | Post hiển thị như standalone (không nằm trong accordion nào). |
| 64 | Topic.collectionId orphan | Topic trỏ tới collection đã xóa | Topic không ghép vào collection nào, không hiển thị. |
| 65 | Duplicate slugs | 2 posts có cùng slug | Detail page hiển thị post đầu tiên tìm thấy. |

### 6.2 Performance
| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 66 | Data chỉ fetch 1 lần | Navigate giữa pages trong blog | Không re-fetch khi navigate (BlogDataProvider ở layout level). |
| 67 | Parallel fetch | Mở Network tab, load blog | 4 requests fire đồng thời (không sequential). |
| 68 | Large dataset (100+ posts) | Seed Firestore với 100 posts | UI load < 3s, scroll mượt, không lag. |

### 6.3 Edge Cases
| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 69 | Post content rỗng | Post có `content: ""` | Excerpt = "", readTime = 1, detail page hiển thị trống. |
| 70 | Post title rỗng | Post có `title: ""` | Card hiển thị trống (title area blank), không crash. |
| 71 | Special characters trong content | Post chứa `<script>`, `&amp;`, emoji | HTML render đúng, XSS không xảy ra (Tiptap sanitizes). |
| 72 | Very long title | Post title 500 ký tự | Card truncate với CSS, không break layout. |
| 73 | Hints với type không hợp lệ | Hint có `type: "unknown"` | Fallback hoạt động, không crash (TypeScript type guard). |

### 6.4 Locale
| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 74 | Vietnamese locale | Mở `/vi/blog` | Tips type labels hiển thị tiếng Việt ("Mẹo", "Gợi ý", "Ghi chú"). Relative time tiếng Việt. |
| 75 | English locale | Mở `/en/blog` | Tips type labels hiển thị English ("Tip", "Hint", "Note"). Relative time English. |
| 76 | URL locale match | Từ `/vi/blog` click post | Navigate tới `/vi/blog/<slug>` (giữ đúng locale). |

---

## 7. Regression: Admin Panel

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 77 | Admin vẫn hoạt động | Mở `/admin/posts` | Admin panel vẫn load, CRUD posts bình thường (admin imports riêng, không bị ảnh hưởng). |
| 78 | Tạo post từ admin → hiển thị trên blog | Admin tạo post mới → mở blog | Post mới xuất hiện sau khi refresh blog page. |
| 79 | Sửa post từ admin → cập nhật trên blog | Admin sửa title → refresh blog | Title mới hiển thị. |
| 80 | Xóa post từ admin → biến mất khỏi blog | Admin xóa post → refresh blog | Post không còn trong danh sách. |

---

## Summary

| Category | Test Cases | Priority |
|----------|-----------|----------|
| Data Loading | #1–#10 | HIGH |
| Blog List Page | #11–#25 | HIGH |
| Blog Detail Page | #26–#44 | HIGH |
| Tips Feed | #45–#53 | MEDIUM |
| Blog Shell | #54–#60 | MEDIUM |
| Data Consistency | #61–#65 | HIGH |
| Performance | #66–#68 | MEDIUM |
| Edge Cases | #69–#73 | LOW |
| Locale | #74–#76 | MEDIUM |
| Admin Regression | #77–#80 | HIGH |
| **Total** | **80** | |

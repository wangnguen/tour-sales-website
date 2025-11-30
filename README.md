# Tour Sales Website (Ứng dụng bán tour du lịch)

### Tổng quan

Ứng dụng là một web app Node.js + Express sử dụng Pug cho server-side rendering. Có hai phần giao diện: client (khách hàng) và admin (quản trị). Dữ liệu lưu bằng MongoDB, ảnh được upload lên Cloudinary.

### Tính năng chính

- Client: duyệt tour, chi tiết tour, thêm vào giỏ, đặt/ thanh toán đơn hàng, đọc tin tức, gửi liên hệ.
- Admin: quản lý tour, danh mục, bài viết, đơn hàng, người dùng, upload ảnh.

## Bắt đầu nhanh (Quickstart)

Yêu cầu trước

- Node.js >= 16
- MongoDB (hoặc MongoDB Atlas)

Cài đặt dependencies

```bash
# dùng npm
npm install

# hoặc dùng yarn nếu bạn thích
yarn install
```

Tạo file cấu hình

- Sao chép `.env.example` thành `.env` và điền các giá trị tương ứng (Xem mục Biến môi trường bên dưới).
- Sao chép `configs/database.example.js` -> `configs/database.js` và cập nhật connection string MongoDB nếu cần.

Chạy ứng dụng

```bash
# Chạy dev (với nodemon nếu đã cài global hoặc devDependencies)
npm run debug

# Hoặc chạy production-style
npm start
```

Mặc định app lắng nghe PORT trong biến môi trường `PORT` hoặc 3000 nếu không có. Truy cập:

- Client: http://localhost:3000
- Admin: http://localhost:3000/admin (giá trị `admin` có thể thay đổi tại `configs/variable.js` -> `pathAdmin`)

Docker

Project kèm `Dockerfile` và `docker-compose.yml`. Ví dụ chạy bằng Docker Compose:

```powershell
# từ thư mục project
docker-compose up --build
```

Lưu ý: file `docker-compose.yml` hiện dùng `yarn start` trong container; nếu bạn dùng npm, chỉnh lại hoặc chạy bằng cách phù hợp.

## Biến môi trường (từ `.env.example`)

- PORT — cổng server (mặc định 3000)
- DATABASE — MongoDB connection string
- JWT_SECRET — khóa dùng cho JWT / token
- EMAIL_USERNAME / EMAIL_PASSWORD — cấu hình SMTP (dùng cho gửi email xác thực/forgot password)
- EMAIL_SECURE — true/false (giao thức SMTP)
- ZALOPAY*\* / VNPAY*\* — cấu hình cho cổng thanh toán (ZaloPay, VNPay)
- DOMAIN_WEBSITE — domain dùng trong callback thanh toán / email links

## Kiến trúc routes & API chính (tóm tắt)

Ứng dụng dùng routes server-rendered (pug). Dưới đây là các route chính bạn sẽ thử nghiệm (tiền tố `/` là đường dẫn khách, tiền tố `/admin` là giao diện quản trị; `admin` có thể thay đổi trong `configs/variable.js`).

Client (public)

- GET / — Trang chủ
- GET /category/:slug — Danh sách tour theo category
- GET /tour/detail/:slug — Trang chi tiết tour
- GET /news — Danh sách tin tức
- GET /news/detail/:slug — Chi tiết tin tức

Auth khách (view + POST endpoints):

- GET /login, POST /login — Đăng nhập
- GET /register, POST /register — Đăng ký
- POST /logout — Đăng xuất
- POST /forgot_password, /otp_password, /reset_password — Quy trình quên mật khẩu

Cart / Order

- GET /cart — Xem giỏ (cần đăng nhập)
- POST /cart/detail — Thêm chi tiết giỏ (nội bộ)
- POST /order/create — Tạo đơn hàng
- GET /order/success — Trang kết quả
- Các route thanh toán: `/order/payment-zalopay`, `/order/payment-vnpay`, và callback tương ứng

Contact

- GET /contact — Form liên hệ
- POST /contact/create — Gửi liên hệ
- POST /contact/feedback — Gửi phản hồi

Admin (tiền tố: `/admin`)

- GET /admin/account/login, POST /admin/account/login — Đăng nhập admin
- Các route quản lý: `/admin/tour`, `/admin/category`, `/admin/news`, `/admin/order`, `/admin/user`, ... (xem `routes/admin/` để biết chi tiết)
- Upload ảnh: POST /admin/upload/image (multipart/form-data, field name: `file`)

Ví dụ một vài request (curl)

1. Đăng ký người dùng (POST form):

```bash
curl -X POST "http://localhost:3000/register" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "name=Nguyen&email=test@example.com&password=123456"
```

2. Đăng nhập (POST):

```bash
curl -X POST "http://localhost:3000/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&password=123456"
```

3. Upload ảnh (admin) — multipart/form-data (sử dụng cookie/session của admin đã đăng nhập):

```bash
curl -X POST "http://localhost:3000/admin/upload/image" \
  -F "file=@/path/to/photo.jpg"
```

Lưu ý: nhiều route trong ứng dụng trả về HTML (render Pug). Nếu bạn muốn gọi các endpoint để nhận JSON (API), cần kiểm tra controllers tương ứng — một số endpoint như upload, order.create có thể trả JSON hoặc redirect.

## Cấu trúc project (tóm tắt)

- `controllers/` — controller cho `admin` và `client`
- `routes/` — định nghĩa các route
- `models/` — Mongoose schemas
- `views/` — Pug templates
- `public/` — static files (css, js, images)
- `configs/` — database, biến, các config khác
- `helpers/`, `middlewares/`, `validates/` — tiện ích và xác thực

## Kiểm tra nhanh & debug

- Chạy `npm run debug` để chạy với `nodemon` (cần cài dev dependency `nodemon`).
- Kiểm tra log console để thấy URL và lỗi.
- Nếu đang dùng Docker, kiểm tra file `docker-compose.yml` và đảm bảo `.env` đang mount hoặc dùng `env_file`.

## Góp ý & phát triển

- Nếu bạn muốn thêm API JSON REST đầy đủ (không render HTML), tôi có thể giúp:
  - Tách riêng các route API (ví dụ `/api/v1/...`) và trả về JSON.
  - Thêm middleware CORS, validation JSON, và ví dụ Postman collection.

## Tóm tắt hoàn tất ✅

README đã cập nhật: hướng dẫn cài đặt, biến môi trường, cách chạy (local & Docker), tóm tắt routes/endpoint chính và ví dụ curl. Nếu bạn muốn tôi liệt kê từng endpoint chi tiết hơn (với body/response mẫu) hoặc tạo Postman collection, cho tôi biết mục tiêu cụ thể (ví dụ: API cho mobile app hoặc dùng làm API public), tôi sẽ tiếp tục.

# Travel & Tour Web Application

A modern Node.js web application for travel agencies, supporting both admin and client interfaces. The system allows management of tours, news, users, cart, and payments, with a clean UI and robust backend.

## Main Features

### For Clients

- Browse, search, and filter tours by location, date, price, and more
- View detailed tour information, schedules, and promotions
- Add tours to cart and manage cart items
- Checkout and pay for tours via bank transfer (internet banking)
- Read travel news and articles in the news/blog section
- Contact form for customer support
- Responsive design with pagination and sorting

### For Admins

- Secure admin login and permission management
- Manage tours: add, edit, delete, set promotions, upload images
- Manage categories, cities, and website settings
- Manage news/articles: create, edit, delete, upload images, auto-generate slugs, author info
- Manage orders, customer contacts, and view cart details
- Dashboard with statistics and quick actions
- Pagination and search for all management lists

### Technical Stack

- Node.js, Express.js, MongoDB (Mongoose)
- Pug template engine for server-side rendering
- Multer for file uploads, Cloudinary for image storage
- Session, flash messages, and role-based access control
- RESTful routing, modular code structure
- Yarn for dependency management

## Getting Started

### Prerequisites

- Node.js >= 16
- MongoDB
- Yarn

### Installation

```bash
yarn install
```

### Configuration

- Copy `configs/database.example.js` to `configs/database.js` and update your MongoDB URI and credentials.
- Adjust other settings in `configs/variable.js` as needed.

### Running the Application

```bash
yarn start
```

- Client site: `http://localhost:3000`
- Admin dashboard: `http://localhost:3000/admin`

## Project Structure

- `controllers/` — Business logic for admin and client
- `models/` — Mongoose models
- `routes/` — Express routes for admin and client
- `views/` — Pug templates for all pages
- `public/` — Static assets (CSS, JS, images)
- `helpers/` — Utility functions (mail, cloudinary, etc.)
- `middlewares/` — Auth, validation, and other middleware
- `configs/` — Configuration files

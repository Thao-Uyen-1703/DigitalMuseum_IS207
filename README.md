# DigitalMuseum-IS207

Website giới thiệu và quản lý hiện vật bảo tàng được xây dựng với ReactJS, Node.js và MySQL.

## Công nghệ sử dụng

### Frontend

* ReactJS
* Vite
* Tailwind CSS
* Axios
* React Router DOM

### Backend

* Node.js
* ExpressJS
* MySQL2
* JWT Authentication
* Multer
* Joi
* Bcrypt

---

# Yêu cầu môi trường

Trước khi chạy project, cần cài đặt:

* Node.js >= 14
* MySQL hoặc XAMPP
* Git (không bắt buộc)

Khuyến nghị:

* Node.js 20 LTS
* Visual Studio Code

Kiểm tra phiên bản Node.js:

```bash
node -v
```

---

# Cài đặt project

## 1. Clone repository

```bash
git clone https://github.com/Thao-Uyen-1703/DigitalMuseum_IS207
cd DigitalMuseum-IS207
```

Hoặc tải source code dưới dạng `.zip` và giải nén.

---

# Cài đặt Backend

## 1. Di chuyển vào thư mục backend

```bash
cd backend
```

## 2. Cài đặt dependencies

```bash
npm install
```

## 3. Tạo file môi trường

Tạo file `.env` trong thư mục `backend`.

```env
NODE_ENV=dev

DB_HOST=127.0.0.1
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=digitalmuseumdb
DB_PORT=3306

FRONT_END_URL=http://localhost:8000

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
```

## 4. Khởi động backend

```bash
npm start
```

Chạy trong môi trường dev:

```bash
npm run dev
```

Backend mặc định chạy tại:

```txt
http://localhost:3000
```

---

# Cài đặt Frontend

Mở terminal mới.

## 1. Di chuyển vào thư mục frontend

```bash
cd frontend
```

## 2. Cài đặt dependencies

```bash
npm install
```

## 3. Tạo file môi trường

Tạo file `.env` trong thư mục `frontend`.

```env
VITE_BACKEND_APP_URL=http://localhost:3000
```

## 4. Khởi động frontend

```bash
npm run dev
```

Frontend mặc định chạy tại:

```txt
http://localhost:5173
```

---

# Cấu hình cơ sở dữ liệu

## 1. Khởi động MySQL/XAMPP

Nếu sử dụng XAMPP:

* Mở XAMPP Control Panel
* Start Apache
* Start MySQL

Truy cập:

```txt
http://localhost/phpmyadmin
```

---

## 2. Tạo database

```sql
CREATE DATABASE digitalmuseumdb
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Sau đó import file SQL.

---

# Cấu trúc thư mục

```txt
DigitalMuseum-IS207/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   └── server.js
│   │
│   ├── public/images/
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# API chính

## Authentication

```txt
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh
POST   /api/auth/logout
POST   /api/auth/change-password
GET    /api/auth/me
```

---

## Profile

```txt
GET    /api/profile
PUT    /api/profile
```

---

## Product

```txt
GET    /api/product
GET    /api/product/:id
```

---

## Cart

```txt
GET   /api/cart
POST  /api/cart
PUT   /api/cart/:id
DELETE /api/cart/:id
```

---

## Checkout & Order

```txt
POST  /api/checkout
GET   /api/order
GET   /api/tracking/:id
```

---

# Authentication

Project sử dụng JWT Authentication.

## Access Token

* Dùng để gọi API
* Thời gian sống ngắn

## Refresh Token

* Lưu bằng httpOnly cookie
* Dùng để cấp lại access token mới

---

# Quy trình xác thực

1. User đăng nhập
2. Backend trả access token + refresh token
3. Frontend dùng access token để gọi API
4. Khi access token hết hạn:

   * API trả 401
   * frontend gọi `/api/auth/refresh`
   * backend cấp token mới
5. Nếu refresh token hết hạn:

   * yêu cầu đăng nhập lại

---

# Upload hình ảnh

## Thông tin hỗ trợ

* Định dạng:

  * PNG
  * JPG
  * JPEG

* Giới hạn:

  * 25MB

## Thư mục lưu ảnh

```txt
backend/public/images/
```

## Truy cập hình ảnh

Ví dụ:

```txt
http://localhost:3000/images/avatar-abc.jpg
```

---

# Một số lỗi thường gặp

## Backend không chạy

Kiểm tra:

* Port 3000 có đang được sử dụng hay không
* Node.js đã cài đúng chưa

Kiểm tra process đang dùng port:

```bash
netstat -ano | findstr :3000
```

---

## Không kết nối được MySQL

Kiểm tra:

* MySQL đã start chưa
* thông tin trong `.env`
* database đã tạo chưa

---

## CORS Error

Kiểm tra:

```env
FRONT_END_URL=http://localhost:5173
```

---

## Không hiển thị hình ảnh

Kiểm tra:

* thư mục `public/images`
* middleware static của Express

Ví dụ:

```js
app.use('/images', express.static('public/images'));
```

---

# Scripts

## Backend

```bash
npm start
npm run dev
npm install
```

## Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

---
require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const session = require('express-session');

const PORT = process.env.PORT || 3000;
const app = express();

const database = require('./configs/database');

const adminRoutes = require('./routes/admin/index.route');
const clientRoutes = require('./routes/client/index.route');
const variableConfig = require('./configs/variable');

// Thiết lập thư mục chứa file tĩnh của Fontend:
app.use(express.static(path.join(__dirname, 'public')));

// Thiết lập views
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Kết nối db
database.connect();

// Tạo biến toàn cục trong file PUG (express)
app.locals.pathAdmin = variableConfig.pathAdmin;

// Tạo biến toàn cục trong các file backend
global.pathAdmin = variableConfig.pathAdmin;

// Cho phép gửi data lên dạng json
app.use(express.json()); // chuyen json -> js

// Sử dụng cookie-parser
app.use(cookieParser(process.env.COOKIE_SECRET));

// Nhúng Flash
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 }
  })
);
app.use(flash());

// Thiết lập đường dẫn:
app.use(`/${variableConfig.pathAdmin}`, adminRoutes);
app.use('/', clientRoutes);

app.listen(PORT, () => {
  console.log(`Website is running at ${PORT}`);
});

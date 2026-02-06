var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

// view engine setup - Giữ lại nhưng API sẽ ưu tiên trả về JSON
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- KHAI BÁO CÁC ROUTE ---
app.use('/', require('./routes/index'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/products', require('./routes/products'));
app.use('/api/v1/categories', require('./routes/categories')); // Đã đặt đúng chỗ

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// --- ERROR HANDLER (ĐÃ SỬA ĐỂ TRẢ VỀ JSON) ---
app.use(function(err, req, res, next) {
  // Thiết lập HTTP status (mặc định là 500 nếu không có)
  const status = err.status || 500;
  res.status(status);

  // Trả về kết quả dạng JSON để không bị lỗi "Failed to lookup view"
  res.json({
    success: false,
    message: err.message,
    // Chỉ hiển thị chi tiết lỗi (stack) khi ở môi trường development
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
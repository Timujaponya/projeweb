const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  console.error(err.stack);

  // Mongoose ObjectId hatası
  if (err.name === 'CastError') {
    const message = `Kaynak bulunamadı`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose validation hatası
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  // Mongoose duplicate key hatası
  if (err.code === 11000) {
    const message = 'Bu değer zaten kullanılıyor';
    error = new ErrorResponse(message, 400);
  }

  // JWT tokenı hatası
  if (err.name === 'JsonWebTokenError') {
    const message = 'Yetkilendirme hatası, lütfen tekrar giriş yapın';
    error = new ErrorResponse(message, 401);
  }

  // JWT token süresi dolmuş hatası
  if (err.name === 'TokenExpiredError') {
    const message = 'Oturum süreniz doldu, lütfen tekrar giriş yapın';
    error = new ErrorResponse(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Sunucu hatası'
  });
};

module.exports = errorHandler;
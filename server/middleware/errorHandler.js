function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  const status = error.status || error.statusCode || 500;
  const message = status === 500 ? 'Something went wrong on the server.' : error.message;

  if (status === 500) {
    console.error(error);
  }

  res.status(status).json({
    message,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}

module.exports = { notFound, errorHandler };

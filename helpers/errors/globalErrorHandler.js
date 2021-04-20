const DBErrors = require('./DBErrors');

const sendProdError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      message: 'Something went very wrong',
    });
  }
};

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    console.log(err);
    if (err.name === 'CastError') error = DBErrors.handleCastError(error);
    if (err.code === 11000) error = DBErrors.handleDuplicateFieldError(error);
    if (err.name === 'ValidationError')
      error = DBErrors.handleValidationError(error);
    sendProdError(error, res);
  }
};

const express = require('express');
const app = express();
const globalErrorHandler = require('../helpers/errors/globalErrorHandler');
const appError = require('../helpers/errors/appError');
const tourRoutes = require('./../routes/tourRoutes');
const userRoutes = require('./../routes/userRoutes');

app.use(express.json());

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);

app.all('*', (req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server!`));
});
app.use(globalErrorHandler);

module.exports = app;

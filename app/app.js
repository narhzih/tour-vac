const express = require('express');
const app = express();

const tourRoutes = require('./../routes/tourRoutes');
const userRoutes = require('./../routes/userRoutes');

app.use(express.json());

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);

module.exports = app;

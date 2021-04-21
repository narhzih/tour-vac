const User = require('./../models/userModel');
const catchAsync = require('./../helpers/errors/catchAsync');
const jwt = require('jsonwebtoken');
const appError = require('./../helpers/errors/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = catchAsync(async (req, res) => {
  const newUser = await User.create(req.body);
  const token = signToken(newUser.id);
  // Authenticate a web token after successful sign up
  res.status(201).json({
    status: 'success',
    message: 'Account created successfully',
    data: {
      user: newUser,
      token: token,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    next(new appError('Please provide your email and password', 401));
  }

  const user = await User.findOne({ email }).select('+password');
  const correctPassword = user.comparePassword(password, user.password);
  if (!user || !correctPassword) {
    next(new appError('Invalid email and password combination'));
  }

  const token = signToken(user);
  res.status(201).json({
    status: 'success',
    message: 'Login successful',
    data: {
      token: token,
    },
  });
  // Validate password
});

const User = require('./../models/userModel');
const catchAsync = require('./../helpers/errors/catchAsync');
const jwt = require('jsonwebtoken');
const appError = require('./../helpers/errors/appError');
const { promisify } = require('util');

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
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    //Check if a token was sent
    token = req.headers.authorization.split(' ')[1];
    if (!token)
      next(new appError('Invalid token provided. Please login again', 401));

    // Check if token is still valid & if user has not been deleted after
    // the token was issued
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const freshUser = User.findById(decoded.id);
    if (!freshUser)
      next(new appError('User with provided token not found', 401));

    // Check if the user has not changed the password after the token was issued
    if (freshUser.passwordChangedAfter(decoded.iat)) {
      next(new appError('User recently changed password. Please login again'));
    }

    req.user = freshUser;
    next();
  }
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(
        new appError(
          'You do not have the necessary permissions to access this route',
          403
        )
      );
    }

    next();
  };
};

const User = require('./../models/userModel');
const catchAsync = require('./../helpers/errors/catchAsync');
const jwt = require('jsonwebtoken');
const appError = require('./../helpers/errors/appError');
const { promisify } = require('util');
const sendEmail = require('./../helpers/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return next(new appError('Please provide your email and password', 401));
  }

  const user = await User.findOne({ email }).select('+password');
  const correctPassword = user.confirmPassword(password, user.password);
  if (!user || !correctPassword) {
    return next(new appError('Invalid email and password combination'));
  }

  createSendToken(user, 201, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new appError('Invalid email provided', 401));
  }
  // Create a token and send to the user email;
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // Send reset token to user email;

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new appError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new appError(
        'Invalid token provided. Please request for another one',
        400
      )
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 201, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, password, passwordConfirm } = req.body;

  if (!oldPassword || !password || !passwordConfirm) {
    return next(
      new appError(
        'Please provide us with your old password, new password and a confirmation password'
      )
    );
  }

  // Verify old password to see if correct
  const user = req.user;
  if (!user.confirmPassword(oldPassword, user.password)) {
    return next(
      new appError(
        "Incorrect old password. Please reset your password if you can't remember"
      )
    );
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  //Reset login token after password change
  createSendToken(user, 200, res);
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
    const freshUser = await User.findById(decoded.id);
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

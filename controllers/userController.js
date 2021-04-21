const User = require('./../models/userModel');
const catchAsync = require('./../helpers/errors/catchAsync');
const appError = require('./../helpers/errors/appError');

exports.getUsers = catchAsync(async (req, res) => {
  const users = await User.find({});

  res.status(201).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res) => {
  const user = await User.findOne({ id: req.params.id });

  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.createUser = catchAsync(async (req, res) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    message: 'User created successfully',
    data: {
      user: newUser,
    },
  });
});

exports.updateUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(201).json({
    status: 'success',
    message: 'User created successfully',
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(201).json({
    status: 'success',
    message: 'User deleted successfully',
  });
});

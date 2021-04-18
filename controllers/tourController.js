// const fs = require('fs');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

const Tour = require('./../models/tourModel');

// Controller Middlewares
// exports.checkID = (req, res, next) => {
//   const id = req.params.id * 1;
//   if (id > tours.length) {
//     res.status(400).json({
//       status: 'error',
//       message: 'Invalid tour ID',
//     });
//   }
//
//   next();
// };

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid request body',
    });
  }

  next();
};

exports.getAllTours = async (req, res) => {
  try {
    //--> /\b(gte|gt|lte|lt)\b/g
    let queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const tours = await Tour.find(JSON.parse(queryStr));
    res.status(201).json({
      status: 'success',
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'An error occurred',
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const id = req.params.id;
    const tour = await Tour.findById(id);

    res.status(201).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'An error occurred',
      error: err,
    });
  }
};

exports.createNewTour = (req, res) => {
  const lastId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: lastId }, req.body);
  tours.push(newTour);

  fs.writeFileSync(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours)
  );

  res.status(201).json({
    status: 'success',
    message: 'Tour created successfully',
    data: {
      tour: newTour,
    },
  });
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(201).json({
      status: 'success',
      message: 'Tour updated successfully',
      data: {
        tour,
      },
    });
  } catch (err) {}
};

exports.deleteTour = (req, res) => {
  res.status(201).json({
    status: 'success',
    message: 'Tour deleted successfully',
    data: {
      //
    },
  });
};

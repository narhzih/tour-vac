const fs = require('fs');
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

// Controller Middlewares
exports.checkID = (req, res, next) => {
  const id = req.params.id * 1;
  if (id > tours.length) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid tour ID',
    });
  }

  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid request body',
    });
  }

  next();
};

exports.getAllTours = (req, res) => {
  res.status(201).json({
    status: 'success',
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);

  res.status(201).json({
    status: 'success',
    data: {
      tour,
    },
  });
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

exports.updateTour = (req, res) => {
  res.status(201).json({
    status: 'success',
    message: 'Tour updated successfully',
    data: {
      //
    },
  });
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

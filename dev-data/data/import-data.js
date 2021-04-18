const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: `${__dirname}/../../config.env` });

mongoose
  .connect(process.env.DB_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
  })
  .then((r) => {
    console.log('DB Connection successful');
  });
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Tours Created');
  } catch (err) {
    console.log('Error occurred while creating tours');
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Tours deleted');
  } catch (err) {
    console.log('Error occurred while deleting tours');
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData().then((r) => process.exit(1));
} else if (process.argv[2] === '--delete') {
  deleteData().then((r) => process.exit(1));
}

const Tour = require('./../models/tourModel');

class ApiFeatures {
  constructor(query, urlQuery) {
    this.query = query;
    this.urlQuery = urlQuery;
  }

  filter() {
    //--> /\b(gte|gt|lte|lt)\b/g
    let queryObj = { ...this.urlQuery };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.urlQuery.sort) {
      let sortQuery = req.query.sort.split(',').join(' ');
      this.query = this.query.sort(sortQuery);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.urlQuery.fields) {
      const fields = this.urlQuery.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.urlQuery.page * 1 || 1;
    const limit = this.urlQuery.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeatures;

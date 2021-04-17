const app = require('./app/app');
const dotenv = require('dotenv');
const morgan = require('morgan');

dotenv.config({ path: './config.env' });
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

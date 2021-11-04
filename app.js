require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const helmet = require('helmet');
const cors = require('cors');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const limiter = require('./middlewares/limiter');

const auth = require('./middlewares/auth');

const errorHandler = require('./middlewares/error-handler');

const userController = require('./controllers/users');

const { PORT = 3000 } = process.env;
const { NODE_ENV = 'development' } = process.env;
const { JWT_SECRET = 'some-secret-key' } = process.env;
const { DB_ADRESS = 'mongodb://localhost:27017/moviesdb' } = process.env;

exports.NODE_ENV = NODE_ENV;
exports.JWT_SECRET = JWT_SECRET;

const NotFoundError = require('./errors/not-found-err');

const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(cookieParser());

mongoose.connect(NODE_ENV === 'production' ? DB_ADRESS : 'mongodb://localhost:27017/moviesdb', {
  useNewUrlParser: true,
});

app.use(requestLogger);
app.use(limiter);
app.use(cors({
  origin: '*',
  credentials: true,
}));

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signout', userController.logout);
app.use(require('./routes/authorization'));

app.use(auth);

require('./routes/index')(app);

app.use('*', (req, res, next) => {
  next(new NotFoundError('Ресурс не найден'));
});

app.use(errorLogger);

app.use(errors());

app.use(errorHandler);

app.listen(PORT, () => {

});

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/user');

const envData = require('../app');

const CastError = require('../errors/cast-err');
const NotFoundError = require('../errors/not-found-err');
const ValidationError = require('../errors/authorization-err');
const MongoError = require('../errors/mongo-err');
// const ServerError = require('../errors/server-err');

module.exports.getCurrentUser = (req, res, next) => {
  User.findOne({ _id: req.user._id })
    .orFail(new Error('NotFound'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.message === 'NotFound') {
        next(new NotFoundError('Пользователь по указанному _id не найден.'));
      } else if (err.name === 'CastError') {
        next(new CastError('Переданы некорректные данные при поиске пользователя'));
      }
    })
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { email, name } = req.body;

  User.findByIdAndUpdate(req.user._id, { email, name },
    {
      new: true,
      runValidators: true,
    })
    .orFail(new Error('NotFound'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new CastError('Переданы некорректные данные при обновлении профиля.'));
      } else if (err.message === 'NotFound') {
        next(new NotFoundError('Пользователь по указанному _id не найден.'));
      } else {
        next(err);
      }
    });
};

module.exports.logout = (req, res, next) => {
  res
    .status(200)
    .cookie('jwt', 'token', {
      maxAge: -1,
      httpOnly: true,
    })
    .send({ message: 'Вы вышли из аккаунта' })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({ email: req.body.email, password: hash }))
    .then((user) => {
      const tempUser = user;
      tempUser.password = '';
      res.send(tempUser);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные при создании пользователя.'));
      } else if (err.name === 'MongoError' && err.code === 11000) {
        next(new MongoError('Переданы некорректные данные при создании пользователя.'));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password, next)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      const token = jwt.sign(
        { _id: user._id },
        envData.NODE_ENV === 'production' ? envData.JWT_SECRET : 'some-secret-key',
        { expiresIn: '7d' },
      );
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
      });
      res.send({ message: 'Авторизация прошла успешно' });
    })
    .catch(next);
};

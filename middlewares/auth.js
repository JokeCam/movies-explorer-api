const jwt = require('jsonwebtoken');

const envData = require('../app');

const AuthorizationError = require('../errors/authorization-err');

module.exports = (req, res, next) => {
  const cookie = req.cookies.jwt;

  if (!cookie) {
    next(new AuthorizationError('Необходима авторизация'));
  }

  let payload;

  try {
    payload = jwt.verify(cookie, envData.NODE_ENV === 'production' ? envData.JWT_SECRET : 'some-secret-key');
  } catch (err) {
    next(new AuthorizationError('Необходима авторизация'));
  }

  req.user = payload;

  return next();
};

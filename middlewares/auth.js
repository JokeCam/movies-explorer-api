const jwt = require('jsonwebtoken');

const AuthorizationError = require('../errors/authorization-err');

module.exports = (req, res, next) => {
  const cookie = req.cookies.jwt;

  if (!cookie) {
    next(new AuthorizationError('Необходима авторизация'));
  }

  let payload;

  try {
    // eslint-disable-next-line global-require
    payload = jwt.verify(cookie, require('../app').NODE_ENV === 'production' ? require('../app').JWT_SECRET : 'some-secret-key');
  } catch (err) {
    next(new AuthorizationError('Необходима авторизация'));
  }

  req.user = payload;

  return next();
};

const { celebrate, Joi } = require('celebrate');
const router = require('express').Router();

const {
  login, createUser,
} = require('../controllers/users');

router.post('/signin', celebrate({
  body: Joi.object().keys({
    password: Joi.string().required().min(2).max(30),
    email: Joi.string().required().min(2).max(30),
  }),
}), login);
router.post('/signup', celebrate({
  body: Joi.object().keys({
    password: Joi.string().min(2).max(30),
    email: Joi.string().required().min(2).max(30),
  }),
}), createUser);

module.exports = router;

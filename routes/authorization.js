const { celebrate, Joi } = require('celebrate');
const router = require('express').Router();

const {
  login, createUser,
} = require('../controllers/users');

router.post('/api/signin', celebrate({
  body: Joi.object().keys({
    password: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
  }),
}), login);
router.post('/api/signup', celebrate({
  body: Joi.object().keys({
    password: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
    name: Joi.string(),
  }),
}), createUser);

module.exports = router;

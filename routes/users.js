const { celebrate, Joi } = require('celebrate');
const router = require('express').Router();

const {
  updateUser, getCurrentUser,
} = require('../controllers/users');

router.get('/api/users/me', getCurrentUser);
router.patch('/api/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
  }),
}), updateUser);

module.exports = router;

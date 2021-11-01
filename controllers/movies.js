const Movie = require('../models/movie');

const CastError = require('../errors/cast-err');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-err');
// const ValidationError = require('../errors/authorization-err');
// const MongoError = require('../errors/mongo-err');
// const ServerError = require('../errors/server-err');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.send(movies))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new CastError('Переданы некорректные данные при создании фильма.'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findOne({ _id: req.params.movieId })
    .orFail(new NotFoundError('Фильм не найден.'))
    .then((movie) => {
      // eslint-disable-next-line eqeqeq
      if (movie.owner == req.user._id) {
        Movie.findByIdAndRemove(req.params.movieId)
          .orFail(new Error('NotFound'))
          .then(res.send({ data: movie }))
          .catch((err) => {
            if (err.message === 'NotFound') {
              throw new NotFoundError('Фильм не найден.');
            } else if (err.name === 'CastError') {
              throw new CastError('Переданы неверные данные');
            }
          });
      } else throw new ForbiddenError('Недостаточно прав для удаления фильма');
    })
    .catch(next);
};

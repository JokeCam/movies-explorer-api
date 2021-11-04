const movieRoutes = require('./movies');
const userRoutes = require('./users');

const allRoutes = (app) => {
  app.use(movieRoutes);
  app.use(userRoutes);
};

module.exports = allRoutes;

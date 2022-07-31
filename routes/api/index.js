//This file will import all of the API routes to prefix their endpoint 
//names and package them up. Although we only have one set of endpoints now, 
//we should always try to set ourselves up for easy scaling.
const router = require('express').Router();
const userRoutes = require('./user-routes');
const thoughtRoutes = require('./thought-routes');

// add prefix of `/pizzas` to routes created in `pizza-routes.js`
router.use('/users', userRoutes);
router.use('/thoughts', thoughtRoutes);

module.exports = router;
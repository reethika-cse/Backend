const fastify = require('fastify')();
const UserController = require('../controllers/userController');
const { authenticate } = require('../middleWares/authenticate');
const {
  loginUser,
  getToken,
  registerUser,
} = UserController;

async function routes(fastify, options) {
  fastify.post('/login', loginUser);
  fastify.post('/signup',  registerUser);
  fastify.post('/getToken', { preHandler: authenticate }, getToken);
}


module.exports = routes;



const fastify = require('fastify')();
const BudgetController = require('../controllers/budgetController');
const { authenticate } = require('../middleWares/authenticate');
const {
  createBudget,
  getBudget,
  addCategory,
  deleteCategory,
  createExpanse,
  getUserExpanses,
  deleteExpanse,
  getAllExpansesAndDates,
} = BudgetController;

async function routes(fastify, options) {
  fastify.post('/createBudget', { preHandler: authenticate }, createBudget);
  fastify.get('/getBudget', { preHandler: authenticate }, getBudget);
  fastify.post('/createExpanse', { preHandler: authenticate }, createExpanse);
  fastify.get('/getExpanses', { preHandler: authenticate }, getUserExpanses);
  fastify.post('/addCategory', { preHandler: authenticate }, addCategory);
  fastify.post('/deleteExpanse', { preHandler: authenticate }, deleteExpanse);
  fastify.post('/deleteCategory', { preHandler: authenticate }, deleteCategory);
  fastify.get('/getExpanseAndDates', { preHandler: authenticate }, getAllExpansesAndDates);
}


module.exports = routes;

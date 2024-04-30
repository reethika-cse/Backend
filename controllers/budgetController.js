const User = require('../models/userSchema');
const Budget = require('../models/budgetSchema');
const Category = require('../models/categorySchema');
const Expense = require('../models/expanseSchema');
const moment = require("moment");

const createBudget = async (req, res) => {
  try {


    let {
      name,
      totalAmount,
      startDate,
      endDate
    } = req.body.budget;
    const newBudget = new Budget({
      name,
      totalAmount,
      startDate: startDate ? startDate : new Date(),
      endDate: endDate ? endDate : new Date(),
    });
    const budgetResponse = await newBudget.save();
    const userId = req.user.id;
    const user = await User.findOne({ _id: userId });
    user.budgets.push(budgetResponse._id);
    await user.save();
    const categories = req.body.budget.categories;
    const allpromises = categories.map(async (category) => {
      const newCategory = new Category({
        name: category.name,
        allocatedAmount: category.amount,
        spend: category.spend ? category.amount : 0,
      });
      const categoryResponse = await newCategory.save();
      newBudget.categories.push(categoryResponse._id);
    });
    await Promise.all(allpromises);
    await newBudget.save();
    res.status(200).send({ message: "Budget created successfully", budgetData: newBudget  });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne({ _id: userId }).populate({
      path: "budgets",
      populate: {
        path: "categories",
        model: "Category",
      },
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const allBudgets = user.budgets;

    res.status(200).send(allBudgets);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
};

const createExpanse = async (req, res) => {
  console.log(req.body);
  try {
    const { categoryId, description, amount, date } = req.body;

    if (!categoryId) {
      return res.status(400).send({ message: "Category ID is required" });
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).send({ message: "Category not found" });
    }

    const newExpense = new Expense({
      description,
      amount,
      date: date ? new Date(date) : new Date(),
    });

    const savedExpense = await newExpense.save();

    category.expenses.push(savedExpense._id);
    await category.save();

    res.status(200).send({ message: "Expense added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
};

const getUserExpanses = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate({
      path: "budgets",
      populate: {
        path: "categories",
        populate: {
          path: "expenses",
          model: "Expense",
        },
      },
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    const allExpenses = [];
    user.budgets.forEach((budget) => {
      budget.categories.forEach((category) => {
        category.expenses.forEach((expense) => {
          console.log(category.name);

          const newExpense = {
            amount: expense.amount,
            date: expense.date,
            description: expense.description,
            _id: expense._id,
            categoryName: category.name,
          };
          allExpenses.push(newExpense);
        });
      });
    });

    res.status(200).send(allExpenses);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
};

const addCategory = async (req, res) => {
  try {
    const { budgetId, name, allocatedAmount, spend } = req.body;

    if (!budgetId) {
      return res.status(400).send({ message: "Budget ID is required" });
    }

    const budget = await Budget.findById(budgetId);

    if (!budget) {
      return res.status(404).send({ message: "Budget not found" });
    }

    const newCategory = new Category({
      name,
      allocatedAmount,
      spend: spend || 0,
    });

    const savedCategory = await newCategory.save();

    budget.categories.push(savedCategory._id);
    await budget.save();

    res.status(200).send({ message: "Category added to budget successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
};

const deleteExpanse = async (req, res) => {
  try {
    const { expenseId } = req.body;

    if (!expenseId) {
      return res.status(400).send({ message: "Expense ID is required" });
    }

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).send({ message: "Expense not found" });
    }

    const categoryId = expense.category;

    await Expense.findByIdAndDelete(expenseId);

    const category = await Category.findById(categoryId);
    if (category) {
      category.expenses.pull(expenseId);
      await category.save();
    }

    res.status(200).send({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
};

const deleteCategory =  async (req, res) => {
  try {
    const { categoryId } = req.body;

    if (!categoryId) {
      return res.status(400).send({ message: "Category ID is required" });
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).send({ message: "Category not found" });
    }

    const ExpenseIds = category.expenses;

    await Category.findByIdAndDelete(categoryId);
    const budget = await Budget.find({ categories: categoryId });
    if (budget) {
      budget[0].categories.pull(categoryId);
      await budget[0].save();
    }
    await Expense.deleteMany({ _id: { $in: ExpenseIds } });

    res.status(200).send({ message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
};

const getAllExpansesAndDates = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).send({ message: "User ID is required" });
    }
    const user = await User.findById(userId).populate({
      path: "budgets",
      populate: {
        path: "categories",
        populate: {
          path: "expenses",
          model: "Expense",
        },
      },
    });

    const userDailyExpenses = {};
    user.budgets.forEach((budget) => {
      budget.categories.forEach((category) => {
        category.expenses.forEach((expense) => {
          const formattedDate = moment(expense.date).format("YYYY-MM-DD");

          if (!userDailyExpenses[formattedDate]) {
            userDailyExpenses[formattedDate] = {
              date: formattedDate,
              totalAmountSpent: 0,
            };
          }

          userDailyExpenses[formattedDate].totalAmountSpent += expense.amount;
        });
      });
    });
    const result = Object.values(userDailyExpenses);

    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
}

module.exports = {
  createBudget,
  createExpanse,
  getBudget,
  getAllExpansesAndDates,
  deleteExpanse,
  addCategory,
  deleteCategory,
  getUserExpanses,
}
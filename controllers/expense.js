const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../util/database");

exports.addExpense = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { amount, description, category } = req.body;
    const expense = await Expense.create({
      amount: amount,
      description: description,
      category: category,
      userId: req.user.id,
    }, {transaction: t});

    const user = await User.findByPk(req.user.id);
    const updatedAmount = user.dataValues.totalAmount + parseInt(amount);
    await req.user.update({ totalAmount: updatedAmount }, {transaction: t});

    await t.commit();
    res.json(expense);
  } catch (err) {
    await t.rollback();
    res.status(500).json();
  }
};

exports.getExpense = async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const offset = (page - 1) * limit;
  try {
    const expenses = await Expense.findAll({
      where: { userId: req.user.id },
      offset: offset,
      limit: limit,
    });

    const count = await Expense.count({where: {userId: req.user.id}});
    const hasMoreData = count - (page-1)*limit > limit ? true : false;
    const nextPage = hasMoreData ? Number(page) + 1 : undefined;
    const previousPage = page > 1 ? Number(page)-1 : undefined;
    const hasPreviousPage = previousPage ? true : false;

    res.status(200).json(
        {
            expenses: expenses,
            hasNextPage: hasMoreData,
            hasPreviousPage: hasPreviousPage,
            previousPage: previousPage,
            nextPage: nextPage
        })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Internal server error' })
  }
};

exports.deleteExpense = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await User.findByPk(req.user.id);
    const expense = await Expense.findByPk(req.params.expenseId);
    const updatedAmount = user.dataValues.totalAmount - expense.amount;
    await req.user.update({ totalAmount: updatedAmount }, {transaction: t});

    await Expense.destroy({ where: { id: req.params.expenseId }, transaction: t });

    await t.commit();
    res.json();
  } catch (err) {
    console.log(err);
    await t.rollback();
    res.status(500).json();
  }
};

  /*    

Promise.all([Expense.findAll(), User.findAll()]).then(([expenses, users]) => {
        const totalAmounts = {};

        // Calculate total amounts spent by each user
        expenses.forEach((expense) => {
            const userId = expense.dataValues.userId;
            const amount = expense.dataValues.amount;

            if (!totalAmounts[userId]) {
                totalAmounts[userId] = amount;
            } else {
                totalAmounts[userId] += amount;
            }
        });

        // Create an array of objects combining user data with total amount spent
        const result = users.map((user) => ({
            id: user.dataValues.id,
            name: user.dataValues.name,
            totalAmountSpent: totalAmounts[user.dataValues.id] || 0 // Use the total amount or 0 if not found
            // Here, you'd typically use totalAmounts[user.id] but considering your data structure, it might need adjustment based on your actual data
        }));

        res.json(result); // Display the ultimate result
    });

*/
  // const result = await User.findAll({
  //   attributes: [
  //     "id",
  //     "name",
  //     [sequelize.fn("sum", sequelize.col("amount")), "totalAmountSpent"],
  //   ],
  //   include: [
  //     {
  //       model: Expense,
  //       attributes: [],
  //     },
  //   ],
  //   group: ["id"],
  //   order: [["totalAmountSpent", "DESC"]],
  // });

  // res.json(result);

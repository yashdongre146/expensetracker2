const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Expense = sequelize.define('expense-table', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    amount: Sequelize.INTEGER,
    description: Sequelize.STRING,
    category: Sequelize.STRING
})

module.exports = Expense

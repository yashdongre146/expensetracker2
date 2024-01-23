const express = require('express')
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const userRoutes = require('./routes/user')
const expenseRoutes = require('./routes/expense')
const purchaseRoutes = require('./routes/purchase')
const User = require('./models/user')
const Expense = require('./models/expense')
const sequelize = require('./util/database')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const Order = require('./models/order')
const ForgotPassword = require('./models/forgotPassword')
const DownloadedFile = require('./models/downloadedfile')


const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
app.use(morgan('combined', {stream: accessLogStream}));
require('dotenv').config();
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/',(req, res)=>{
    res.sendFile('signup.html', {root: 'views'});
});

app.get('/login', (req, res) => {
    res.sendFile('login.html', {root:'views'});
});

app.get('/reset-password', (req, res) => {
    res.sendFile('forgotpassword.html', {root:'views'});
});

app.get('/home', (req, res) => {
    res.sendFile('expense.html', {root:'views'});
});

app.use(userRoutes);
app.use(expenseRoutes);
app.use(purchaseRoutes);


app.use(helmet());


User.hasMany(Expense);
Expense.belongsTo(User);
User.hasMany(Order);
Order.belongsTo(User);
User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);
User.hasMany(DownloadedFile);
DownloadedFile.belongsTo(User);

const PORT = process.env.PORT;
console.log(PORT)
sequelize.sync().then(()=>{
    app.listen(3000);
}).catch(err=>console.log(err))

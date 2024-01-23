const User = require('../models/user')
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('auth');
    const user = jwt.verify(token, process.env.JWT_SECRET);
    User.findByPk(user.id).then((user)=>{
        req.user = user;
        next();
    })
}

module.exports = {auth};
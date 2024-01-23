const User = require('../models/user')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken');
const ForgotPassword = require('../models/forgotPassword');
const { v4: uuidv4, v5: uuidv5 } = require('uuid')


const Sib = require('sib-api-v3-sdk');

function generateToken(id, name, isPremiumUser){
    return jwt.sign({id, name, isPremiumUser}, process.env.JWT_SECRET)
}

exports.signup =  (req, res) => {
   try {
        const {name, email, password} = req.body;
        bcryptjs.hash(password, 10, async (err, hash)=>{
            const user = await User.create({name, email, password: hash, totalAmount: 0});
            res.json(user);
        })
    } catch (err) {
            res.status(400).json();
    }
}
exports.login = async (req, res) => {
    try {
        const user = await User.findOne({where: {email : req.body.email}})
        if (user) {
            bcryptjs.compare(req.body.password, user.password, async (err, resp)=>{
                const passwordMatch = await bcryptjs.compare(req.body.password, user.password);

                if (passwordMatch) {
                    res.json({ token: generateToken(user.id, user.name, user.isPremiumUser) });
                } else {
                    res.status(422).json({ message: 'Password does not match.' });
                }
            })
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Something went wrong.' });
    }
}
exports.forgotPassword = async (req, res) => {
    const {forgotEmail} = req.body;
    try {
        const user = await User.findOne({ where: { email:  forgotEmail} });
        if (user) {

            const randomUUID = uuidv4();

            await user.createForgotPassword({id: randomUUID, active: true})

            const client = Sib.ApiClient.instance;

            const apiKey = client.authentications['api-key'];
            apiKey.apiKey = process.env.SIB_KEY;


            const tranEmailApi = new Sib.TransactionalEmailsApi();

            const sender = {
                email: 'expensetracker@gmail.com'
            };
            const receivers = [
                {
                    email: forgotEmail,
                }
            ];

            const resetLink = `${process.env.WEBSITE}/reset-password/${randomUUID}`


            await tranEmailApi.sendTransacEmail({
                sender,
                to: receivers,
                subject: 'Reset your password',
                // textContent: `Your new password is ${newPassword}`,
                htmlContent: `<p>Visit the following link to reset your password:</p>
                <a href="${resetLink}">click here to reset password</a>`
            });
            res.json();
        } else {
            res.status(401).json();
        }
    } catch (err) {
        console.log(err);
        res.status(500).json();
    }
};
exports.resetPassword = async (req, res) => {
    try {
        const forogtPasswordElement = await ForgotPassword.findOne({where: {id: req.params.uId}})

        if (forogtPasswordElement && forogtPasswordElement.active) {
            await forogtPasswordElement.update({active: false})
            const htmlContent = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="/css/resetPassword.css">
                <title>Password Reset</title>
            </head>
            <body>
                <form action="${process.env.WEBSITE}/update-password/${req.params.uId}" method="GET">
                <h2>Password Reset</h2>
                <label for="newpassword">Enter New Password</label>
                <input name="newpassword" type="password" required>
                <button type="submit">Reset Password</button>
                </form>
            </body>
            </html>`
            res.send(htmlContent);
            res.end();
        } else {
            throw new Error('Password reset link expired or not found')
        }
    } catch (err) {
        res.status(500).json();
    }
    
};
exports.updatePassword = async (req, res) => {
    const {newpassword} = req.query;
    const {uId} = req.params;
    try {
        const result = await ForgotPassword.findOne({ where: { id: uId } })
        const hash = await bcryptjs.hash(newpassword, 10);
        await User.update({ password: hash }, {where: {id: result.userId}});
        res.send("Password Changed Success!");
    } catch (err) {
        res.status(500).json()
    }
};

exports.generateToken = generateToken;



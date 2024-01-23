const Razorpay = require('razorpay');
const Order = require('../models/order');
const userController = require('./user');
const Expense = require("../models/expense");
const User = require("../models/user");
const AWS = require('aws-sdk')

function uploadToS3(data, filename){
  const BUCKET_NAME = process.env.S3_BUCKET_NAME;
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  let s3Bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET
  })

  var params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: data,
    ACL: 'public-read'
  }
  return new Promise((resolve, reject)=>{
      s3Bucket.upload(params, (err, s3response)=>{
      if (err) {
        console.log("Went wrong", err);
        reject(err);
      } else {
        console.log("Success", s3response);
        resolve(s3response.Location);
      }
    })
  })
  
}

exports.purchase = (req, res) => {
    try {
      var rzp = new Razorpay({
          key_id: `${process.env.RAZORPAY_KEY_ID}`,
          key_secret: `${process.env.RAZORPAY_KEY_SECRET}`
      })
      const amount = 2500;

      rzp.orders.create({amount, currency: 'INR'}, (err, order) =>{
          req.user.createOrder({orderId: order.id, status: 'PENDING'}).then(()=>{
              res.json({order, key_id: rzp.key_id})
          })
      })
    } catch (err) {
      res.status(500).json();
    }
};

exports.updateTransactionStatus = async (req, res) => {
    try {
      const { payment_id, order_id } = req.body;
  
      const order = await Order.findOne({ where: { orderId: order_id } });

      await order.update({ paymentId: payment_id, status: 'SUCCESSFUL' });
  
      await req.user.update({ isPremiumUser: true });
  
      const token = userController.generateToken(req.user.id, undefined, true);
  
      res.json({ success: true, message: "Transaction Successful", token: token });
    } catch (error) {
      res.status(500).json({ success: false, error: "An error occurred while updating transaction status" });
    }
};

exports.showLeaderboard = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json();
  }
};

exports.download = async (req, res) => {
  try{
      const expenses = await Expense.findAll({where: {userId: req.user.id}});
      const stringifiedExpenses = JSON.stringify(expenses);
      const filename = `Expense${req.user.id}/${new Date()}.txt`;
      const fileUrl = await uploadToS3(stringifiedExpenses, filename)
      await req.user.createDownloadedFile({fileUrl});
      res.json({fileUrl, success: true})
  }
  catch(err){
      console.log(err);
      res.status(500).json()
  }
 
};

exports.showHistory = async (req, res) => {
    try{
      const files = await req.user.getDownloadedFiles({attributes: ['fileUrl', 'updatedAt']});
      return res.status(200).json(files);
  }
  catch(err){
      console.log(err);
      res.status(500).json({fileUrl: '', success:false, error:err});
  }
};
  
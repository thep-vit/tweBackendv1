const express = require('express');
const router = express.Router();
const {check } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/users');
const { render } = require('ejs');
const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'abhinavgorantla0613@gmail.com',
      pass: 'yewlhhalqitwghlf'
    }
  });

// @route POST api/auth/recover
// @desc Recover Password - Generates token and Sends password reset email
// @access Public
router.post('/',  (req, res) => {
    User.findOne({email: req.body.email})
        .then(user => {
            if (!user) return res.status(401).json({message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.'});

            //Generate and set password reset token
            user.generatePasswordReset();

            // Save the updated user object
            user.save()
                .then(user => {
                    // send email
                    let link = "http://" + req.headers.host + "/reset/reset/" + user.resetPasswordToken;
                    const mailOptions = {
                        to: user.email,
                        from: 'abhinavgorantla0613@gmail.com',
                        subject: "Password change request",
                        text: `Hi ${user.name} \n 
                    Please click on the following link ${link} to reset your password. \n\n 
                    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
                    };

                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                          console.log(error);
                        } else {
                          console.log('Email sent: ' + info.response);
                          res.status(200).json({message: 'A reset email has been sent to ' + user.email + '.'});
                        }
                      });
                })
                .catch(err => res.status(500).json({message: err.message}));
        })
        .catch(err => res.status(500).json({message: err.message}));
});


router.get('/', (req, res) => {
    res.render('reset');
});

router.get('/reset/:token',(req, res) => {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
        .then((user) => {
            if (!user) return res.status(401).json({message: 'Password reset token is invalid or has expired.'});

            //Redirect user to form with the email address
            res.render('login', {user});
        })
        .catch(err => res.status(500).json({message: err.message}));
});

router.post('/reset/:token',check('password').not().isEmpty().isLength({min: 6}).withMessage('Must be at least 6 chars long'),
check('confirmPassword', 'Passwords do not match').custom((value, {req}) => (value === req.body.password)), (req, res) =>{
    
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
        .then((user) => {
            if (!user) return res.status(401).json({message: 'Password reset token is invalid or has expired.'});

            //Set the new password
            user.password = req.body.password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            // Save
            user.save((err) => {
                if (err) return res.status(500).json({message: err.message});

                // send email
                const mailOptions = {
                    to: user.email,
                    from: process.env.FROM_EMAIL,
                    subject: "Your password has been changed",
                    text: `Hi ${user.username} \n 
                    This is a confirmation that the password for your account ${user.email} has just been changed.\n`
                };

                transporter.sendMail(mailOptions, (error, result) => {
                    if (error) return res.status(500).json({message: error.message});

                    res.status(200).json({message: 'Your password has been updated.'});
                });
            });
        });

});

module.exports = router;
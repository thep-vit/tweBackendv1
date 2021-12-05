const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
// Load User model
const User = require("../models/users");
const crypto = require("crypto");

// const { render } = require('ejs');
const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.SENDER_EMAIL,
		pass: process.env.SENDER_EMAIL_PASS,
	},
});

// @route POST api/auth/recover
// @desc Recover Password - Generates token and Sends password reset email
// @access Public

router.post("/", async (req, res) => {
	try {
		foundUser = await User.findOne({ email: req.body.email });

		if (!foundUser) {
			return res
				.status(401)
				.send({
					message:
						"The email address " +
						req.body.email +
						" is not associated with any account. Double-check your email address and try again.",
				});
		}

		// Generate and set password reset token
		foundUser.generatePasswordReset();

		// Save the Updated User
		resetTokenUser = await foundUser.save();

		let link =
			"http://" +
			req.headers.host +
			"/api/reset/reset-password/" +
			resetTokenUser.resetPasswordToken;
		const mailOptions = {
			to: resetTokenUser.email,
			from: process.env.SENDER_EMAIL,
			subject: "Password change request",
			text: `Hi ${resetTokenUser.name} \n 
                    Please click on the following link ${link} to reset your password. \n\n 
                    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
		};

		transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.log(error);
			} else {
				console.log("Email sent: " + info.response);
				res.status(200).redirect("reset-message");
			}
		});
	} catch (e) {
		res.status(500).json({ message: err.message });
	}
});

router.get("/", (req, res) => {
	res.render("reset");
});

//Display "Email sent" message
router.get("/reset-message", (req, res) => {
	res.render("reset-message");
});

//Display "PAssword Reset success" message

router.get("/reset-success", (req, res) => {
	res.render("reset-success");
});

router.get("/reset-password/:token", async (req, res) => {
	try {
		const foundUser = await User.findOne({
			resetPasswordToken: req.params.token,
			resetPasswordExpires: { $gt: Date.now() },
		});
		if (!foundUser) {
			return res
				.status(401)
				.json({
					message: "Password reset token is invalid or has expired.",
				});
		}

		//Redirect user to form with the email address
		res.render("reset-password", { foundUser });
	} catch (e) {
		console.log(e);
		res.status(500).send();
	}
});

router.post(
	"/reset-password/:token",
	check("password")
		.not()
		.isEmpty()
		.isLength({ min: 6 })
		.withMessage("Must be at least 6 chars long"),
	check("confirmPassword", "Passwords do not match").custom(
		(value, { req }) => value === req.body.password
	),
	async (req, res) => {
		try {
			const foundUser = await User.findOne({
				resetPasswordToken: req.params.token,
			});
			if (!foundUser) {
				return res
					.status(401)
					.json({
						message:
							"Password reset token is invalid or has expired.",
					});
			}

			//Set the new password
			foundUser.password = crypto.createHash('md5').update(req.body.password).digest('hex');
			foundUser.resetPasswordToken = undefined;
			foundUser.resetPasswordExpires = undefined;

			await foundUser.save();

			const mailOptions = {
				to: foundUser.email,
				from: process.env.FROM_EMAIL,
				subject: "Your password has been changed",
				text: `Hi ${foundUser.name} \n 
            This is a confirmation that the password for your account ${foundUser.email} has just been changed.\n`,
			};

			transporter.sendMail(mailOptions, (error, result) => {
				if (error)
					return res.status(500).json({ message: error.message });

				res.redirect('/api/reset/reset-success');
			});
		} catch (e) {
			res.status(500).json({ message: e.message });
		}
	}
);

module.exports = router;

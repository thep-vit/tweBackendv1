const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");

const user = require('../controllers/userController');


router.post("/signup", user.userSignup);

router.post("/login", user.userLogin);

router.get("/me", auth, user.getDetails);

router.patch("/me", auth, user.updateData);

router.post("/logout", auth, user.logout);

router.post("/logoutAll", auth, user.logoutAll);

router.get("/name/:id", user.getName);

router.delete("/me", auth, user.deleteUser);

router.post("/securityQuestion/add", auth, user.addSecurityQuestion);

router.post("/securityQuestion/verify", user.verifySecurityQuestion);

router.post("/securityQuestion/request", user.requestSecurityQuestion);

router.get("/me/contribution", auth, user.getContribution);

module.exports = router;
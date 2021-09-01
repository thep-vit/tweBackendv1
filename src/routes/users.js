const express = require("express");
const {auth, adminAuth} = require("../middleware/auth");
const { getAllUsers, getUserProfile, modifyUserProfile, modifyUserAvatar } = require("../controllers/userController");

const router = express.Router();

router.get('/', getAllUsers);

router.get('/profile/:id', auth, getUserProfile);

router.post('/profile/:id', auth, modifyUserProfile);

router.post('/avatar/:id', auth, modifyUserAvatar);



module.exports = router
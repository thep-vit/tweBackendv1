const express = require("express");
const router = express.Router();
const { modifyUserProfile, getUserProfile, modifyUserAvatar, getAllUsers } = require('../controllers/userController');

router.get('/', getAllUsers);
router.post('/profile/:id', auth, modifyUserProfile);
router.get('/profile/:id', auth, getUserProfile);
router.post('/avatar/:id', auth, modifyUserAvatar);

module.exports = router;
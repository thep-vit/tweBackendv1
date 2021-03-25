const express = require('express');
const router = express.Router();
const { adminAuth, auth } = require('../middleware/auth');

const admin = require('../controllers/adminController');

router.get('/allUsers', auth, adminAuth, admin.getAllUsers);

router.patch('/userAccess/:_id/:val', auth, adminAuth, admin.userAccess);

router.post('/generateNewGuest', auth, adminAuth, admin.generateNewGuest);

module.exports = router;
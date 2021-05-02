const express = require("express");
const router = express.Router();

const message = require('../controllers/messageController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/post', auth, adminAuth, message.postMessage);

router.get('/allMessages', messages.getAllMessages);
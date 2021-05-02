const express = require('express');
const router = express.Router();

const onboarding = require('../controllers/onboardingController');
const { auth } = require('../middleware/auth');

router.patch('/', auth, onboarding.onboard);

router.get('/isOnboarded', auth, onboarding.isOnboarded);

module.exports = router;
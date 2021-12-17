const { getEditionBasic } = require('../controllers/editionController');

const router = require('express').Router();

router.get('/', getEditionBasic);

module.exports = router;
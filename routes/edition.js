const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const edition = require('../controllers/editionController');

router.post('/create', auth, adminAuth, edition.createEdition);

router.get('/:number', edition.getEditionByNum);

router.get("/", edition.getEditionList);

router.patch("/edition/adminhovpost/:number",auth,adminAuth, edition.postHOVLink);

router.patch("/edition/update/:id",auth,adminAuth, edition.updateEdition);

module.exports = router;
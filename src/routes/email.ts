
const express = require('express');

const router = express.Router();

const packageController = require('../controllers/email');

router.get('/email', packageController.getEmail);

module.exports = router;
export {};
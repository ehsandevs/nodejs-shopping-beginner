// Importing express framework
const express = require('express');

// Importing auth controller
const authController = require('../controllers/auth');

// Initialize and run this file as a Router because of ()
const router = express.Router();

module.exports = router;

// Middlewares ...
router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);
router.post('/signup', authController.PostSignup);
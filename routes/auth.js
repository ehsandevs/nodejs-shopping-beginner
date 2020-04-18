// Importing express framework
const express = require('express');

// Importing auth controller
const authController = require('../controllers/auth');

// Initialize and run this file as a Router because of ()
const router = express.Router();

// Importing Validation package
const { check, body } = require('express-validator/check');

module.exports = router;

// Middlewares ...
router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);
router.get('/reset', authController.getReset);
router.get('/reset/:token', authController.getNewPassword);

router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);
router.post('/signup', [
    check('email')
    .isEmail()
    .withMessage('Please enter a valid email!')
    .custom((value, { req }) => {
        if (value === 'test@test.com') {
            throw new Error('this email address is forbidden');
        }
        return true;
    }),
    body(
        'password',
        'Please enter a password with only numbers and text and at least 5 characters'
    )
    .isLength({ min: 5 })
    .isAlphanumeric()
], authController.PostSignup);
router.post('/reset', authController.postReset);
router.post('/new-password', authController.postNewPassword);
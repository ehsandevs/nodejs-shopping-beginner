// Importing express framework
const express = require('express');

// Importing auth controller
const authController = require('../controllers/auth');

// Initialize and run this file as a Router because of ()
const router = express.Router();

// Importing Validation package
const { check, body } = require('express-validator/check');

const User = require('../models/user');

module.exports = router;

// Middlewares ...
router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);
router.get('/reset', authController.getReset);
router.get('/reset/:token', authController.getNewPassword);

router.post('/login', [
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email number.'),
    body('password', 'password has to be valid.')
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim()
], authController.postLogin);
router.post('/logout', authController.postLogout);
router.post('/signup', [
    check('email')
    .isEmail()
    .withMessage('Please enter a valid email!')
    .custom((value, { req }) => {
        return User.findOne({
                where: { email: value }
            })
            .then(userDoc => {
                if (userDoc) {
                    return Promise.reject('E-Mail exists already; please pick a different one');
                }
            });
    }),
    body(
        'password',
        'Please enter a password with only numbers and text and at least 5 characters'
    )
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim(),
    body('confirmPassword')
    .trim()
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            console.log(req.body.password + " -- " + value);
            throw new Error('Passwords have to match');
        }
        return true;
    })

], authController.PostSignup);
router.post('/reset', authController.postReset);
router.post('/new-password', authController.postNewPassword);
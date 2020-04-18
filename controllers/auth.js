const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator/check');

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'niamileo@gmail.com',
        pass: '23472875'
    }
});

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message
    });
}

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message,
        oldInput: { email: "", password: "", confirmPassword: "" }
    });
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    // Checking email
    User.findOne({
            where: { email: email }
        })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid Email or Password');
                return res.redirect('/login');
            }
            // checking password
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    // if Matches, save a session and login
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save((err) => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    // if password doesn't match, redirect to login page
                    req.flash('error', 'Invalid Email or Password');
                    res.redirect('/login');
                })
                .catch(err => {
                    console.log(err)
                    res.redirect('/login');
                });
        })
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
}

exports.PostSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: { email: email, password: password, confirmPassword: req.body.confirmPassword }
        });
    }

    // This is Asynchronise, so it returns a middleware
    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword
            });
            return user.save();
        })
        .then(result => {
            // creating the cart for registered user
            User.findOne({ where: { id: result.id } })
                .then(user => {
                    return user.createCart();
                })
                .then(result => {
                    res.redirect('/login');
                    // Sending Email to newly signed-up user
                    return transport.sendMail({
                        to: email,
                        from: 'niamileo@gmail.com',
                        subject: 'Signedup Successfully!',
                        html: '<h1>You Registers successfuly!</h1>'
                    });
                })
                .catch(err => console.log(err));
        });
}

exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message
    });
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({
                where: { email: req.body.email }
            })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No User with that Email found!');
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                res.redirect('/');
                transport.sendMail({
                    to: req.body.email,
                    from: 'niamileo@gmail.com',
                    subject: 'Password Reset',
                    html: `
                    <h1>You Requested a Password Reset</h1>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">Link</a> to set a new password.</p>
                    `
                });
            })
            .catch(err => console.log(err));
    });
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({
            where: {
                resetToken: token
            }
        })
        .then(user => {
            // check resetToken Expiration Date
            if (user.resetTokenExpiration < new Date(Date.now())) {
                req.flash('error', 'Link is expired. Request a new one');
                return res.redirect('/reset');
            }
            // if Token is still valid, continue...
            let message = req.flash('error');
            if (message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage: message,
                userId: user.id.toString(),
                passwordToken: token
            });
        })
        .catch(err => console.log(err));
}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({
            where: {
                id: userId,
                resetToken: passwordToken
            }
        })
        .then(user => {
            // check resetToken Expiration Date
            if (user.resetTokenExpiration < new Date(Date.now())) {
                req.flash('error', 'Link is expired. Request a new one');
                return res.redirect('/reset');
            }
            // if Token is still valid, continue...
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = null;
            resetUser.resetTokenExpiration = null;
            return resetUser.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(err => console.log(err));
}
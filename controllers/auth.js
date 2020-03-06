const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    const isLoggedIn = req.session.isLoggedIn;
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: isLoggedIn
    });
}

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false
    });
}

exports.postLogin = (req, res, next) => {
    req.session.isLoggedIn = true;
    req.session.save((err) => {
        console.log(err);
        res.redirect('/');
    });
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
    const confirmPassword = req.body.confirmPassword;

    // Check if the entered email already exists in DB
    User.findOne({
            where: { email: email }
        })
        .then(userDoc => {
            console.log(userDoc);
            if (userDoc) {
                return res.redirect('/signup');
            }
            const user = new User({
                email: email,
                password: password
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(err => console.log(err));
}
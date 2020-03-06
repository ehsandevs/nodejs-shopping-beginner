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

}
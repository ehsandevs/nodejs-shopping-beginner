exports.get404 = (req, res, next) => {
    const isLoggedIn = req.get('Cookie').split('=')[1];
    res.status(404).render('404', {
        pageTitle: 'Page Not Found',
        path: '',
        isAuthenticated: isLoggedIn
    });
};
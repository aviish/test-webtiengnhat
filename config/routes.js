var path = require('path');

module.exports = function (app, passport) {

    // Controllers
    var HomeController = require(path.join(__dirname, '../controllers/home'));
    var userController = require(path.join(__dirname, '../controllers/user'));
    var contactController = require(path.join(__dirname, '../controllers/contact'));
    var chatroomController = require(path.join(__dirname, '../controllers/chatroom'));
    var videoroomController = require(path.join(__dirname, '../controllers/videoroom'));

    app.get('/', HomeController.index);
    app.get('/user/:uid/info', userController.ensureAuthenticated, userController.getInfoUser);
    app.get('/users', userController.ensureAuthenticated, userController.getAllUsers);

    app.get('/videoroom', userController.ensureAuthenticated,userController.ensureAuthenticated, videoroomController.videoroomGet);
    app.get('/videoroom/r', userController.ensureAuthenticated, videoroomController.createRoom);
    app.get('/videoroom/r/:room', userController.ensureAuthenticated, videoroomController.joinRoom);

    app.get('/chatroom',userController.ensureAuthenticated, chatroomController.chatroomGet);
    app.get('/account', userController.ensureAuthenticated, userController.accountGet);
    app.put('/account', userController.ensureAuthenticated, userController.accountPut);
    app.post('/upload', userController.upload.single("avatar"), userController.uploadPost);
    app.delete('/account', userController.ensureAuthenticated, userController.accountDelete);
    app.get('/signup', userController.signupGet);
    app.post('/signup', userController.signupPost);
    app.get('/login', userController.loginGet);
    app.post('/login', userController.loginPost);
    app.get('/logout', userController.logout);
    app.get('/forgot', userController.forgotGet);
    app.post('/forgot', userController.forgotPost);
    app.get('/reset/:token', userController.resetGet);
    app.post('/reset/:token', userController.resetPost);
    app.get('/contact', contactController.contactGet);
    app.post('/contact', contactController.contactPost);
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
    app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }));
    app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/login' }));
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
    app.get('/auth/google/callback',passport.authenticate('google', { successRedirect : '/', failureRedirect : '/login'}));
}

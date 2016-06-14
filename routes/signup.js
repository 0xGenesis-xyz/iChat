/**
 * Created by Sylvanus on 3/22/16.
 */

var express = require('express');
var router = express.Router();
var Models = require('../models/models');

router.get('/', function(req, res, next) {
    res.render('signup', { title: 'Sign up' });
});

router.post('/process', function(req, res, next) {
    var emailPattern = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
    var usernamePattern = /^[a-zA-Z0-9_-]+$/;
    var email = req.body.email;
    var username = req.body.username;
    var pwd1 = req.body.pwd1;
    var pwd2 = req.body.pwd2;
    if (!emailPattern.test(email)) {
        req.flash('alert', 'email');
        res.redirect(303, '/signup');
    } else if (!usernamePattern.test(username)) {
        req.flash('alert', 'name');
        res.redirect(303, '/signup');
    } else if (pwd1 != pwd2) {
        req.flash('alert', 'pwd');
        res.redirect(303, '/signup');
    } else {
        var User = Models.User;
        User.findOne({ $or: [{ email: email }, { username: username }] }, function (err, user) {
            if (user) {
                req.flash('alert', 'uid');
                res.redirect(303, '/signup');
            } else {
                User.create({
                    email: email,
                    username: username,
                    password: pwd1,
                    avatar: 'unknown',
                    friends: [{ group: 'MyFriends', items: [] }]
                }, function(error) {
                    console.log('saved');
                    if (error) {
                        console.error(error);
                    }
                });
                req.session.uid = email;
                res.redirect(303, '/conversation');
            }
        });
    }
});

module.exports = router;

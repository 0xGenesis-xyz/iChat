/**
 * Created by Sylvanus on 5/12/16.
 */

var express = require('express');
var router = express.Router();
var Models = require('../../models/models');

var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/avatars')
    },
    filename: function (req, file, cb) {
        cb(null, req.session.uid)
    }
});
function fileFilter(req, file, cb) {
    if (path.extension(file.originalname) !== '.png') {
        return cb(new Error('Only png are allowed'))
    }
    cb(null, true);
}
var upload = multer({ storage: storage }).single('avatar');

router.get('/', function(req, res, next) {
    res.render('chat/profile', { title: 'Profile' });
});

router.post('/editProfile', function(req, res, next) {
    var User = Models.User;
    User.update({ email: req.session.uid }, {
        username: req.body.username,
        gender: req.body.gender,
        birthday: req.body.birthday,
        location: req.body.location,
        whatsup: req.body.whatsup
    }, function(err, raw) {
        if (err)
            console.error(error);
        console.log('The raw response from Mongo was ', raw);
    });
    res.redirect(303, '/profile');
});

router.post('/changePassword', function(req, res, next) {
    if (req.body.newpwd1 != req.body.newpwd2) {
        console.log('password not consist');
    } else {
        var User = Models.User;
        User.findOneAndUpdate({ email: req.session.uid, password: req.body.oldpwd }, {
            password: req.body.newpwd1
        }, function(err, raw) {
            if (err)
                console.error(error);
            console.log('The raw response from Mongo was ', raw);
        });
    }
    res.redirect(303, '/profile');
});

router.post('/uploadAvatar', function(req, res, next) {
    upload(req, res, function(err) {
        if (err) {
            console.error(err);
        }
        var User = Models.User;
        User.findOneAndUpdate({ email: req.session.uid }, {
            avatar: req.file.filename
        }, function(err, raw) {
            if (err)
                console.error(error);
            console.log('The raw response from Mongo was ', raw);
        });
    });
    res.redirect(303, '/profile');
});

module.exports = router;

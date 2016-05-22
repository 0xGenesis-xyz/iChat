/**
 * Created by Sylvanus on 5/12/16.
 */

var express = require('express');
var router = express.Router();
var Models = require('../../models/models');

var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/avatars')
    },
    filename: function (req, file, cb) {
        cb(null, req.session.uid)
    }
});
function fileFilter(req, file, cb) {
    var words = file.originalname.split('.');
    var extension = words.pop();
    if (extension != 'png' && extension != 'jpg' && extension != 'gif') {
        return cb(new Error('Only png jpg gif are allowed'))
    }
    cb(null, true);
}
var upload = multer({ storage: storage, fileFilter: fileFilter }).single('avatar');

router.get('/', function(req, res, next) {
    if (req.session.uid == null) {
        res.redirect('/login');
    }
    var User = Models.User;
    User.find({ 'email': req.session.uid }, function (err, docs) {
        if (docs.length == 1) {
            res.render('chat/profile', {
                title: 'Profile',
                email: docs[0].email,
                username: docs[0].username,
                gender: docs[0].gender,
                birthday: docs[0].birthday,
                location: docs[0].location,
                whatsup: docs[0].whatsup
            });
        } else {
            console.log('wrong email');
            res.redirect(303, '/login');
        }
    });
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

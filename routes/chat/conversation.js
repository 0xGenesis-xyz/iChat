/**
 * Created by Sylvanus on 3/23/16.
 */

var express = require('express');
var router = express.Router();
var Models = require('../../models/models');

router.get('/', function(req, res, next) {
    if (req.session.uid == null) {
        res.redirect('/login');
    }
    var User = Models.User;
    User.find({ email: req.session.uid }, 'chats', function (err, docs) {
        if (docs.length == 1) {
            res.render('chat/conversation', {
                title: 'Chats',
                chats: docs[0].chats
            });
        } else {
            console.log('wrong email');
            res.redirect(303, '/login');
        }
    });
});

module.exports = router;

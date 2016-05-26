/**
 * Created by Sylvanus on 3/23/16.
 */

var express = require('express');
var router = express.Router();
var schedule = require('node-schedule');
var Models = require('../../models/models');

schedule.scheduleJob({hour: 6, minute: 0, dayOfWeek: 0}, function() {
    console.log('Time for tea!');
});

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

router.post('/checkMessage', function(req, res, next) {
    var User = Models.User;
    var Message = Models.Message;
    User.update({ email: req.session.uid }, { talkWith: req.body.uid }, function (err, raw) {
        if (err)
            console.error(error);
        console.log('The raw response from Mongo was ', raw);
    });
    Message.update({ from: req.body.uid, to: req.session.uid }, { state: 'read' }, function (err, raw) {
        if (err)
            console.error(error);
        console.log('The raw response from Mongo was ', raw);
    });
});

module.exports = router;

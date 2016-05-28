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
    var uid = req.session.uid;
    var friend = req.body.uid;
    var User = Models.User;
    var Message = Models.Message;
    User.update({ email: uid }, { talkWith: friend }, function (err, raw) {
        if (err)
            console.error(error);
        console.log('The raw response from Mongo was ', raw);
        console.log(uid+' is now talk with '+friend);
    });
    Message.update({ from: friend, to: uid }, { state: 'read' }, function (err, raw) {
        if (err)
            console.error(error);
        console.log('The raw response from Mongo was ', raw);
        console.log('Messages from '+friend+' to '+uid+' is read');
    });
});

router.post('/checkRequest', function(req, res, next) {
    var uid = req.session.uid;
    var User = Models.User;
    var Request = Models.Request;
    User.update({ email: uid }, { talkWith: 'System' }, function (err, raw) {
        if (err)
            console.error(error);
        console.log('The raw response from Mongo was ', raw);
        console.log(uid+' is now check system message');
    });
    Request.update({ to: uid }, { state: 'read' }, function (err, raw) {
        if (err)
            console.error(error);
        console.log('The raw response from Mongo was ', raw);
        console.log('Requests to '+uid+' is read');
    });
});

router.post('/removeChat', function(req, res, next) {
    var uid = req.session.uid;
    var friend = req.body.uid;
    var User = Models.User;
    User.update({ email: uid }, { $pull: { chats: friend } }, function (err, raw) {
        if (err)
            console.error(error);
        console.log('The raw response from Mongo was ', raw);
        console.log(uid+' remove the chat with '+friend);
    });
});

router.post('/acceptRequest', function(req, res, next) {
    var uid = req.session.uid;
    var friend = req.body.uid;
    var User = Models.User;
    var Request = Models.Request;
    console.log(uid+friend);
    User.update({ email: uid }, { $push: { 'friends.0.items': friend } }, function (err, raw) {
        if (err)
            console.error(error);
        console.log('The raw response from Mongo was ', raw);
        console.log(uid+' has added '+friend+' as a friend');
    });
    User.update({ email: friend }, { $push: { 'friends.0.items': uid } }, function (err, raw) {
        if (err)
            console.error(error);
        console.log('The raw response from Mongo was ', raw);
        console.log(friend+' has added '+uid+' as a friend');
    });
    Request.update({ from: friend, to: uid }, { state: 'accepted' }, function (err, raw) {
        if (err)
            console.error(error);
        console.log('The raw response from Mongo was ', raw);
        console.log('Request from '+friend+' to '+uid+' is accepted');
    });
});

router.post('/ignoreRequest', function(req, res, next) {
    var uid = req.session.uid;
    var friend = req.body.uid;
    var Request = Models.Request;
    Request.update({ from: friend, to: uid }, { state: 'ignored' }, function (err, raw) {
        if (err)
            console.error(error);
        console.log('The raw response from Mongo was ', raw);
        console.log('Request from '+friend+' to '+uid+' is ignored');
    });
});

module.exports = router;

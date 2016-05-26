/**
 * Created by Sylvanus on 5/19/16.
 */

var express = require('express');
var router = express.Router();
var Models = require('../models/models');

router.get('/', function(req, res, next) {
    res.json({ 'name': 'sylvanus' });
});

router.get('/getUserInfo', function(req, res, next) {
    var User = Models.User;
    User.find({ 'email': req.query.uid }, function (err, docs) {
        if (docs.length == 1) {
            res.json({
                email: docs[0].email,
                username: docs[0].username,
                avatar: docs[0].avatar,
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

router.get('/getChatInfo', function(req, res, next) {
    var user = req.session.uid;
    var friend = req.query.uid;
    var Message = Models.Message;
    Message.find({ $or: [{ from: user, to: friend }, { from: friend, to: user }] } , null, { sort: {time: -1} }, function (err, docs) {
        if (docs.length>0) {
            var unread = 0;
            docs.forEach(function (element) {
                if (element.to == user && element.state == 'unread') {
                    unread++;
                }
            });
            var time = docs[0].time;
            res.json({
                message: docs[0].message,
                time: time.getHours()+':'+time.getMinutes(),
                unread: unread
            });
        }
    });
});

router.get('/getCurrentChat', function(req, res, next) {
    var User = Models.User;
    User.find({ 'email': req.query.uid }, 'talkWith', function (err, docs) {
        if (docs.length == 1) {
            res.json(docs[0].talkWith);
        } else {
            console.log('wrong email');
            res.redirect(303, '/login');
        }
    });
});

router.get('/getChatMessage', function(req, res, next) {
    var user = req.session.uid;
    var friend = req.query.uid;
    var Message = Models.Message;
    Message.find({ $or: [{ from: user, to: friend }, { from: friend, to: user }] } , null, { sort: {time: 1} }, function (err, docs) {
        var messages = [];
        docs.forEach(function(element) {
            messages.push({
                from: element.from,
                to: element.to,
                message: element.message,
                time: element.time.getHours()+':'+element.time.getMinutes(),
                state: element.state
            });
        });
        res.json(messages);
    });
});

module.exports = router;

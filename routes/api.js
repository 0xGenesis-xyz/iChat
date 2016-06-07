/**
 * Created by Sylvanus on 5/19/16.
 */

var express = require('express');
var router = express.Router();
var Models = require('../models/models');

router.get('/', function(req, res, next) {
    var deviceAgent = req.header('user-agent').toLowerCase();
    var device = deviceAgent.match(/(iphone|ipad|ipod|android)/);
    if (device) {
        console.log('mobile');
    } else {
        console.log('pc');
    }
    res.json({ 'name': 'sylvanus' });
});

router.get('/checkEmail', function(req, res, next) {
    var User = Models.User;
    User.find({ email: req.query.uid }, function (err, docs) {
        if (docs.length>0) {
            res.json('taken');
        } else {
            res.json('valid');
        }
    });
});

router.get('/checkUsername', function(req, res, next) {
    var User = Models.User;
    User.find({ username: req.query.uid }, function (err, docs) {
        if (docs.length>0) {
            res.json('taken');
        } else {
            res.json('valid');
        }
    });
});

router.get('/getUserInfo', function(req, res, next) {
    var User = Models.User;
    User.find({ email: req.query.uid }, function (err, docs) {
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
            console.log('find error in getUserInfo');
            res.redirect(303, '/login');
        }
    });
});

router.get('/getChatInfo', function(req, res, next) {
    var user;
    var deviceAgent = req.header('user-agent').toLowerCase();
    var device = deviceAgent.match(/(iphone|ipad|ipod|android)/);
    if (device) {
        user = req.query.token;
    } else {
        user = req.session.uid;
    }
    var friend = req.query.uid;
    if (friend == 'Validation@System'){
        var Request = Models.Request;
        Request.find({ to: user } , null, { sort: {time: -1} }, function (err, docs) {
            if (docs.length>0) {
                var unread = 0;
                docs.forEach(function (element) {
                    if (element.to == user && element.state == 'unread') {
                        unread++;
                    }
                });
                res.json({
                    message: docs[0].from+' wants to add you as a friend',
                    time: getDisplayTime(docs[0].time),
                    unread: unread
                });
            } else {
                console.log('find error in getRequestInfo');
            }
        });
    } else {
        var Message = Models.Message;
        Message.find({ $or: [{ from: user, to: friend }, { from: friend, to: user }] } , null, { sort: {time: -1} }, function (err, docs) {
            if (docs.length>0) {
                var unread = 0;
                docs.forEach(function (element) {
                    if (element.to == user && element.state == 'unread') {
                        unread++;
                    }
                });
                res.json({
                    message: docs[0].message,
                    time: getDisplayTime(docs[0].time),
                    unread: unread
                });
            } else {
                console.log('find error in getChatInfo');
            }
        });
    }
});

router.get('/getCurrentChat', function(req, res, next) {
    var User = Models.User;
    User.find({ email: req.session.uid }, 'talkWith', function (err, docs) {
        if (docs.length == 1) {
            res.json(docs[0].talkWith);
        } else {
            console.log('find error in getCurrentChat');
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
                time: getMessageTime(element.time),
                state: element.state
            });
        });
        res.json(messages);
    });
});

router.get('/getFriendRequest', function(req, res, next) {
    var Request = Models.Request;
    Request.find({ to: req.session.uid } , null, { sort: {time: -1} }, function (err, docs) {
        var requests = [];
        docs.forEach(function(element) {
            requests.push({
                who: element.from,
                message: element.message,
                time: getDisplayTime(element.time),
                state: element.state
            });
        });
        res.json(requests);
    });
});

router.get('/getChatlistByToken', function(req, res, next) {
    var uid = req.query.token;
    var User = Models.User;
    User.find({ email: uid }, 'chats', function (err, docs) {
        if (docs.length == 1) {
            res.json({ chats: docs[0].chats });
        } else {
            console.log('wrong email');
        }
    });
});

router.get('/getFriendlistByToken', function(req, res, next) {
    var uid = req.query.token;
    var User = Models.User;
    User.find({ email: uid }, 'friends', function (err, docs) {
        if (docs.length == 1) {
            res.json({ friends: docs[0].friends });
        } else {
            console.log('wrong email');
        }
    });
});

function getDisplayTime(originalTime) {
    var timeNow = new Date();
    var displayTime;
    if (timeNow.toDateString() == originalTime.toDateString()) {
        displayTime = originalTime.getHours()+':'+originalTime.getMinutes();
    } else {
        displayTime = originalTime.getMonth()+'/'+originalTime.getDate();
    }
    return displayTime;
}

function getMessageTime(originalTime) {
    return originalTime.getHours()+':'+originalTime.getMinutes()+', '+originalTime.toDateString();
}

module.exports = router;

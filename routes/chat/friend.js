/**
 * Created by Sylvanus on 4/3/16.
 */

var express = require('express');
var router = express.Router();
var Models = require('../../models/models');

router.get('/', function(req, res, next) {
    if (req.session.uid == null) {
        res.redirect('/login');
    }
    var User = Models.User;
    User.find({ email: req.session.uid }, 'friends', function (err, docs) {
        if (docs.length == 1) {
            var groups = [];
            var friends = docs[0].friends;
            friends.forEach(function(element) {
                groups.push(element.group);
            });
            res.render('chat/friend', {
                title: 'Contacts',
                friends: friends,
                groups: groups
            });
        } else {
            console.log('wrong email');
            res.redirect(303, '/login');
        }
    });
});

router.post('/addGroup', function(req, res, next) {
    var uid = req.session.uid;
    var newGroup = req.body.newGroup;
    var User = Models.User;
    User.update({ email: uid }, { $push: { friends: { group: newGroup, items: [] }}}, function (err, raw) {
        if (err)
            console.error(error);
        console.log('The raw response from Mongo was ', raw);
        console.log(uid+' add a new group '+newGroup);
    });
    res.json({ newGroup: newGroup });
});

router.post('/changeGroup', function(req, res, next) {
    var uid = req.session.uid;
    var friend = req.body.uid;
    var fromGroup = req.body.fromGroup;
    var toGroup = req.body.toGroup;
    var User = Models.User;
    User.update({ email: uid, 'friends.group': toGroup }, { $push: { 'friends.$.items': friend } }, function (err, raw) {
        if (err)
            console.error(error);
        console.log('The raw response from Mongo was ', raw);
        console.log(uid+' add '+friend+' to group '+toGroup);
    });
    User.update({ email: uid, 'friends.group': fromGroup }, { $pull: { 'friends.$.items': friend } }, function (err, raw) {
        if (err)
            console.error(error);
        console.log('The raw response from Mongo was ', raw);
        console.log(uid+' remove '+friend+' from group '+fromGroup);
    });
    res.json({ uid: friend, gid: toGroup });
});

router.post('/deleteFriend', function(req, res, next) {
    var uid = req.session.uid;
    var friend = req.body.uid;
    var User = Models.User;
    User.update({ email: uid, 'friends.group': req.body.gid }, { $pull: { 'friends.$.items': friend } }, function (err, raw) {
        if (err)
            console.error(error);
        console.log('The raw response from Mongo was ', raw);
        console.log(uid+' delete friend '+friend);
    });
    User.update({ email: friend }, { $pull: { 'friends.$.items': uid } }, function (err, raw) {
        if (err)
            console.error(error);
        console.log('The raw response from Mongo was ', raw);
        console.log(friend+' delete friend '+uid);
    });
    res.json({ uid: friend });
});

router.post('/newChat', function(req, res, next) {
    var uid = req.session.uid;
    var friend = req.body.uid;
    var User = Models.User;
    User.find({ email: uid }, 'chats', function (err, docs) {
        if (docs.length == 1) {
            var chats = docs[0].chats;
            for (var i=0; i<chats.length; i++) {
                if (chats[i] == friend) {
                    chats.splice(i, 1);
                    break;
                }
            }
            chats.unshift(friend);
            User.findOneAndUpdate({ email: uid }, { chats: chats, talkWith: friend }, function(err, raw) {
                if (err)
                    console.error(error);
                console.log('The raw response from Mongo was ', raw);
                console.log(uid+' create a new chat with '+friend);
            });
            res.json('http://localhost:3000/conversation');
        } else {
            console.log('wrong email');
            res.redirect(303, '/login');
        }
    });
});

module.exports = router;

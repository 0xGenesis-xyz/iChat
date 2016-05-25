var express = require('express');
var router = express.Router();
var Models = require('../models/models');
var socketHandler = require('./socketHandler');

var session = require('express-session');
var sessionConf = session({
    secret: 'test',
    store: require('../models/models').sessionStore,
    cookie: { maxAge: 1000*60*60}
});

/* GET home page. */
router.get('/', function(req, res, next) {
  var id;
  if (req.session.uid) {
    id = req.session.uid;
    socketHandler.addUser(id);
  } else {
    res.redirect(303, '/login');
  }
  res.render('index', { 'ID': id });
});

module.exports = function(io) {
    var iosession = require('socket.io-express-session');
    io.use(iosession(sessionConf));

    io.on('connection', function(socket) {
        console.info('a user connected');
        console.info(socket.handshake.session.uid);
        var uid = socket.handshake.session.uid;
        if (uid) {
            socketHandler.addUser(uid);
            socketHandler.setSocket(uid, socket);
            // find unread in mongodb
            // sendMessage()
        }

        socket.on('chat', function(info) {
            console.log('receive chat: '+uid);
            // save to mongodb
            sendMessage(uid, info.to, info.message, info.time);
        });

        socket.on('disconnect', function(){
            socketHandler.deleteSocket(uid);
            console.info('user disconnected');
        });

        function sendMessage(from, to, msg, time) {
            var toUser = socketHandler.userOfID(to);
            if (toUser) {
                toUser.socket.emit('chat');
            } else {
                console.log('no receiver');
            }
        }
    });

  return router;
};

module.exports.sessionConf = sessionConf;

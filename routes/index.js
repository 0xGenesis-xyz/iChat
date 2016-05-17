var express = require('express');
var router = express.Router();

var socketHandler = require('./socketHandler');

var session = require('express-session');
var sessionConf = session({ secret: 'test', cookie: { maxAge: 1000*60*10}});

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
  //res.write('index');
  //res.end();
});

module.exports = function(io) {
  var iosession = require('socket.io-express-session');
  io.use(iosession(sessionConf));

  io.on('connection', function(socket) {
    console.info(socket.handshake.session.uid);
    if (socket.handshake.session.uid) {
      socketHandler.setSocket(socket.handshake.session.uid, socket);
    }

    socket.on('chat', function(info) {
      console.log('receive chat: '+info.from);
      var fromUser = socketHandler.userOfID(info.from);
      if (fromUser) {
        var toUser = socketHandler.userOfID(info.to);
        if (toUser) {
          toUser.socket.emit('chat', {name: fromUser.uid, text: info.text});
        } else {
          console.log('no receiver');
        }
      } else {
        console.log('no sender');
      }
    });

    socket.on('disconnect', function(){
      console.info('user disconnected');
    });
  });

  return router;
};

module.exports.sessionConf = sessionConf;
/**
 * Created by Sylvanus on 3/23/16.
 */

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('chat/conversation', { title: 'Chats' });
});

module.exports = router;
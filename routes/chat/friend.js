/**
 * Created by Sylvanus on 4/3/16.
 */

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('chat/friend', { title: 'Contacts' });
});

router.post('/addFriend', function(req, res, next) {
    res.write('add');
    res.end();
});

module.exports = router;
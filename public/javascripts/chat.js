/**
 * Created by Sylvanus on 5/26/16.
 */

function fetchFriendListInfo() {
    $('li.list-group-item').each(function(index, element) {
        var uid = $(this).attr('id').split('friend__')[1];
        $.getJSON('api/getUserInfo', {uid: uid}, function (data, textStatus) {
            $(element).find('.friendAvatar').attr('src', 'avatars/' + data.avatar);
            $(element).find('.friendName').text(data.username);
            $(element).find('.friendWhatsup').text(data.whatsup);
        })
    })
}

function fetchChatListInfo() {
    $('li.chatListItem').each(function(index, element) {
        var uid = $(this).attr('id').split('chat__')[1];
        $.getJSON('api/getUserInfo', {uid: uid}, function (data, textStatus) {
            $(element).find('.chatAvatar').attr('src', 'avatars/' + data.avatar);
            $(element).find('.chatName').text(data.username);
        });
        $.getJSON('api/getChatInfo', {uid: uid}, function (data, textStatus) {
            $(element).find('.chatMessage').text(data.message);
            $(element).find('.chatTime').text(data.time);
            $(element).find('.unread').text(data.unread);
            if (data.unread == 0) {
                $(element).find('.unread').hide();
            } else {
                $(element).find('.chatTime').hide();
            }
        });
        $(this).find('i.removeChat').hide();
    });
}

function updateChatList(currentChat, uid, message, time) {
    var cid = '_chat__'+uid;
    var unread = $(document.getElementById(cid)).find('.unread').text();
    if (uid == currentChat) {
        unread = 0;
    } else {
        unread = parseInt(unread)+1;
    }
    $(document.getElementById(cid)).remove();
    var html = '<li class="chatListItem" id="' + cid + '">';
    html += '<a class="media" href="#">';
    html += '<div class="media-left">';
    html += '<img class="chatAvatar" width="40" height="40">';
    html += '</div>';
    html += '<div class="media-body">';
    html += '<div class="media-heading chatName"></div>';
    html += '<small class="chatMessage">' + message + '</small>';
    html += '</div>';
    html += '<div class="media-right media-middle" style="padding-right: 16px">';
    // hidden bug
    if (uid == currentChat) {
        html += '<small class="chatTime">'+time+'</small>';
        html += '<span class="badge unread hidden">'+unread+'</span>';
    } else {
        html += '<small class="chatTime hidden">'+time+'</small>';
        html += '<span class="badge unread">'+unread+'</span>';
    }
    html += '</div></a></li>';
    $('ul#chatList').prepend(html);
    $.getJSON('api/getUserInfo', {uid: uid}, function (data, textStatus) {
        $(document.getElementById(cid)).find('.chatAvatar').attr('src', 'avatars/' + data.avatar);
        $(document.getElementById(cid)).find('.chatName').text(data.username);
    });
}

function showChatContent(uid, friendAvatar) {
    $('#chatValidation').hide();
    $.getJSON('api/getUserInfo', {uid: uid}, function (data, textStatus) {
        $('#chatingAvatar').attr('src', 'avatars/' + data.avatar); // friendAvatar
        $('#chatingName').text(data.username);
        $('#chatingWhatsup').text(data.whatsup);
        $('#chatHeading').show();
    });
    $('#chatingContent').empty();
    $.getJSON('api/getChatMessage', {uid: uid}, function(data, textStatus) {
        var myAvatar = $('#avatarBtn').attr('src');
        data.messages.forEach(function(element) {
            var html;
            if (element.from == uid) {
                html = '<img width="40" height="40" src="'+friendAvatar+'">';
            }
            if (element.to == uid) {
                html = '<img width="40" height="40" src="'+myAvatar+'">';
            }
            html += '<div class="bubble">';
            html += '<p class="message">'+element.message+'</p>';
            html += '<p class="time">'+element.time+'</p>';
            html += '</div>';
            if (element.from == uid) {
                html = '<li>'+html+'</li>';
            }
            if (element.to == uid) {
                html = '<li class="current-user">'+html+'</li>';
            }
            $('#chatingContent').append(html);
        });
        $('#chatContent').show();
        $('#chatSend').show();
    });
    $.post('/api/checkMessage', {uid: uid});
}

function showValidationContent() {
    $('#chatContent').hide();
    $('#chatSend').hide();
    $('#chatingAvatar').attr('src', 'avatars/Validation@System');
    $('#chatingName').text('Friend Validation');
    $('#chatHeading').show();
    $('#requests').empty();
    $.getJSON('api/getFriendRequest', function(data, textStatus) {
        data.requests.forEach(function(element) {
            $.getJSON('api/getUserInfo', { uid: element.who }, function (data, textStatus) {
                var html = '<img class="img-circle" width="40" height="40" src="avatars/'+data.avatar+'">';
                html = '<div class="media-left media-top"><a href="#">'+html+'</a></div>';
                html += '<div class="media-body">';
                html += '<h4 class="media-heading">'+data.username+' wants to add you as a friend. ('+element.time+')</h4>';
                html += '<p>'+element.message+'</p>';
                html += '</div>';
                html = '<div class="col-md-8"><div class="media" style="padding: 10px 30px;">'+html+'</div></div>';
                html += '<div class="col-md-4" style="padding: 20px">';
                if (element.state == 'accepted') {
                    html += '<button class="btn btn-info disabled">Accepted</button>';
                } else if (element.state == 'ignored') {
                    html += '<button class="btn btn-info disabled">Ignored</button>';
                } else {
                    html += '<button class="btn btn-primary submitAccept">Accept</button>';
                    html += '<button class="btn btn-default submitIgnore">Ignore</button>';
                }
                html += '</div>';
                html = '<div class="widget-container fluid-height"><div class="row">'+html+'</div></div>';
                html = '<li id="_request__'+element.who+'" style="padding: 20px 30px;">'+html+'</li>';
                $('#requests').prepend(html);
            });
        });
        $('#chatValidation').show();
    });
    $.post('/api/checkRequest');
}

function getMyInfo() {
    var uid = $('#sidebarEmail').text();
    $.getJSON('api/getUserInfo', { uid: uid }, function (data, textStatus) {
        $('#sidebarUsername').text(data.username);
        $('img.img-circle#avatarBtn').attr('src', 'avatars/' + data.avatar);
        $('h2#nickname').text(data.username);
        $('p#whatsup').text(data.whatsup);
        $('img.img-circle#avatar').attr('src', 'avatars/' + data.avatar);
        $('td#email').text(data.email);
        $('td#gender').text(data.gender);
        $('td#birthday').text(data.birthday);
        $('td#location').text(data.location);
    });
}

$(document).ready(function() {

    // sidebar
    $('img.img-circle#avatarBtn').bind('click', function() {
        document.getElementById('showProfile').click();
    });
    getMyInfo();

    // conversation
    var currentChat;
    fetchChatListInfo();
    $('#chatHeading').hide();
    $('#chatContent').hide();
    $('#chatSend').hide();
    $('#chatValidation').hide();
    $.getJSON('api/getCurrentChat', function(data, textStatus) {
        $(document.getElementById('_chat__'+data)).click();
    });
    $('i.removeChat').bind('click', function() {
        var uid = $(this).parents('li').attr('id').split('chat__')[1];
        $.post('/api/removeChat', {uid: uid});
        $(this).parents('li').remove();
    });
    $(document).on('mouseover', 'li.chatListItem', function() {
        // bug after send
        $(this).find('i.removeChat').show();
    });
    $(document).on('mouseout', 'li.chatListItem', function() {
        $(this).find('i.removeChat').hide();
    });
    $(document).on('click', 'li.chatListItem', function() {
        var uid = $(this).attr('id').split('chat__')[1];
        currentChat = uid;
        if (uid == 'Validation@System') {
            showValidationContent();
        } else {
            var friendAvatar = $(this).find('.chatAvatar').attr('src');
            showChatContent(uid, friendAvatar);
        }
        $(this).find('.unread').text('0');
        $(this).find('.unread').hide();
        $(this).find('.chatTime').show();
    });
    $(document).on('click', '.submitAccept', function() {
        var uid = $(this).parents('li').attr('id').split('request__')[1];
        $(this).parent().html('<button class="btn btn-info disabled">Accepted</button>');
        $.post('/api/acceptRequest', {uid: uid});
    });
    $(document).on('click', '.submitIgnore', function() {
        var uid = $(this).parents('li').attr('id').split('request__')[1];
        $(this).parent().html('<button class="btn btn-info disabled">Ignored</button>');
        $.post('/api/ignoreRequest', {uid: uid});
    });

    // friend
    var currentUser;
    var currentGroup;
    fetchFriendListInfo();
    $('#friendInfo').hide();
    $('i.icon-plus#addBtn').bind('click', function() {
        $(document.getElementById('add')).click();
    });
    $('#addFriendNav').click(function() {
        $('#addFriendNav').addClass('active');
        $('#addGroupNav').removeClass('active');
        $('#addFriend').show();
        $('#addGroup').hide();
    });
    $('#addGroupNav').click(function () {
        $('#addFriendNav').removeClass('active');
        $('#addGroupNav').addClass('active');
        $('#addFriend').hide();
        $('#addGroup').show();
    });
    $('button#submitNewGroup').click(function() {
        $.post('/api/addGroup', $('form#addGroup').serialize(), function(data) {
            var html = '<li>';
            html += '<a class="media" href="#'+data.newGroup+'" data-toggle="collapse">';
            html += '<div class="media-left media-middle">';
            html += '<span class="caret"></span>';
            html += '</div>';
            html += '<div class="media-body">'+data.newGroup+'</div>';
            html += '</a>';
            html += '<div class="collapse" id="'+data.newGroup+'">';
            html += '<ul class="list-group" id="_group__'+data.newGroup+'">';
            html += '</ul></div></li>';
            $('ul#group').append(html);
            $('select.form-control.input-sm').append('<option value="'+data.newGroup+'">'+data.newGroup+'</option>');
        })
    });
    $('button#submitChangeGroup').click(function() {
        var toGroup = $('select#selectGroup').val();
        $.post('/api/changeGroup', { uid: currentUser, fromGroup: currentGroup, toGroup: toGroup }, function (data) {
            var uid = '_friend__'+data.uid;
            var avatar = $(document.getElementById(uid)).find('.friendAvatar').attr('src');
            var username = $(document.getElementById(uid)).find('.friendName').text();
            var whatsup = $(document.getElementById(uid)).find('.friendWhatsup').text();
            $(document.getElementById(uid)).remove();
            var html = '<li class="list-group-item" id="' + uid + '">';
            html += '<a class="media" href="#">';
            html += '<div class="media-left">';
            html += '<img class="friendAvatar" width="40" height="40" src="' + avatar + '">';
            html += '</div>';
            html += '<div class="media-body">';
            html += '<div class="media-heading friendName">' + username + '</div>';
            html += '<small class="friendWhatsup">' + whatsup + '</small>';
            html += '</div></a></li>';
            var gid = '_group__' + data.gid;
            $(document.getElementById(gid)).append(html);
        })
    });
    $('button#submitChat').click(function() {
        $.post('/api/newChat', { uid: currentUser }, function(data) {
            window.location = data;
        });
    });
    $('button#submitDelFriend').click(function() {
        $.post('/api/deleteFriend', { uid: currentUser, gid: currentGroup }, function (data) {
            var uid = '_friend__'+data.uid;
            $(document.getElementById(uid)).remove();
            $('#friendInfo').hide();
        })
    });
    $(document).on('click', 'li.list-group-item', function() {
        var uid = $(this).attr('id').split('friend__')[1];
        var gid = $(this).parent().attr('id').split('group__')[1];
        currentUser = uid;
        currentGroup = gid;
        $.getJSON('api/getUserInfo', {uid: uid}, function (data, textStatus) {
            $('img.img-circle#friendAvatar').attr('src', 'avatars/' + data.avatar);
            $('h2#friendNickname').text(data.username);
            $('h5#friendEmail').text(data.email);
            $('p#friendWhatsup').text(data.whatsup);
            $('select#selectGroup').children().removeAttr('selected');
            $('select#selectGroup').children().filter(function() {
                return ($(this).val() == gid);
            }).attr('selected', 'selected');
            // select bug
            $('td#friendGender').text(data.gender);
            $('td#friendBirthday').text(data.birthday);
            $('td#friendLocation').text(data.location);
            $('#friendInfo').show();
        })
    });

    // socket.io
    var socket = io();
    socket.on('unread', function(count) {
        // click in conversation bug
        if (count == 0) {
            $('span.badge#unread').hide();
        } else {
            $('span.badge#unread').text(count);
            $('span.badge#unread').show();
        }
    });
    socket.on('newMessage', function(data) {
        updateChatList(currentChat, data.uid, data.message, data.time);
        if (data.uid == currentChat) {
            var myAvatar = $('#avatarBtn').attr('src');
            // avatar bug
            var html = '<img width="40" height="40" src="'+myAvatar+'">';
            html += '<div class="bubble">';
            html += '<p class="message">'+data.message+'</p>';
            html += '<p class="time">'+data.time+'</p>';
            html += '</div>';
            if (data.who == data.uid) {
                html = '<li>'+html+'</li>';
            } else {
                html = '<li class="current-user">'+html+'</li>';
            }
            $('#chatingContent').append(html);
            $.post('/api/checkMessage', {uid: data.uid});
        }
    });
    socket.on('newRequest', function(data) {
        updateChatList(currentChat, 'Validation@System', data.who+' wants to add you as a friend', data.time);
        if (currentChat == 'Validation@System') {
            // dynamic refresh
            var html = data.who+' wants to add you. '+data.message+data.time;
            html = '<li>'+html+'</li>';
            $('#requests').prepend(html);
            $.post('/api/checkRequest');
        }
    });

    $('#submitMessage').click(function() {
        socket.emit('send', {
            to: currentChat,
            message: $('#content').val()
        });
        $('#content').val('');
    });
    $('#submitNewFriend').click(function () {
        socket.emit('request', {
            uid: $('#requestID').val(),
            message: $('#requestMessage').val()
        });
    });

});

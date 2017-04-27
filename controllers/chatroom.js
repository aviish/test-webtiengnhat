var path = require('path');
var Message = require(path.join(__dirname, '../models/Message'));
var MessageToUser = require(path.join(__dirname, '../models/MessageToUser'));
//get chatroom
exports.chatroomGet = function(req, res){
  res.render('chatroom',{
    title : 'Chat Room'
  });
};
exports.newMessage = function(data){
  Message.forge(data).save().then(function(m) {  
    console.log('Message saved: " '+  m.get('content') + '" from ' + m.get('sender_name'));
	});
}



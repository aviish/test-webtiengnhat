var path = require('path');
var _ = require('lodash');
var chatroomController = require(path.join(__dirname, '../controllers/chatroom.js'));
module.exports = (io)=>{
    var onlineUsers = [];
    var chatSocket = io.of('/chatroom');
    chatSocket.on("connection", function(socket){
        console.log("Co nguoi vua ket noi, socket_id: " + socket.id );
        socket.on("join", function(username){
            console.log("Co nguoi dang ky username la: " + username);
            socket.username = username;
            user = {
                username: username,
                id: socket.id
            }
            onlineUsers.push(user);
            
            chatSocket.emit("join_success", onlineUsers);

            socket.on("client_send_message", function(data){
                var contents = {
                    content: data,
                    sender_name: socket.username,
                    is_public:1,
                    created_at: new Date()
                };
                chatroomController.newMessage(contents);
                chatSocket.emit("server_send_message", {username:socket.username, mgs:data});
            });
        });

        socket.on("disconnect", function(data) {
            console.log("Co nguoi thoat khoi phong, socket_id: " + socket.id);
            var index = _.findIndex(onlineUsers, { id: socket.id });
            onlineUsers.splice(index, 1);
            chatSocket.emit("remove_user", socket.id);
        });
    });
}
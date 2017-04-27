module.exports = function(listRoom, listUser, socket){
var _ = require('lodash');
   return function(){
        var indexUser = _.findIndex(listUser, {
            socket: socket.id
        });
        if(indexUser!==-1){
            var room_id = listUser[indexUser].room_id;
            listUser.splice(indexUser, 1);
            var indexRoom = _.findIndex(listRoom, {
                room_id: room_id
            });
            if(indexRoom!==-1){
                var indexSocket = _.findIndex(listRoom[indexRoom].listSocket, {
                    socket: socket.id
                });
                listRoom[indexRoom].listSocket.splice(indexSocket,1);
                socket.broadcast.to(room_id).emit('on_leave',{
                    socket: socket.id
                });
                if(listRoom[indexRoom].listSocket.length <= 0){
                    listRoom.splice(indexRoom, 1);
                }
            }
        }
        console.log('disconnect');
        console.log(listRoom);
        console.log(listUser);
   }
}
module.exports = function(listRoom, listUser, socket){
    return function(data){
         /**
         * data = {
         *  type: 'mic',
         *  status: true,
         *  room_id: 'test'
         * }
         */
        data.socket = socket.id;
        var room_id = data.room_id;
        delete data.room_id;
        socket.broadcast.to(room_id).emit('on_option', data);
    }
}
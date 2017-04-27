module.exports = function(io, listRoom, listUser, socket){
    return function(data){
         /**
         * data = {
         *  to: 'socket_id',
         *  type: 'candicate',
         *  payload: 'data'
         * }
         */
        console.log('[message]', data);
        var where = data.to;
        delete data.to;
        data.from = socket.id;
        io.to(where).emit('on_receive_message', data);
    }
}
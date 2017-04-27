module.exports = (io)=>{
    var listRoom = [];
    var listUser= [];
    /**
    * room = {
 	*      room_id: '123',
	*      room_type: 1
 	*      listSocket: [socket_id, ....,]
    * }
    */
    io.on('connection', require('./connection.js')(io, listRoom, listUser));
}

module.exports = function(listRoom, listUser, socket){
    var _ = require('lodash');

    var dataResponse = {};

    //chỉ số lượng người trong 1 phòng ví dụ phòng arr_room_type[0] = 5 nguười //phòng tự do
    //arr_room_type[1] = 3 nguười //phòng bài 1 
    //arr_room_type[50] = 3 nguười //phòng bài cuối cùng bài 50
    var arr_room_type =[5,3,2,3,3,3,3,3,3,3,3,3,2,3,3,3,3,3,3,3,3,3,2,3,3,3,3,3,3,3,3,3,2,3,3,3,3,3,3,3,3,3,2,3,3,3,3,3,3,3]; 
    return function(data){
         console.log('join');
        /**
         * data= {
         *  username: 'hainguyen'
         *  room_type: 1,
         *  room_id: '42342342'
         * }
         */
    }

    var indexRoom =  _.findIndex(listRoom, {
        room_id: data.room_id
    })
    var indexUser = _.findIndex(listUser, {
        socket: socket_id
    })

    console.log("Join_Or_Create : " + listRoom );

    if(indexUser === -1 && ((indexRoom !== -1 && listRoom[indexRoom].listSocket.length < arr_room_type[data.room_type]) || (indexRoom === -1))){
        dataResponse = true;
        console.log("Create or Join successfull!");
        socket.once('ready', () => {
                socket.join(data.room_id);
                socket.broadcast.to(data.room_id).emit('on_join', {
                    socket: socket.id,
                    username: data.username
                });
                listUser.push({
                    username: data.username,
                    socket: socket.id,
                    room_id: data.room_id
                });

                if (indexRoom !== -1) {
                     listRoom[indexRoom].listSocket.push(socket.id)
                }
                
                if(indexRoom === -1) {
                    listRoom.push({
                    room_id: data.room_id,
                    listSocket: [socket.id]
                })
                }
                console.log(listRoom);
                console.log(listUser);
            });
    } else {
        console.log('Failed!');
        dataResponse.status = false;
        if (indexUser !== -1) {
            dataResponse.error_code = 1001; // user already in some Room
            console.log('User already in someRoom!');
        } else if (indexRoom !== -1) {
            dataResponse.error_code = 1002; // room full
            console.log('Room full');
        }
    }
    socket.emit('on_result_join_or_create', dataResponse);
}
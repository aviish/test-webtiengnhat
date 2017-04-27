module.exports = (listRoom, listUser, socket) => {
    var _ = require('lodash');
    var join_or_create = (data) => {
        console.log('join');
        /**
         * data= {
         *  request_code: '334324',
         *  room_id: '42342342'
         * }
         */
console.log('data', data);
        var indexRoom = _.findIndex(listRoom, {
            room_id: data.room_id
        });

        var indexUser = _.findIndex(listUser, {
            socket: socket.id
        });

        console.log('[join_or_create]', indexRoom);
        var dataResponse = {};

        if (indexUser === -1 && ((indexRoom !== -1 && listRoom[indexRoom].password == data.request_code && listRoom[indexRoom].listSocket.length < 5) || (indexRoom === -1)) ) {
            console.log('Successfull!');
            dataResponse.status = true;
            socket.once('ready', () => {
                socket.join(data.room_id);
                socket.broadcast.to(data.room_id).emit('on_join', {
                    socket: socket.id
                });
                listUser.push({
                    socket: socket.id,
                    room_id: data.room_id
                });
                (indexRoom !== -1) && (listRoom[indexRoom].listSocket.push(socket.id));
                (indexRoom === -1) && (listRoom.push({
                    room_id: data.room_id,
                    password: data.request_code,
                    listSocket: [socket.id]
                }));
                console.log('listRoom', listRoom);
                console.log('listUser', listUser);
            });

        } else {
            console.log('Failed!');
            dataResponse.status = false;
            if (indexUser !== -1) {
                dataResponse.error_code = 1004; // user already in some Room
                console.log('User already in someRoom!');
            } else if (listRoom[indexRoom].listSocket.length >= 5) {
                dataResponse.error_code = 1001; // room full
                console.log('Room full');
            } else if (indexRoom === -1) {
                dataResponse.error_code = 1002;
                console.log('Room is not open');
            } else {
                dataResponse.error_code = 1003; // wrong password
                console.log('Wrong password!');
            }
        }
        socket.emit('on_result_join_or_create', dataResponse);

    }
    return join_or_create;
}

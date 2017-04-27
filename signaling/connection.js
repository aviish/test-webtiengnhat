module.exports = function(io, listRoom, listUser){
    return  function(socket){
                socket.on('join_or_create', require('./join_or_create.js')(listRoom, listUser, socket));
                socket.on('message', require('./message.js')(io,listRoom, listUser, socket));
                socket.on('option', require('./option.js')(listRoom, listUser, socket));
                socket.on('disconnect', require('./disconnect.js')(listRoom, listUser, socket));
            }
}

//get public video conferenroom
exports.publicVideoRoomGet = function(req, res){
  res.render('publicVideoRoom',{
    title : 'Hội thoại tự do'
  });
};

exports.createRoom = function(req, res) {
	res.render('conference', {
      room: ''
  });
}

exports.joinRoom = function(req, res) {
	var room = req.params.room;
  res.render('conference', {
      room: room
  });
};
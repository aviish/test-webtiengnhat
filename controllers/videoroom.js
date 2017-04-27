

//get chatroom
exports.videoroomGet = function(req, res){
  res.render('videoroom',{
    title : 'Hội thoại theo bài'
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
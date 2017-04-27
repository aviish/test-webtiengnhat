// var signaling = 'https://127.0.0.1:3000';
var signaling = '';

var STUN = {
    'urls': 'stun:stun.l.google.com:19302'
};
var TURN = {
    'urls' : 'turn:104.199.237.82:3478',
    'username' : 'callwork',
    'credential' : '123456'
};

var config = {
   'iceServers': [STUN, TURN]
};

var error = {
   invalidRoomName: "Hãy nhập tên phòng",
   invalidCode: "Hãy nhập đúng mật khẩu của phòng",
   serverError: "Không có kết nối tới signaling server.",
   roomFull: 'Phòng đầy.',
   notOpen: 'Phòng chưa tồn tại.',
   wrongpassword: 'Mật khẩu sai.',
   permission: 'You have denied permission to use camera/microphone.'
};

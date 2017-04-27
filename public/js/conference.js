var socket;

var constraints = {
	offerToReceiveAudio: 1,
	offerToReceiveVideo: 1
};

var listMyFile = [];
var listFileReceive = [];

var localStream;
var videoTrack;
var audioTrack;

var currentRoom;
var registeredCode = '';
var peerConnections = {};

var createPage = document.getElementById('createPage');
var roomName = document.getElementById('roomName');
var startBtn = document.getElementById('startBtn');

var videoPage = document.getElementById('videoPage');
var videoLocal = document.getElementById('videoLocal');
var endBtn = document.getElementById('endBtn');
var copyBtn = document.getElementById('copyBtn');
var videoMuteBtn = document.getElementById('videoMuteBtn');
var audioMuteBtn = document.getElementById('audioMuteBtn');
var locationLink = document.getElementById('locationLink');

var textArea = document.getElementById('textArea');
var messageInput = document.getElementById('messageInput');
var sendBtn = document.getElementById('sendBtn');
var attachFile = document.getElementById('attachFile');
var getFile = document.getElementById('get');

var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var snapshot = document.getElementById('snapshot');

function displayPage(page, event) {
	if(event) {
		page.style.display = "inherit";
	} else {
		page.style.display = "none";
	}
};

function capture() {
	if(localStream) {
		canvas.width = 50;
		canvas.height = 50;
		ctx.drawImage(videoLocal, 0, 0, 50, 50);
		var snap = canvas.toDataURL('image/webp').slice(23);
		snapshot.src = "data:image/webp;base64,"+snap; //image/png for other browsers
	}
	return snap;
}

function resize() {
	textArea.scrollTop = textArea.scrollHeight;
	window.scrollTo(0, window.innerHeight);
}

//------------------------- Create room Page --------------------------
$('#passwordCheckBox').on('change', function(event) {
	$('#passwordInput').val('');
	this.checked ? $('#passwordDiv').show() : $('#passwordDiv').hide();
});

roomName.addEventListener("keyup", function(event) {
	event.preventDefault();
	if (event.keyCode == 13) {
		startBtn.click();
	}
});

startBtn.addEventListener("click", function(event) {
	if(roomName.value !== "") {
		socket = io(signaling, {'timeout': 8000});
		socketEvent();
		currentRoom = roomName.value;
		registeredCode = $('#passwordInput').val();
		socket.emit('join_or_create', { room_id: currentRoom, request_code: registeredCode });
	} else {
		alert(error.invalidRoomName);
	}
});
// start
if(roomName.value !==''){
	startBtn.click();
	console.log('start');
	console.log(roomName.value);
}

//------------------------- Video Page --------------------------
copyBtn.addEventListener("click", function(event) {
	copyToClipboard(locationLink);
	$('#copyNotify').fadeIn(500);
	setTimeout(function() {
		$('#copyNotify').fadeOut(1000);
	}, 4000);
});

messageInput.addEventListener("keyup", function(event) {
	event.preventDefault();
	if(event.keyCode == 13) {
		sendBtn.click();
	}
});

sendBtn.addEventListener("click", function(event) {
   var message = messageInput.value;
   messageInput.value = "";
   if(message !== "") {
	  var snap = capture();
	  textArea.innerHTML += "" +
		  "<div class='wrap_messeage currentRoom'>" +
			 "<div class='message'>" + message + "</div> " +
			 "<div class='avatar'>" +
			   "<img src='"+snapshot.src+"' />" +
			 "</div>" +
		  "</div>";

	  textArea.scrollTop = textArea.scrollHeight;
	  var data = {
		 message: message,
		 avatar: snap,
		 type: 'text'
	  }
	  for(var member in peerConnections) {
		 var channel = peerConnections[member][1];
		 channel.send(JSON.stringify(data));
	  }
   }
});

attachFile.addEventListener("click", function(event) {
	getFile.click();
})

getFile.onchange = function () {
	var file = this.files[0];
	var id = Date.now().toString();
	listMyFile.push({
		file: file,
		id: id
	});
	var snap = capture();
	var data = {
		avatar: snap,
		type: 'file',
		file_name: file.name,
		id: id
	};
	textArea.innerHTML += "" +
		"<div class='wrap_messeage currentRoom'>" +
			"<div class='message'>" + "File: "+file.name + "</div> " +
			"<div class='avatar'>" +
				"<img src='"+ snapshot.src +"' />" +
			"</div>" +
		"</div>";
	textArea.scrollTop = textArea.scrollHeight;
	console.log('Send file');
	for(var member in peerConnections) {
		var channel = peerConnections[member][1];
		channel.send(JSON.stringify(data));
	}
};

videoMuteBtn.addEventListener("click", function(event) {
	videoTrack.enabled = !(videoTrack.enabled);
	if($('#videoMuteBtn').attr("value") == "on") {
		$('#videoImg').attr('src', '/images/cam-off.png');
		$('#videoMuteBtn').attr('value', 'off');
		$("#viImgLocal").removeClass("hidden");
		socket.emit('option', { type: 'video', status: false, room_id: currentRoom });
		console.log('turn off video');
	} else {
		$('#videoImg').attr('src', '/images/cam-on.png');
		$('#videoMuteBtn').attr('value', 'on');
		$("#viImgLocal").addClass("hidden");
		socket.emit('option', { type: 'video', status: true, room_id: currentRoom });
		console.log('turn on video');
	}
});

audioMuteBtn.addEventListener("click", function(event) {
	audioTrack.enabled = !(audioTrack.enabled);
	if($('#audioMuteBtn').attr("value") == "on") {
		$('#audioImg').attr('src', '/images/mic-off.png');
		$('#audioMuteBtn').attr('value', 'off');
		$('#micIconLocal').removeClass("hidden");
		socket.emit('option', { type: 'mic', status: false, room_id: currentRoom });
		console.log('turn off mic');
	} else {
		$('#audioImg').attr('src', '/images/mic-on.png');
		$('#audioMuteBtn').attr('value', 'on');
		$('#micIconLocal').addClass("hidden");
		socket.emit('option', { type: 'mic', status: true, room_id: currentRoom });
		console.log('turn on mic');
	}
});

endBtn.addEventListener("click", function(event) {
	hangup();
});

/* -------------------------------------- */
function socketEvent() {
	// socket.on('disconnect', function(msg) {
	// 	hangup();
	// });

	socket.on('connect_error', function(msg) {
		console.log(msg);
		alert(error.serverError);
		hangup();
	});

   	socket.on('on_result_join_or_create', function(msg) {
	  	if(!msg.status) {
				switch (msg.error_code) {
					case 1001:
						  alert(error.roomFull);
						  window.location = '/'
						  break;
					case 1002:
						  alert(error.notOpen);
						  window.location = '/';
					   	break;
					case 1003:
					   	registeredCode = "";
					   	displayPage(createPage, false);
			   			setTimeout(function() {
					   		alert(error.wrongCode);
					   	}, 100);
					   	break;
		 		}
				socket.disconnect();
	  	} else {
			 	window.history.replaceState('page2', 'Title', '/videoroom/r/'+currentRoom);
			 	window.history.pushState('page2', 'Title', '/videoroom/r/'+currentRoom);
			 	locationLink.value = location.href;
			 	loadStream();
			 	displayPage(createPage, false);
			 	displayPage(videoPage, true);
			 	console.log("Create room success");
	  	}
   	});

   	socket.on('on_join', function(msg) {
	  	makeOffer(msg.socket);
   	});

   	socket.on('on_receive_message', function(msg) {
	  	console.log("[socket.receiveMessage] socket", socket.id);
	  	console.log("[socket.receiveMessage] msg", msg);
	  	var pc = getPeerConnection(msg.from);

	  	if(msg.type === "candidate") {
			pc.addIceCandidate(new RTCIceCandidate(msg.payload));
	  	} else if(msg.type === "offer") {
		 	pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
		 	pc.createAnswer()
		 	.then(function (answer) {
				pc.setLocalDescription(answer);
				sendMessage(msg.from, "answer", answer);
		 	})
		 	.catch(errorLog);
	  	} else if(msg.type === "answer") {
		 	pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
	  	}
   	});

   	socket.on('on_option', function(data) {
	  	console.log('on_option', data);
	  	if(data.type === 'mic') {
			if(data.status) {
				$('#micIcon' + data.socket).addClass('hidden');
			} else {
				$('#micIcon' + data.socket).removeClass('hidden');
			}
		}
		if(data.type === 'video') {
			if(data.status) {
				$("#viImg" + data.socket).addClass("hidden");
			} else {
				$("#viImg" + data.socket).removeClass("hidden");
			}
		}
	});

   	socket.on('on_leave', function(data) {
	  	console.log('on_leave', data.socket);
		var pc = getPeerConnection(data.socket);
		pc.close();
		if($("#video"+data.socket).hasClass("mainVideo")) {
			var lastRemote = $(".remoteVideo").last().attr('id');
			switchVideo(lastRemote);
		}
		$("#div"+data.socket).remove();
		delete peerConnections[data.socket];
	});
};

function errorLog(e) {
	console.log(e.name + ": " + e.message);
	if(error.name === "PermissionDeniedError") {
		displayPage(createPage, true);
		displayPage(videoPage, false);
		alert(error.permission)
	}
};

function sendMessage(to, type, payload) {
	console.log('[sendMessage]', to, type, payload);
	var msg = {
		to: to,
		type: type,
		payload: payload
	};
	socket.emit('message', msg);
}

function loadStream() {
	navigator.mediaDevices.getUserMedia({ "audio": true, "video": true })
		.then(gotStream)
		.catch(errorLog);
};

function gotStream(stream) {
	console.log('[gotStream]', stream);
	videoLocal.src = window.URL.createObjectURL(stream);
	localStream = stream;
	$("#videoLocal").prop('muted', true);
	videoTrack = localStream.getVideoTracks()[0];
	audioTrack = localStream.getAudioTracks()[0];
	checkStream();
};

function checkStream() {
	console.log('[checkStream]');
	console.log('audioTrack', audioTrack);
	console.log('videoTrack', videoTrack);
	if(!videoTrack) {
		videoMuteBtn.disabled = true;
		videoMuteBtn.setAttribute("value", "off");
		$("#viImgLocal").removeClass("hidden");
	}
	if(!audioTrack) {
		audioMuteBtn.disabled = true;
		audioMuteBtn.setAttribute("value", "off");
		$("#micIconLocal").removeClass("hidden");
	}
	socket.emit('ready');
}

function getPeerConnection(user) {
   if(peerConnections[user]) {
	  return peerConnections[user][0];
   }
   var pc = new RTCPeerConnection(config);
   var channel;
   peerConnections[user] = [pc, channel];
   pc.addStream(localStream);
   pc.onaddstream = handleRemoteStream;
   pc.onicecandidate = function(event) {
	   if(event.candidate) {
			console.log("handleIceCandidate");
		 	sendMessage(user, "candidate", event.candidate);
	  	}
   };
   pc.oniceconnectionstatechange = handleIceConnectionStateChange;

   pc.ondatachannel = function(event) {
	  	console.log('DataChannel is added ', event);
	  	var channel = event.channel;
		 
	  	peerConnections[user][1] = channel;
		 
	  	setChannelEvents(channel);
   };

   return pc;
};

function makeOffer(user) {
	var pc = getPeerConnection(user);
	var channel = pc.createDataChannel('RTCDataChannel', {reliable: true});
	peerConnections[user][1] = channel;
	setChannelEvents(channel);

	pc.createOffer(constraints)
	.then(function (offer) {
		console.log("Create offer for ", user);
		pc.setLocalDescription(offer);
		sendMessage(user, "offer", offer);
	})
	.catch(errorLog);
};

function handleIceConnectionStateChange(event) {
	var pc = event.target;
	console.log('[handleIceConnectionStateChange]', pc.iceConnectionState)
	if(pc.iceConnectionState == 'closed') {
		var match;
		for(var member in peerConnections) {
			if(peerConnections[member][0] === pc) {
				match = member;
				break;
			}
		}
		if($("#video"+match).hasClass("mainVideo")) {
			var lastRemote = $(".remoteVideo").last().attr('id');
			switchVideo(lastRemote);
		}
		$("#div"+match).remove();
		delete peerConnections[match];
	}
	if(pc.iceConnectionState == 'connected') {
		$("#audioMuteBtn").attr("value") !== "on" ?
			socket.emit("option", { type: 'mic', status: false, room_id: currentRoom }) : "";
	 	$("#videoMuteBtn").attr("value") !== "on" ?
			socket.emit("option", { type: 'video', status: false, room_id: currentRoom }) : "";
	}
};

function handleRemoteStream(event) {
	console.log("Add remote stream", event);
	for(var member in peerConnections) {
		if(peerConnections[member][0] === event.target) {
			break;
		}
	}
	console.log('handleRemoteStream [member]', member);
	var div = $('<div />', {
		class: 'remoteDiv',
		id: 'div' + member
	});
	div.appendTo($('#subArea'));

	var video = $('<video />', {
		class: 'remoteVideo',
		id: 'video' + member,
		src: window.URL.createObjectURL(event.stream),
		autoplay: true,
		onclick: 'switchVideo(this.id)'
	});
	video.appendTo($('#div' + member));

	var videoImg = $('<img />', {
		class: 'videoImg hidden',
		id: 'viImg' + member,
		src: '/images/no-video.png',
		onclick: 'switchVideo(this.id)'
	});
	videoImg.appendTo($('#div' + member));

	var micIcon = $('<img />', {
		class: 'micIcon hidden',
		id: 'micIcon' + member,
		src: '/images/remote-mic-off.png'
	});
	micIcon.appendTo($('#div' + member));

	// switch video position
	var countDiv = $(".remoteDiv").length;
	if(countDiv === 1) {
		switchVideo('video'+member);
	}
	// crop video if it from mobile
	var count = 0;
	var x = setInterval(function() {
		if($('#video'+member).hasClass('mobile') || count > 6) {
			clearInterval(x);
		}
		if($('#video'+member).width() < $('#video'+member).height()) {
			$('#video'+member).addClass('mobile');
		}
		count++;
	}, 1000)
};

function switchVideo(val) {
	var remoteId = val.slice(5); 
	var mainId = $('.mainVideo').attr('id').slice(5);
	var thisVideo = $('#video'+remoteId).attr('src');
	var isImgHide = $('#viImg'+remoteId).hasClass('hidden');
	var isIconHide = $('#micIcon'+remoteId).hasClass('hidden');
	var isMobile = $('#video'+remoteId).hasClass('mobile');
	$(".mainVideo").prop('muted', false);

	$('#div'+remoteId).attr('id', $('.mainDiv').attr('id'));
	$('.mainVideo').hasClass('mobile') ? $('#video'+remoteId).addClass('mobile') : $('#video'+remoteId).removeClass('mobile');
	$('#video'+remoteId).attr({ 
		'id': $('.mainVideo').attr('id'),
		'src': $('.mainVideo').attr('src') 
	});
	$('.mainImg').hasClass('hidden') ? $('#viImg'+remoteId).addClass('hidden') : $('#viImg'+remoteId).removeClass('hidden');
	$('#viImg'+remoteId).attr('id', $('.mainImg').attr('id'));
	$('.mainIcon').hasClass('hidden') ? $('#micIcon'+remoteId).addClass('hidden') : $('#micIcon'+remoteId).removeClass('hidden');
	$('#micIcon'+remoteId).attr('id', $('.mainIcon').attr('id'));

	//change remote video to main video
	$('.mainDiv').attr('id', 'div'+remoteId);
	$('.mainVideo').attr({
		'id': 'video'+remoteId,
		'src': thisVideo
	});
	isMobile ? $('.mainVideo').addClass('mobile') : $('.mainVideo').removeClass('mobile');
	$('.mainImg').attr('id', 'viImg'+remoteId);
	isImgHide ? $('.mainImg').addClass('hidden') : $('.mainImg').removeClass('hidden');
	$('.mainIcon').attr('id', 'micIcon'+remoteId);
	isIconHide ? $('.mainIcon').addClass('hidden') : $('.mainIcon').removeClass('hidden');

	$('#videoLocal').prop('muted', true);
	$('#videoLocal').attr('onclick', '');
	$('#viImgLocal').attr('onclick', '');
	videoLocal = document.getElementById('videoLocal');
};

//Chat text
var listEvent = [];
$('#textArea').on("click", "button.download", function(event) {
	var id = event.target.id;
	if(id!== undefined){
		var length = listEvent.length;
		for(var i = 0 ;i<length;i++){
			listEvent[i](id);
		}
	}
	$(this).children().removeClass('glyphicon-download-alt').addClass('glyphicon-refresh glyphicon-refresh-animate');
	this.disabled = true;
});

function setChannelEvents(channel) {
   channel.onopen = function() {
		 console.log('Data Channel is open');
   };
   channel.onerror = errorLog;
   channel.onmessage = function(event) {
	   	var data = JSON.parse(event.data);
	  	if(data.type === 'text'){
		 	textArea.innerHTML += "" +
			"<div class='wrap_messeage visitors'>" +
			   "<div class='avatar'>" +
				  "<img src='data:image/webp;base64," + data.avatar + "'/>" +
			   "</div>" +
			   "<div class='message'>" + data.message + "</div> " +
			"</div>";
		 	textArea.scrollTop = textArea.scrollHeight;
	  	} else if (data.type === "file") {
		  	var e = $("<div>").attr('class','wrap_messeage visitors');
		  	var avatar = $("<div class='avatar'>" +"<img src='data:image/webp;base64," + data.avatar + "'/>" +"</div>");
		  	var text = $("<div class='message'></div>");
		  	var button = $("<button class='download'><i class='glyphicon glyphicon-download-alt'></i>" + data.file_name + "</button>").attr('id', data.id);
		  	listEvent.push(function (id) {
			  	if(id === data.id){
				  	channel.send(JSON.stringify({
					 	type: 'get',
					 	id: data.id
				  	}));
			  	}
		  	});

		  	e.append(avatar);
		  	e.append(text);
		  	text.append(button);
		  	$('#textArea').append(e)
		  	listFileReceive.push({
				id: data.id,
				content: ''
		 	});
		 	textArea.scrollTop = textArea.scrollHeight;
	  	} else if (data.type === 'get') {
		 	var index = _.findIndex(listMyFile, {
				id: data.id
		 	});
		 	if(index!==-1){
				sendFile(listMyFile[index].file, channel, data.id);
			}
	  		} else if (data.type === "transfer") {
		  	var index = _.findIndex(listFileReceive, {
			 	id:data.id
		  	});
		  	console.log(listFileReceive);
		  	console.log(index);
		  	if(index !==-1){
			  	console.log('Receiveing!',data.id);
			  	console.log(data);
			  	listFileReceive[index].content += data.content;
			  	if(data.isLast === true){
				  	console.log('Save!');
				  	download("data:image/gif;base64," + listFileReceive[index].content,data.file_name);
				  	$("button#"+ data.id +">i").removeClass('glyphicon-refresh glyphicon-refresh-animate').addClass('glyphicon-download-alt');
				  	$("button#"+ data.id)[0].disabled = false;
				  	listFileReceive[index].content = '';
			  	}
		  	}
	  	}
   };
};

function hangup() {
	for(var member in peerConnections) {
		var pc = peerConnections[member][0];
		pc.close();
		delete peerConnections[member];
	}
	if(videoTrack) {videoTrack.stop();}
	if(audioTrack) {audioTrack.stop();}

	// //reset default values
	// localStream = null;
	// registeredCode = "";
	// textArea.innerHTML = null;
	// $("#videoMuteBtn").attr('value','on');
	// $("#videoImg").attr('src','/images/cam-on.png');
	// $("#audioMuteBtn").attr('value','on');
	// $("#audioImg").attr('src','/images/mic-on.png');

	// $('.mainDiv').attr('id', 'divLocal');
	// $('.mainVideo').attr({
	// 	'id': 'videoLocal',
	// 	'src': ''
	// });
	// $('.mainImg').attr('id', 'viImgLocal');
	// $('.mainImg').addClass('hidden');
	// $('.mainIcon').attr('id', 'micIconLocal');
	// $('.mainIcon').addClass('hidden');
	// $('.remoteDiv').remove();
	// videoLocal = document.getElementById('videoLocal');
	
	// displayPage(createPage, true);
	// displayPage(videoPage, false);

	// currentRoom = undefined;
	socket.disconnect();
	window.location = '/';
};
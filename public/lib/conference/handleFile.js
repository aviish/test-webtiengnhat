// read file to base64
function readFileToBase64(file, callback) {
    if (file) {
        var reader = new FileReader();
        reader.onload = function(readerEvt) {
            var binaryString = readerEvt.target.result;
            var base64 = btoa(binaryString);
            callback(base64);
        };
        reader.readAsBinaryString(file);
    }
};

// send chunk
function sendChunk (base64,channel, id, file) {
    var chunk = 10000;
    var data;
    console.log('sending!');
    if(base64.length >chunk){
        data = {
            type:'transfer',
            file_name: file.name,
            content: base64.slice(0, chunk),
            id: id,
            isLast: false
        }
        setTimeout(function () {
            sendChunk(base64.slice(data.content.length), channel, id, file);
        }, 0);
    }else {
        data = {
            type:'transfer',
            file_name: file.name,
            content: base64,
            id: id,
            isLast: true
        };
    }
    channel.send(JSON.stringify(data));
};

// send file
function sendFile(file, channel, id) {
    console.log('start send');
    readFileToBase64(file, function (base64) {
        sendChunk(base64, channel, id, file);
    });
}

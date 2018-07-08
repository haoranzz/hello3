var ip = '10.1.10.183';
var port = '3000';

function sendImageSocketIo(imgName, base64Img) {
	updateStatus('starting connection');
    var socket = io.connect('http://' + ip + ':' + port + '/');
    socket.on('connect', function() {
    	updateStatus('connection established');
    	socket.emit('original_image_name', imgName);
      	socket.emit('original_image', base64Img);
      	socket.on('got_image', function() {
      		updateStatus('start processing');
       	});
       	socket.on('processed_image', function(arrayBuffer) {
       		updateStatus('process finished');
        	socket.close();
        	updateStatus('connection closed');
        	var base64String = String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
        	window.processedImageGl = base64String;
        	//callback function
        	onProcessedImageReceived();
       	});
     });
}
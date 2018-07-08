// This state represents the state of our application and will be saved and
// restored by onResume() and onPause()
var appState = {
    takingPicture: true,
    imageUri: ""
};

var jspack = new JSPack(); 

var APP_STORAGE_KEY = "exampleAppState";
var FILE_HEAD_FORMAT = '128si'


var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        // Here we register our callbacks for the lifecycle events we care about
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('pause', this.onPause, false);
        document.addEventListener('resume', this.onResume, false);
    },
    onDeviceReady: function() {
        document.getElementById("take-picture-button").addEventListener("click", function() {
            // Because the camera plugin method launches an external Activity,
            // there is a chance that our application will be killed before the
            // success or failure callbacks are called. See onPause() and
            // onResume() where we save and restore our state to handle this case
            appState.takingPicture = true;
            alert("is clicking ");
            navigator.camera.getPicture(cameraSuccessCallback, cameraFailureCallback,
                {
                    sourceType: Camera.PictureSourceType.CAMERA,
                    destinationType: Camera.DestinationType.FILE_URI,
                    targetWidth: 250,
                    targetHeight: 250
                }
            );
        });

        document.getElementById("connect-to-socket").addEventListener("click", function() {  
            alert("is clicking ");
            imageUri = window.imageUriGl  
            alert(imageUri);
            if (imageUri) {
                processImageFile(imageUri);
                // fileSize = window.fileSizeGl
                // fileBinaryString = window.fileBinaryStringGl  
                // alert(imageUri+"+++" + fileSize + "+++"+fileBinaryString);
                // var header = contructFileHeader(imageUri, fileSize);
                // alert(header);
                // sendImageSocket(header, fileBinaryString);
            } else {
               alert('please take picture first...');
            }
        });
    },
    onPause: function() {
        // Here, we check to see if we are in the middle of taking a picture. If
        // so, we want to save our state so that we can properly retrieve the
        // plugin result in onResume(). We also save if we have already fetched
        // an image URI
        if(appState.takingPicture || appState.imageUri) {
            window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appState));
        }
    },
    onResume: function(event) {
        // Here we check for stored state and restore it if necessary. In your
        // application, it's up to you to keep track of where any pending plugin
        // results are coming from (i.e. what part of your code made the call)
        // and what arguments you provided to the plugin if relevant
        var storedState = window.localStorage.getItem(APP_STORAGE_KEY);

        if(storedState) {
            appState = JSON.parse(storedState);
        }

        // Check to see if we need to restore an image we took
        if(!appState.takingPicture && appState.imageUri) {
            document.getElementById("get-picture-result").src = appState.imageUri;
        }
        // Now we can check if there is a plugin result in the event object.
        // This requires cordova-android 5.1.0+
        else if(appState.takingPicture && event.pendingResult) {
            // Figure out whether or not the plugin call was successful and call
            // the relevant callback. For the camera plugin, "OK" means a
            // successful result and all other statuses mean error
            if(event.pendingResult.pluginStatus === "OK") {
                // The camera plugin places the same result in the resume object
                // as it passes to the success callback passed to getPicture(),
                // thus we can pass it to the same callback. Other plugins may
                // return something else. Consult the documentation for
                // whatever plugin you are using to learn how to interpret the
                // result field
                cameraSuccessCallback(event.pendingResult.result);
            } else {
                cameraFailureCallback(event.pendingResult.result);
            }
        }
    }
}

// Here are the callbacks we pass to getPicture()
function cameraSuccessCallback(imageUri) {
    appState.takingPicture = false;
    appState.imageUri = imageUri;
    // store imageUri to window for global use
    window.imageUriGl = imageUri;
    alert(appState.imageUri);
    //document.getElementById("get-picture-result").src = imageUri;
}

function cameraFailureCallback(error) {
    appState.takingPicture = false;
    console.log(error);
}


function sendImageSocketIo() {
    document.getElementById("connect_status").innerHTML = 'trying';
    var socket = io.connect('http://192.168.0.106:3000/');
    socket.on('connect', function() {
      socket.on('text', function(text) {
        document.getElementById("connect_status").innerHTML = text;
       });
      var base64Img = window.fileBinaryStringGl;
      socket.emit('image', base64Img);
     });
}




function sendImageSocket(fileHeader, fileBinaryString) {
    //client.js
    //var ws = new WebSocket('wss://echo.websocket.org/');
    var ws = new WebSocket('wss://192.168.0.106:3000/');

    //alert('connecting...')

    document.getElementById("connect_status").innerHTML = "connecting...";

    // event emmited when connected
    ws.onopen = function () {
        document.getElementById("connect_status").innerHTML = "connected";
        console.log('websocket is connected ...')
        // sending a send event to websocket server

        //document.getElementById("connect_status").innerHTML = "sending header...";
        //ws.send(fileHeader)

        document.getElementById("connect_status").innerHTML = "sending header...";
        ws.send(fileBinaryString)
    }

    ws.onerror = function(evt) {
        document.getElementById("connect_status").innerHTML = ws.readyState + ' ERROR:' + evt.type;
    }

    // event emmited when receiving message 
    ws.onmessage = function (ev) {
        document.getElementById("connect_status").innerHTML = 'MESSAGE:' + ev.data;

        var array = new Uint8Array(ev.data);
        window.fileBinaryStringGl = array;
        writeImageFile(imageUri);
        document.getElementById("get-picture-result").src = imageUri;
    }
}

function processImageFile(imageUri) {
    alert("processImageFile");
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);
    window.resolveLocalFileSystemURI(imageUri, gotFile, fail);
}

function onFileSystemSuccess(fileSystem) {
    console.log(fileSystem.name);
}

function fail(e) {
    console.log("FileSystem Error");
    alert("FileSystem Error");
    console.dir(e);
}

function gotFile(fileEntry) {
    alert("gotFile");
    fileEntry.file(function(file) {
        var reader = new FileReader();
        reader.onloadend = function(evt) {
            console.log("read success");
            document.getElementById("connect_status").innerHTML = 'IMG:' + evt.target.result;
    };
    reader.readAsDataURL(file);



        // var reader = new FileReader();
        // reader.onloadend = function(e) {
            
        //     window.fileBinaryStringGl = this.result;
        //     alert("Text is: "+ this.result);

        //     //process the file and trigger send to server function
        //     imageUri = window.imageUriGl  
        //     //var header = contructFileHeader(imageUri, this.result.length);
            
        //     sendImageSocketIo();

        //     // var pathArr = imageUri.split('/')
        //     // var imageName = pathArr[pathArr.length - 1]

        //     // // alert(pathArr);
        //     // // alert(imageName);
        //     // alert(imageUri.substring(0, imageUri.indexOf(imageName)));

        // }
        // reader.readAsDataURL(file);
    });
}

//----------------------------------------
function writeImageFile(imageUri) {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);
    window.resolveLocalFileSystemURI(imageUri, resolveSuccess, fail);
}

function resolveSuccess(fileEntry) {
    fileEntry.createWriter(gotFileWriter, fail);
}

function gotFileWriter(writer) {
    //alert("gotFileWriter...");
    writer.seek(0);
    var fileBinaryString = window.fileBinaryStringGl;
    //alert("+++++++++++++" + fileBinaryString);
    writer.write(fileBinaryString);
}
//----------------------------------

//contruct header that the server would understand
function contructFileHeader(imageUri, imageSize) {
    var pathArr = imageUri.split('/')
    var imageName = pathArr[pathArr.length - 1]
    var ret =  jspack.Pack(FILE_HEAD_FORMAT, [imageName, imageSize])
    alert("imageHead: "+ret)
    return ret
}

app.initialize();
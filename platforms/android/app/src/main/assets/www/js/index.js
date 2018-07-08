// This state represents the state of our application and will be saved and
// restored by onResume() and onPause()
var appState = {
    takingPicture: true,
    imageUri: ""
};

var APP_STORAGE_KEY = "exampleAppState";

// global value under window:
// originalImageNameGl, originalImageUriGl, originalImageGl
// processedImageNameGl, processedImageUriGl, processedImageGl

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
            appState.takingPicture = true;
            navigator.camera.getPicture(cameraSuccessCallback, cameraFailureCallback,
                {
                    sourceType: Camera.PictureSourceType.CAMERA,
                    destinationType: Camera.DestinationType.FILE_URI,
                    targetWidth: 400,
                    targetHeight: 400,
                    correctOrientation: true
                }
            );
        });

        document.getElementById("connect-to-socket").addEventListener("click", function() {  
            originalImageUri = window.originalImageUriGl;
            if (originalImageUri) {
                readOriginalImageFile();
            } else {
               alert('please take picture first...');
            }
        });
    },
    onPause: function() {
        if(appState.takingPicture || appState.imageUri) {
            window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appState));
        }
    },
    onResume: function(event) {
        var storedState = window.localStorage.getItem(APP_STORAGE_KEY);
        if(storedState) {
            appState = JSON.parse(storedState);
        }
        if(!appState.takingPicture && appState.imageUri) {
            document.getElementById("original-pic").src = appState.imageUri;
        }
        else if(appState.takingPicture && event.pendingResult) {
            if(event.pendingResult.pluginStatus === "OK") {
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
    window.originalImageUriGl = imageUri;
    document.getElementById("original-pic").src = imageUri;
}

function cameraFailureCallback(error) {
    appState.takingPicture = false;
    console.log(error);
}

function onOriginalImageRead() {
    originalImageUri = window.originalImageUriGl;
    originalImageName = getFileNameFromUri(originalImageUri);
    originalImage = window.originalImageGl;
    sendImageSocketIo(originalImageName, originalImage);
}

function onProcessedImageReceived() {
    processedImageUri = generateProcessedFileUri(window.originalImageUriGl);
    window.processedImageUriGl = processedImageUri;

    var folderpath = getFileParentDir(processedImageUri);
    var filename = getFileNameFromUri(processedImageUri);
    var data = window.processedImageGl;
    var dataType = 'image/jpg';

    savebase64AsImageFile(folderpath, filename, data, dataType);
}

function updateStatus(msg) {
    document.getElementById("connect-status").innerHTML = msg;
}


app.initialize();
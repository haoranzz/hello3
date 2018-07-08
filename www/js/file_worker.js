
//read file from file system
function readOriginalImageFile() {
    originalImageUri = window.originalImageUriGl
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);
    window.resolveLocalFileSystemURI(originalImageUri, gotFile, fail);
}

function gotFile(fileEntry) {
    fileEntry.file(function(file) {
        var reader = new FileReader();
        reader.onloadend = function(evt) {
            console.log("read success");
            updateStatus(window.originalImageUriGl + ' image read');
            window.originalImageGl = evt.target.result;
            //callback function
            onOriginalImageRead();
        };
        reader.readAsDataURL(file);
    });
}

// log when file system load succesfully
function onFileSystemSuccess(fileSystem) {
    console.log(fileSystem.name);
}


function onProcessedImageSaved() {
    updateStatus(window.processedImageUriGl + ' image written');
    document.getElementById("processed-pic").src = window.processedImageUriGl;
}

// alert file system error when error
function fail(e) {
    console.log("FileSystem Error");
    msg = "FileSystem Error";
    console.dir(e);
    switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'Storage quota exceeded';
            break;
        case FileError.NOT_FOUND_ERR:
            msg = 'File not found';
            break;
        case FileError.SECURITY_ERR:
            msg = 'Security error';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = 'Invalid modification';
            break;
        case FileError.INVALID_STATE_ERR:
            msg = 'Invalid state';
            break;
        default:
            msg = 'Unknown error';
            break;
    };
        alert(msg);
}


function getFileNameFromUri(fileUri) {
    var splitArr = fileUri.split('/');
    return splitArr[splitArr.length - 1]
}

function generateProcessedFileName(fileName) {
    return 'processed_' + fileName;
}

function getFileParentDir(fileUri) {
    var originalName = getFileNameFromUri(fileUri);
    var newUri = fileUri.replace(originalName, '');
    return newUri;
}

function generateProcessedFileUri(fileUri) {
    var originalName = getFileNameFromUri(fileUri);
    var processedName = generateProcessedFileName(originalName);
    var newUri = fileUri.replace(originalName, processedName);
    return newUri;
}

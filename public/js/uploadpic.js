// "use strict";
//
// function sendPic() {
    //var getImage=document.getElementById("PostImage").value;
    // var fileSelect = document.getElementById("uploadPic");
    // var file = fileSelect.files[0];
    // alert(file.fileName);
    // var form = document.getElementById("itemForm");
    // form.onsubmit = function(event) {
    //     event.preventDefault();
    //     var file = fileSelect.files;
    //     var formData = new FormData();
    //     // Check the file type.
    //     // if (!file.type.match('image.*')) {
    //     //     continue;
    //     // }
    //     formData.append("picture", file, file.name);
    //     // Set up the request.
    //     var xhr = new XMLHttpRequest();
    //     // Open the connection.
    //     xhr.open("POST", "/pictures", true);
    //     xhr.send(file);
    // }


    // var q = new XMLHttpRequest();
    // q.onreadystatechange = function(e) {
    //                if ( 4 == this.readyState ) {
    //                    console.log(['xhr upload complete', e]);
    //                }
    //            };
    // q.open("PUT", url, true);
    // // q.setRequestHeader("Content-Type","multipart/form-data");
    // q.send(file);
// }


var form = document.getElementById('file-form');
var fileSelect = document.getElementById('file-select');
var uploadButton = document.getElementById('upload-button');

form.onsubmit = function(event) {
  event.preventDefault();

  // Update button text.
  uploadButton.innerHTML = 'Uploading...';

  // The rest of the code will go here...

  // Get the selected files from the input.
var files = fileSelect.files;

var file = files[0];

  // Check the file type.
  // if (!file.type.match('image.*')) {
  //   continue;
  // }

  // Add the file to the request.
  formData.append('photos[]', file, file.name);
  // Set up the request.
var xhr = new XMLHttpRequest();
xhr.open('POST', '/success-item.html', true);

xhr.onload = function () {
  if (xhr.status === 200) {
    // File(s) uploaded.
    uploadButton.innerHTML = 'Upload';
  } else {
    alert('An error occurred!');
  }
};

// Send the Data.
xhr.send(formData);

}

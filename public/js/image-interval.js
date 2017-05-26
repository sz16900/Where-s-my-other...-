var imageId = 0;

function flipImage() {

  var image1 = document.getElementById("pic1");
  var image2 = document.getElementById("pic2");

  //flick depending on mod can be added for more pics in case of a longer conversation
  if(imageId %2 == 0){
    image1.style.display = 'block';
    image2.style.display = 'none';
  }
  else {
    image2.style.display = 'block';
    image1.style.display = 'none';
  }
  imageId = imageId + 1;
}

//call same function again for x ammount of seconds
setInterval(flipImage, 2000);

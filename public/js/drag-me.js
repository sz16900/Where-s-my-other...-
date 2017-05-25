function dragMe(body) {

function draggingStarts(e){
  image = e.target;
  // browser compability as shown in the tutorial
  coorX = e.offset === undefined ? e.layerX : e.offsetX;
  coorY = e.offset === undefined ? e.layerY : e.offsetY;
}

function draggingOver(e){
  e.preventDefault();
}

function draggingDrop(e){
  e.preventDefault();
  image.style.left = e.pageX - coorX + "px";
  image.style.top = e.pageY - coorY + "px";
}

body.addEventListener('dragstart', draggingStarts, false);
body.addEventListener('dragover', draggingOver, false);
body.addEventListener('drop', draggingDrop, false);

}

let video;
let poseNet;
let poses = [];

var HOST = location.origin.replace(/^http/, 'ws')
var DEVICE_INTERVAL = 100;
var ws;

var mainCanvas;
var croppedImage;
var imgCanvas;
var videoCanvas;
var headInside, eyesStraight;


function setup() {
  mainCanvas = createCanvas(720, 800);
  imgCanvas = createGraphics(300, 300);
  videoCanvas = createGraphics(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);

  imgCanvas.pixelDensity(1);
  headInside = false;
  eyesStraight = false;

  setupPosenet();
  setupWS();
}

function setupPosenet() {
  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', onPose);
  video.hide();
}

function setupWS() {
  ws = new WebSocket(HOST);  
  ws.onmessage = function(event) {
    var data = JSON.parse(event.data);
    console.log("got a message");
  };
  ws.onclose = function(event) {
    displayData = false;
    alert('Disconnected from server, please refresh and resubmit');
  };  
}

function cropImage(imgSrc, x, y, w, h) {
  videoCanvas.image(imgSrc, 0, 0);
  croppedImage = createImage(w, h);
  croppedImage.copy(videoCanvas, x, y, x+w, y+h, 0, 0, x+w, y+h);
  return croppedImage;
}

function makeObfuscatedImage() {
  croppedImage.resize(300, 300);
  croppedImage.loadPixels();
  for (let i = 0; i < 300 * 300 * 4; i += 4) {
    croppedImage.pixels[i    ] = croppedImage.pixels[i    ] + 100 * (-1 + 2 * random());
    croppedImage.pixels[i + 1] = croppedImage.pixels[i + 1] + 100 * (-1 + 2 * random());
    croppedImage.pixels[i + 2] = croppedImage.pixels[i + 2] + 100 * (-1 + 2 * random());
  }
  croppedImage.updatePixels();
  imgCanvas.image(croppedImage, 0, 0);
}

function sendWS() {
  var wsMsg = {'imageData': str(imgCanvas.elt.toDataURL())};
  ws.send(JSON.stringify(wsMsg));
}

function updatePoses() {
  for (var p=0; p<poses.length; p++) {
    let pose = poses[0].pose;
    
    let eyeL = pose.keypoints[1].position;
    let eyeR = pose.keypoints[2].position;
    let eyeM = 0.5 * (eyeL.y + eyeR.y);
    let eye1x = min(eyeL.x, eyeR.x);
    let eye2x = max(eyeL.x, eyeR.x);
    let eyeDistY = abs(eyeL.y - eyeR.y);

    headInside = (
      eye1x > 0.28 * video.width && eye1x < 0.72 * video.width && 
      eye2x > 0.28 * video.width && eye2x < 0.72 * video.width && 
      eyeL.y > 0.22 * video.height && eyeL.y < 0.78 * video.height &&
      eyeL.y > 0.22 * video.height && eyeL.y < 0.78 * video.height
    );

    eyesStraight = eyeDistY < 10;

    if (headInside && eyesStraight) {
      let eyeDist = eye2x - eye1x;
      let distMult = 1.5;
      let distMultY = (1.0 + distMult * 2) / 2.0;
      let x1 = eye1x - distMult * eyeDist;
      let x2 = eye2x + distMult * eyeDist;
      let y1 = eyeM - distMultY * eyeDist;
      let y2 = eyeM + distMultY * eyeDist;
      var img2 = cropImage(video, x1, y1, x2-x1, y2-y1);  
    }
  }
}


function draw() {

  background(0);

  push();
  translate(40, 40);
  fill(255);
  noStroke();
  image(video, 0, 0);
  noFill();
  strokeWeight(4);
  if (headInside) { 
    stroke(0, 255, 0);
  } else {
    stroke(255, 0, 0);
  }
  ellipse(video.width/2, video.height/2, video.width * 0.5, video.width * 0.6);

  var msg = "Perfect!";
  if (!headInside && !eyesStraight) {
    msg = "Please place your face inside the circle\nand untilt your face (keep your eyes straight).";
  } else if (!headInside) {
    msg = "Please place your face inside the circle.";
  } else if (!eyesStraight) {
    msg = "Please untilt your face (keep eyes level).";
  }
  
  fill(255);
  noStroke();
  textAlign(CENTER);
  textSize(22);
  text(msg, video.width/2, video.height-25);
  pop();

  if (imgCanvas){
    //image(imgCanvas, 400, 0)
  }


}

function keyPressed() {
  console.log("keypress");
  if (key==' '){
    makeObfuscatedImage();
    sendWS();
  }
}

function modelReady() {
  select('#status').html('Model Loaded');
}

function onPose(results) {
  poses = results;
  if (poses.length == 0) {
    headInside = false;
    eyesStraight = false;
  } else {
    updatePoses();
  }
}

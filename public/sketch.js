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
var ww, wh, vw, vh;
var cx1, cx2, cy1, cy2;

let IW = 240;
let IH = 240;
let cw = 0.58;
let ch = 0.55;
var margin = 500;
var frameInterval = 8;

var debugString = "nothing here";


function setup() {
  frameRate(8);

  ww = windowWidth;
  wh = windowHeight;

  mainCanvas = createCanvas(ww, wh);
  imgCanvas = createGraphics(IW, IH);
//  videoCanvas = createGraphics(640, 480);
  video = createCapture(VIDEO);
  //video.size(640, 480);

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

function cropImage() {
  try {
    if (cx1==cx2 || cy1 == cy2) {
      return false;
    }
    debugString = "crop "+str(floor(cx1))+", "+str(floor(cy1))+", "+str(floor(cx2-cx1))+", "+str(floor(cy2-cy1))+" from: "+str(video.width)+", "+str(video.height)+".";
    videoCanvas = createGraphics(video.width, video.height);
    videoCanvas.image(video, 0, 0);
    croppedImage = createImage(cx2-cx1, cy2-cy1);
    croppedImage.copy(videoCanvas, cx1, cy1, cx2, cy2, 0, 0, cx2, cy2);
    return true;
  }
  catch(err) {
    return false;
  }
}

function makeObfuscatedImage() {
  if (!croppedImage) {
    return false;
  }
  croppedImage.resize(IW, IH);
  croppedImage.loadPixels();
  for (let i = 0; i < IW * IH * 4; i += 4) {
    croppedImage.pixels[i    ] = croppedImage.pixels[i    ] + margin * (-1 + 2 * random());
    croppedImage.pixels[i + 1] = croppedImage.pixels[i + 1] + margin * (-1 + 2 * random());
    croppedImage.pixels[i + 2] = croppedImage.pixels[i + 2] + margin * (-1 + 2 * random());
  }
  croppedImage.updatePixels();
  imgCanvas.image(croppedImage, 0, 0);
  return true;
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
      eye1x > (0.5 - cw/2 + 0.02) * video.width && eye1x < (0.5 + cw/2 - 0.02) * video.width && 
      eye2x > (0.5 - cw/2 + 0.02) * video.width && eye2x < (0.5 + cw/2 - 0.02) * video.width && 
      eyeL.y > (0.5 - cw/2 + 0.06) * video.height && eyeL.y < (0.5 + ch/2 - 0.06) * video.height &&
      eyeL.y > (0.5 - cw/2 + 0.06) * video.height && eyeL.y < (0.5 + ch/2 - 0.06) * video.height
    );

    eyesStraight = eyeDistY < 10;

    if (headInside && eyesStraight) {
      let eyeDist = eye2x - eye1x;
      let distMult = 1.5;
      let distMultY = (1.0 + distMult * 2) / 2.0;
      
      cx1 = eye1x - distMult * eyeDist;
      cx2 = eye2x + distMult * eyeDist;
      cy1 = eyeM - distMultY * eyeDist;
      cy2 = eyeM + distMultY * eyeDist;

      cx1 = constrain(cx1, 0, video.width-1);
      cx2 = constrain(cx2, 0, video.width-1);
      cy1 = constrain(cy1, 0, video.height-1);
      cy2 = constrain(cy2, 0, video.height-1);
    }
  }
}

function draw() {

  vw = min(640, ww);
  vh = int(vw / (video.width/video.height));

  background(0);
  push();
  translate(0, 0);
  fill(255);
  noStroke();
  image(video, 0, 0, vw, vh);
  noFill();
  strokeWeight(4);
  if (headInside) { 
    stroke(0, 255, 0);
  } else {
    stroke(255, 0, 0);
  }
  ellipse(vw/2, vh/2, vw * cw, vh * ch);

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
  text(msg, vw/2, vh-24);
  //text(debugString, vw/2, vh);
  pop();

  if (imgCanvas) {
    push();
    translate(0, vh + 10);
    image(imgCanvas, 0, 0);
    pop();
  }

  if (imgCanvas && frameCount % frameInterval == 0){
    runCrop();
  }
}

function runCrop() {
  var success1 = cropImage();//video, x1, y1, x2-x1, y2-y1);  
  if (success1) {
    var success2 = makeObfuscatedImage();    
    if (success2){
      sendWS();
    }
  }
}

function mousePressed() {
  runCrop();
}

function keyPressed() {
  if (key==' '){
    runCrop();
  }
}

function modelReady() {
  select('#status').html('');
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

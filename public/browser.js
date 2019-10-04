var xAxis, yAxis, zAxis;
var HOST = location.origin.replace(/^http/, 'ws')
var DEVICE_INTERVAL = 100;

function handleOrientation(event) {
  xAxis = Number.parseFloat(event.beta);  // [-180,180]
  yAxis = Number.parseFloat(event.gamma); // [-90,90]
  zAxis = Number.parseFloat(event.alpha) || 0; // [0,360]
}
window.addEventListener('deviceorientation', handleOrientation);

window.addEventListener('load', function() {
  var form = document.getElementById("configForm");
  var xAxisLabel = document.getElementById("xAxis");
  var yAxisLabel = document.getElementById("yAxis");
  var zAxisLabel = document.getElementById("zAxis");

  form.addEventListener("submit", function(event) {
    event.preventDefault();
    var ws = new WebSocket(HOST);
    var inputs = form.elements;
    var username = inputs['name'].value;
    var displayData = true;

    for (var i = 0; i < inputs.length; i++) {
      inputs[i].setAttribute('disabled', '');
    };

    setInterval(function() {
      var wsMsg = {
        'id': username,
        'deviceData': {
          'x': xAxis,
          'y': yAxis,
          'z': zAxis
        }
      };
      //ctx.elt.toDataURL();

      if (displayData) {
        xAxisLabel.textContent = xAxis.toFixed(2);
        yAxisLabel.textContent = yAxis.toFixed(2);
        zAxisLabel.textContent = zAxis.toFixed(2);
      }

      ws.send(JSON.stringify(wsMsg));
    
    }, DEVICE_INTERVAL);

    ws.onmessage = function(event) {
      var data = JSON.parse(event.data);
      console.log(data);
    };

    ws.onclose = function(event) {
      displayData = false;
      alert('Disconnected from server, please refresh and resubmit');
    };
  });
});

// requirements
'use strict';
const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');
const uuid = require('uuid');

// setup server
const PORT = process.env.PORT || 5000;
const USERS_INTERVAL = process.env.USERS_INTERVAL || 200;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use(express.static(path.join(__dirname, 'public')))
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });


const idMap = {};
var store = { users: {} };
var aggregatorID = -1;

wss.on('connection', (ws) => {
  ws.id = uuid.v4();
  idMap[ws.id] = ws;

  console.log('Client connected: ' + ws.id);
  console.log('Total clients connected: ', wss.clients.length);

  ws.on('close', () => {
    console.log('Client disconnected: ' + ws.id);
    console.log('Total clients connected: ', wss.clients.length);
    delete idMap[ws.id];
  });

  ws.on('message', (wsMsg) => {
    try {
      console.log("RECEIVED A MSG from ", ws.id);
      var msgJSON = JSON.parse(wsMsg);

      if ("aggregatorID" in msgJSON) {
        aggregatorID = ws.id;
      }

      else if ("imageData" in msgJSON) {
        var newMsg = { 
          name: msgJSON.id, 
          imageData: msgJSON.imageData 
        };

        if (aggregatorID != -1) {
          console.log("LETS SEND TO AGGREGATOR")
          let dest = idMap[aggregatorID];
          if (dest) {
            dest.send(JSON.stringify(newMsg));
          }
        }

        

      }

      /*
      var msgJSON = JSON.parse(wsMsg);
      store.users[msgJSON.id] = { 
        deviceData: msgJSON.deviceData, 
        name: msgJSON.id, 
        imageData: msgJSON.imageData 
      };
      */

      //var imageData = msgJSON.imageData;

      console.log("received " );

      wss.clients.forEach((client) => {
        //client.send(JSON.stringify({"myMessage": "hi from thee server", "other": 5}));
        //client.send("hi from thee server");
        //console.log(client)
      });


      /*
      console.log("now send ");
      wss.clients.forEach((client) => {
        client.send(JSON.stringify({"myMessage": "hi from thee server", "other": 5}));
        client.send("hi from thee server");
      });
      */


    } catch(e) {
      console.log("Unexpected message: ");
      console.log(e)
      console.log(e.stack)
    }
  });
});





setInterval(() => {
  
  if (Object.keys(store.users).length) {
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(store));
    });
  }

  store.users = {};

}, USERS_INTERVAL);

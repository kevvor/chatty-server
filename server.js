// server.js

const express = require('express');
const SocketServer = require('ws').Server;
const uuidv4 = require('uuid/v4');
const randomColor = require('randomcolor');

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.

wss.broadcast = (data) => {
  wss.clients.forEach(function (client) {
      const stringyMsg = JSON.stringify(data)
      client.send(stringyMsg);
  });
};

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    const parsedMsgs = JSON.parse(message)

    switch(parsedMsgs.type) {
      case 'postNotification':
        parsedMsgs.type = 'incomingNotification'
        break;
      case 'postMessage':
        if (!parsedMsgs.color) {
          parsedMsgs.color = randomColor();
        }
        parsedMsgs.type = 'incomingMessage'
        parsedMsgs.id = uuidv4();
        break;
    }
    console.log(parsedMsgs)
    wss.broadcast(parsedMsgs)
  });

  wss.clients.forEach(function (client) {
    const numClients = {
      type: 'numConnections',
      number: wss.clients.size
    }
    client.send(JSON.stringify(numClients));
  })

  // ws.send('something');
  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    wss.clients.forEach(function (client) {
      const numClients = {
        type: 'numConnections',
        number: wss.clients.size
      }
    client.send(JSON.stringify(numClients));
    })
  })
});






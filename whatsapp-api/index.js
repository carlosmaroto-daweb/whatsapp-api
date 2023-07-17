require('dotenv').config();
const mongoose = require('mongoose');
const { MongoStore } = require('wwebjs-mongo');
const { Client, RemoteAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require("fs");

var chats;
var messages = [];

app.use(express.static('public'));

server.listen(3000, function(){
  console.log("Servidor corriendo en http://whatsapp-api:3000");
});

io.on('connection', function(socketClient){
  console.log("Alguien se ha conectado con Sockets");
  /*
  socket.emit('messages', messages);

  socket.on('new-message', function(data){
    messages.push(data);

    io.sockets.emit('messages', messages);
  });
  */
  const MONGODB_URI = process.env.MONGODB_URI;

  mongoose.connect(MONGODB_URI).then(() => {
    console.log("Data Base: Connected");
    const store = new MongoStore({ mongoose: mongoose });
    const client = new Client({
      authStrategy: new RemoteAuth({
        store: store,
        backupSyncIntervalMs: 300000
      }),
      restartOnAuthFail: true,
      qrTimeoutMs: 0,
      authTimeoutMs: 0,
      takeoverOnConflict: true,
      puppeteer: {
        headless: true,
        args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--unhandled-rejections=strict'
        ],
      }
    });
    client.initialize();
    console.log("Cliente inicializado");

    client.on('qr', (qr) => {
      QRCode.toFile('./img/qr.png', qr, { errorCorrectionLevel: 'H' }, 
      function(err) {
        if(err) throw err;
        console.log('QR code generate');
        const img = fs.readFileSync("./img/qr.png", "base64");
        socketClient.emit('qr', img);
      });
    });
    
    client.on('ready', async() => {
      console.log('Client is ready!');
      socketClient.emit('chat-reload');
      chats = await client.getChats();
      await new Promise(resolve => setTimeout(resolve, 20000));
      for (let i=0; i<chats.length; i++) {
        messages[i] = await chats[i].fetchMessages({limit: Number.MAX_VALUE});
      }
      await socketClient.emit('save-messages', messages);
      await socketClient.emit('show-chats', chats);
      socketClient.emit('client-ready');
    });

    client.on('remote_session_saved', () => {
      console.log('Session is saved!');
    });
    
    client.on('message', (message) => {
      console.log(message)
      if(message.body === 'info') {
        let text = 'Hola! Soy el asistente virtual de Academia Cartabón, ahora mismo estamos en mantenimiento, conctactanos más tarde.';
        client.sendMessage(message.from, text);
      }
    });
  });
});
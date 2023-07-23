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
var contactsImage = [];
var msgMedia = [];

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
    
    client.on('ready', () => {
      console.log('Client is ready!');
      socketClient.emit('chat-reload');
      client.getChats()
      .then(allChats => setMsg(allChats))
      .then(() => getClientImage())
      .then(clientImage => socketClient.emit('save-client-image', clientImage))
      .then(() => setContactsImage())
      .then(() => socketClient.emit('save-contacts-image', contactsImage))
      .then(() => setMsgMedia())
      .then(() => socketClient.emit('save-msg-media', msgMedia))
      .then(() => socketClient.emit('save-messages', messages))
      .then(() => socketClient.emit('show-chats', chats))
      .then(() => socketClient.emit('client-ready'));
    });

    async function setMsg(allChats) {
      console.log('Msg is saving...');
      chats = allChats;
      for (let i=0; i<chats.length; i++) {
        messages[i] = await chats[i].fetchMessages({limit: Number.MAX_SAFE_INTEGER});
      }
    }

    async function getClientImage() {
      console.log('Client image is saving...');
      let user = client.info.wid.user;
      let contacts = await client.getContacts();
      let currentClient = null;
      for (let i=0; i<contacts.length && currentClient == null; i++) {
        if(contacts[i].id.user == user) {
          currentClient = contacts[i];
        }
      }
      let clientImage = null;
      if(currentClient != null) {
        clientImage = await currentClient.getProfilePicUrl();
      }
      return clientImage;
    }

    async function setContactsImage() {
      console.log('Contacts images is saving...');
      let contact;
      for (let i=0; i<chats.length; i++) {
        contact = await chats[i].getContact();
        contactsImage[i] = await contact.getProfilePicUrl();
      }
    }

    async function setMsgMedia() {
      console.log('Msg media is saving...');
      let media;
      for (let i=0; i<messages.length; i++) {
        for (let j=0; j<messages[i].length; j++) {
          if(messages[i][j].hasMedia) {
            media = await messages[i][j].downloadMedia();
            if(media.data) {
              msgMedia.push({id: messages[i][j].id.id, data: media.data});
            }
          }
        }
      }
    }

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
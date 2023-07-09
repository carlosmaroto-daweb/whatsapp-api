require('dotenv').config();
const mongoose = require('mongoose');
const { MongoStore } = require('wwebjs-mongo');
const { Client, RemoteAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');

const MONGODB_URI = 'mongodb://'+process.env.BD_USER+':'+process.env.BD_PASSWORD+'@mongoDB:27017/';

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
      console.log('QR code saved!');
    });
  });
  
  client.on('ready', () => {
    console.log('Client is ready!');
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



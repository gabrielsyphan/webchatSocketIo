const express = require('express')

// https://expressjs.com/en/4x/api.html 
const app = express()
app.use(express.static("public"))

// https://nodejs.org/api/http.html
const http = require('http').Server(app)

const serverSocket = require('socket.io')(http)

const porta = process.env.PORT || 8000

const host = process.env.HEROKU_APP_NAME ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com` : "http://localhost"

http.listen(porta, () => {
    const portaStr = porta === 80 ? '' :  ':' + porta
    if (process.env.HEROKU_APP_NAME)
        console.log('Servidor iniciado. Abra o navegador em ' + host)
    else console.log('Servidor iniciado. Abra o navegador em ' + host + portaStr)
})

app.get('/', (requisicao, resposta) => resposta.sendFile(__dirname + '/index.html'))

serverSocket.on('connect', recebeConexaoUsuario)

function recebeConexaoUsuario(socket) {
    socket.on('login', (nickname) => registraLoginUsuario(socket, nickname))
    socket.on('disconnect', () => serverSocket.emit('user disconnect', socket.nickname + ' desconectou'))
    socket.on('chat msg', (data) => encaminhaMsgsUsuarios(socket, data))
    socket.on('status', (msg) => encaminhaMsgStatus(socket, msg))
    socket.on('geolocation', (data) => encaminhaMsgGeolocation(socket, data))
}

function encaminhaMsgGeolocation(socket, data) {
    serverSocket.emit('geolocation', {user: socket.nickname, latitude: data.latitude, longitude: data.longitude})
}

function encaminhaMsgStatus(socket, msg) {
    socket.broadcast.emit('status', msg)
}

function encaminhaMsgsUsuarios(socket, data) {
    serverSocket.emit('chat msg', {user: socket.nickname, date: data.date, msg: data.msg})
}

function registraLoginUsuario(socket, nickname) {
    socket.nickname = nickname
    const msg = nickname + ' conectou'
    console.log(msg)
    serverSocket.emit('new user', msg)
//     socket.broadcast.emit('new user', msg)
}

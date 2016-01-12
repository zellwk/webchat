// const chalk = require('chalk')
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const mongoose = require('mongoose')
const socketioJwt = require('socketio-jwt')
const md = require('markdown').markdown
const db = mongoose.connection

const Message = require('./collections/message')
// const Room = require('./collections/room')
const User = require('./collections/user')

const DB_URL = process.env.DB_URL
mongoose.connect(DB_URL)

db.on('error', console.error.bind(console, 'connection error:'))
db.on('open', (cb) => {
  console.log('Database connected')
})

app.use(express.static('public'))

// enable auth0 log in from anywhere
io.set('origins', '*domain.com*:*')
io.use(socketioJwt.authorize({
  secret: Buffer(process.env.SOCKET_SECRET, 'base64'),
  handshake: true
}))

io.on('connection', function (socket) {
  console.log('user connected')

  socket.on('get user', function (username) {
    User.findOne({
      username: username
    }, (err, user) => {
      if (err) return socket.emit('get user', err, null)
      if (!user) {
        return socket.emit('get user', {
          message: 'No such user'
        }, null)
      }

      socket.emit('get user', err, {
        username: user.username,
        rooms: user.rooms
      })
    })
  })

  socket.on('create user', req => {
    var user = new User({
      username: req.username,
      rooms: req.rooms || []
    })

    user.save()
      .then(data => {
        socket.emit('create user', null, 'User created')
      })
      .catch(err => {
        socket.emit('create user', err, null)
      })
  })

  socket.on('join room', function (data) {
    if (!data.user) {
      return socket.emit('join room', 'Join room requires user', null)
    }
    if (!data.room) {
      return socket.emit('join room', 'no specified room to join', null)
    }

    User.update({
      username: data.user
    }, {
      $addToSet: {
        rooms: data.room
      }
    }, (err, data) => {
      if (err) return socket.emit('join room', err, null)
    })

    socket.join(data.room, function (err) {
      socket.emit('join room', err, `Joined ${data.room}`)
    })
  })

  socket.on('leave room', function (data) {
    console.log('leaving room')
    if (!data.user) {
      return socket.emit('leave room', 'leave room requires user', null)
    }
    if (!data.room) {
      return socket.emit('leave room', 'no specified room to leave', null)
    }

    User.update({
      username: data.user
    }, {
      $pull: {
        rooms: data.room
      }
    }, (err, data) => {
      if (err) return socket.emit('leave room', err, null)
    })

    socket.leave(data.room, function (err) {
      socket.emit('leave room', err, `Left ${data.room}`)
    })
  })

  // Note: Broadcasts to everyone in the room except for self.
  socket.on('message room', function (data) {
    socket.to(data.room).emit('message room', {
      message: data.message
    })
  })

  // send chat log on new user connection
  Message.model('Message').find(function (err, messages) {
    if (err) return console.error(err)
    socket.emit('chat log', messages)
  })

  socket.on('chat message', function (msg) {
    msg.message = md.toHTML(msg.message)
    const message = new Message(msg)
    message.save(function (err) {
      if (err) return console.error(err)
    })
    // console.log(`Message: ${msg.message}`)
    io.emit('chat message', msg)
  })

  socket.on('typing', function (input) {
    io.emit('typing', input)
    // console.log(input)
  })

  socket.on('disconnect', function () {
    console.log('User disconnected.')
  })
})

const PORT = process.env.PORT || 3000
http.listen(PORT, function () {
  console.log(`Listening to http://localhost:${PORT}`)
})

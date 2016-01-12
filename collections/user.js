const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: String,
  rooms: Array
})

const User = mongoose.model('User', userSchema)

module.exports = User

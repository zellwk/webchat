const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: String,
  messages: [
    {
      sender: String,
      message: String,
      date: Date,
    }
  ]

});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;

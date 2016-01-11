const mongoose = require('mongoose');

const Message = mongoose.model('Message', {
  'username': String,
  'message': String,
  'timestamp': Object
});

module.exports = Message;
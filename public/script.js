/* globals $ Auth0Lock io */
// Login
document.querySelector('#login').addEventListener('click', function () {
  var lock = new Auth0Lock(
    'uCxiKiGA49tLe3f9iXNsBp2XdzvBzImZ',
    'zellwk.auth0.com'
  )
  lock.show(function (err, profile, token) {
    if (err) {
      console.error('Something went wrong: ', err)
    } else {
      window.localStorage.setItem('userToken', token)
      window.localStorage.setItem('profile', JSON.stringify(profile))
      startChat()
    }
  })
})

// Logout
document.querySelector('#logout').addEventListener('click', function () {
  window.localStorage.removeItem('userToken')
  window.localStorage.removeItem('profile')
  window.location.reload()
})

if (isLoggedIn()) {
  startChat()
} else {
  toggleLogin(true)
}

function startChat () {
  toggleLogin(false)

  // var socket = io.connect('http://ga-webchat.herokuapp.com/', {
  //   'query': 'token=' + window.localStorage.getItem('userToken')
  // })

  var socket = io.connect(window.location.origin, {
    'query': 'token=' + window.localStorage.getItem('userToken')
  })
  var profile = JSON.parse(window.localStorage.getItem('profile'))
  var username = profile.nickname
  var msg = document.querySelector('#msg')

  if (!username) {
    var ran = Math.floor((Math.random() * 999) + 100)
    username = 'user' + ran
  }

  document.querySelector('#username').textContent = username

  var btn = document.querySelector('#btn')
  btn.addEventListener('click', sendMessageToServer, false)

  msg.addEventListener('keydown', sendMessageToServer, false)

  socket.on('chat message', function (message) {
    addMessageToList(message)
    $('.typingNotification').remove()
    clearTimeout(timeout)
    timeout = setTimeout(timeoutFunction, 0)
  })

  socket.on('chat log', function (messages) {
    messages.forEach(addMessageToList)
  })

  // NEW FEATURE: TYPING NOTIFICATION
  var timeout
  var typing = false

  $('#msg').keypress(function (e) {
    if (e.keyCode !== 13) {
      if (typing === false) {
        typing = true
        socket.emit('typing', {
          'isTyping': true,
          'username': username
        })

        clearTimeout(timeout)
        timeout = setTimeout(timeoutFunction, 5000)
      } else {}
    }
  })

  socket.on('typing', function (data) {
    if (data.isTyping) {
      addTypingNotification(data.username)
    } else {
      removeTypingAlert()
    }
  })

  function sendMessageToServer (event) {
    if (event.type === 'keydown' && event.keyCode !== 13) return
    if (msg.value === '') return
    var timestamp = new Date()
    var message = {
      username: username,
      message: msg.value,
      timestamp: timestamp.toISOString()
    }
    socket.emit('chat message', message)
    msg.value = ''
  }

  function timeoutFunction () {
    typing = false
    socket.emit('typing', {
      'isTyping': false,
      'username': ''
    })
    socket.emit('isTyping', {'isTyping': false, 'username': ''})
    removeTypingAlert()
    var pageHeader = document.querySelector('#pageHeader')
    pageHeader.textContent = 'Web Chat 1.0'
  }
}

function isLoggedIn () {
  return window.localStorage.getItem('userToken')
}

function toggleLogin (showLogin) {
  if (showLogin) {
    document.querySelector('#login').removeAttribute('hidden')
    document.querySelector('#logout').setAttribute('hidden', 'hidden')
  } else {
    document.querySelector('#login').setAttribute('hidden', 'hidden')
    document.querySelector('#logout').removeAttribute('hidden')
  }
}

function getElapsedTime (timestamp) {
  var ms = Date.now() - timestamp.getTime()
  var min = ms / 60000
  var time = ''
  if (min > 1439) {
    time = `${Math.round(min / 1440)}d`
  } else if (min > 59) {
    time = `${Math.round(min / 60)}h`
  } else if (min >= 1) {
    time = `${Math.round(min)}m`
  } else if (min > 0) {
    var sec = Math.round(min * 60)
    if (sec === 0) time = 'just now'
    else time = `${sec}s`
  }
  return time
}

function addMessageToList (message) {
  var chat = document.querySelector('.chat')
  var section = document.createElement('section')

  var timestamp = new Date(message.timestamp)
  var time = getElapsedTime(timestamp)

  section.innerHTML = `
    <p>${message.username}</p>
    <div>${message.message}</div>
    <p class="timestamp">${time}</p>`

  chat.appendChild(section)
  section.scrollIntoView()
}

function addTypingNotification (name) {
  var chat = document.querySelector('.chat')
  var section = document.createElement('section')
  section.innerHTML = `<p class="typingNotification">${name} is typing...</p>`
  chat.appendChild(section)
  section.scrollIntoView()

  var pageHeader = document.querySelector('#pageHeader')
  pageHeader.textContent = `${name} is typing...`
}

function removeTypingAlert () {
  $('.typingNotification').remove()
  var pageHeader = document.querySelector('#pageHeader')
  pageHeader.textContent = 'Web Chat 1.0'
}

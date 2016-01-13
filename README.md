## Login to Chatapp:
- Auth0 ID: uCxiKiGA49tLe3f9iXNsBp2XdzvBzImZ
- Auth0 domain: zellwk.auth0.com

Once you get the Auth0 token, use your token to connect to the chat server

```
lock.show(function (err, profile, token) {
  if (err) return console.error('Something went wrong: ', err)
  
  // Connect to chat server here
})
```

Note: Make sure you are on localhost:3000 or localhost:4000 if you are testing your app locally.

## Connecting to chat server

URL to connect to chat server: http://ga-webchat.herokuapp.com/. 

The chat server will emit a `connected` event when you have successfully connected to it. 

```
var socket = io.connect('http://ga-webchat.herokuapp.com/', {
  'query': 'token=' + token
})
```

## Level 1: Get this working first

### Receiving messages 

- `socket.on('chat log')` – retrieves a list of message objects
- `socket.on('chat message')` – receives a message object
- `socket.on('typing')` – receives an object if user is typing

### Sending messages 

- `socket.emit('chat message', message)` – Sends message to server
- `socket.emit('typing', message)` – Sends typing object to server

## Level 2: Users and Chatrooms

### Users 

#### `socket.emit('get user', username)`

Checks if a user is already stored in the database. 

**Arguments** 

- username: username `<String>` 

**Returns**

```
(err, res)
```

- err: Error message 
- res `<Object>`
  + username: username `<String>`
  + rooms: rooms user has joined `<Array>`

#### `socket.emit('create user', req)`

Creates a user and stores it in the database.

**Arguments** 

- req `<Object>`
  + username: User's username `<String>`
  + rooms: rooms user has joined `<Array>`

**Returns**

```
(err, message)
```

- err 
- message `<string>`

### Rooms

#### `socket.emit('join room', req)`

Joins a room

**Arguments**

- req `<Object>`
  + user: Username `<String>`
  + room: Room to join `<String>`

**Returns**

```
(err, message)
```

- err 
- message `<string>`

#### `socket.emit('leave room', req)`

Leaves a room

**Arguments**

- req `<Object>`
  + user: Username `<String>`
  + room: Room to leave `<String>`

**Returns**

```
(err, message)
```

- err 
- message `<string>`

#### `socket.emit('message room', req)`

Message participants within a room

**Arguments**

- req `<Object>`
  + sender: Username of sender `<String>`
  + message: Message by sender `<String>`
  + room: Name of room `<String>`

**Returns**

```
(err, message)
```

- err 
- message `<Object>`
  + sender: Username of sender `<String>`
  + message: Message by sender `<String>`
  + time: Timestamp `<String>`

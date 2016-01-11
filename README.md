### Login to Chatapp:
Auth0 ID: uCxiKiGA49tLe3f9iXNsBp2XdzvBzImZ
Auth0 domain: zellwk.auth0.com

Note: Make sure you are on localhost:3000 or localhost:4000 if you are testing your app locally.

### Connecting to chat server

URL to connect to chat server: http://ga-webchat.herokuapp.com/

### Receiving messages 

- Socket.on('chat log') – retrieves a list of message objects
- Socket.on('chat message') – receives a message object
- Socket.on('typing') – receives an object if user is typing

### Sending messages 

- socket.emit('chat message', message) – Sends message to server
- socket.emit('typing', message) – Sends typing object to server
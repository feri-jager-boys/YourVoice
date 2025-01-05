
// Store posts and client connections
const posts = {}; // type: { postId: { clientId: WebSocket } }

function configWSServer(wsServer) {

  wsServer.on('connection', (socket, request) => {
    const clientId = request.headers['sec-websocket-key'];
    console.log(`WebSocket client connected: ${clientId}`);
  
    socket.on('message', (message) => handleWSMessage(socket, clientId, message));
    socket.on('close', () => handleWSClose(clientId));
  });
}

function handleWSMessage (socket, clientId, message) {
  try {
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.type === "client_connected") {
      addClientToPosts(socket, clientId, parsedMessage);
      broadcastNumberOfViewers(parsedMessage);
    } else if (parsedMessage.type === "client_close") {
      removeClientFromPosts(clientId, parsedMessage);
      broadcastNumberOfViewers(parsedMessage);
    } else if (parsedMessage.type === "typing") {
      broadcastTyping(clientId, parsedMessage);
    }
  } catch (error) {
    console.error('Error parsing message:', error);
  }
}

function addClientToPosts(socket, clientId, parsedMessage) {
  const postId = parsedMessage.postId;
  if (!postId) return;

  if (!posts[postId]) posts[postId] = {};

  posts[postId][clientId] = socket;
  console.log(`Client ${clientId} assigned to postId ${postId}`);
}

function removeClientFromPosts(clientId, parsedMessage) {
  const postId = parsedMessage.postId;
  if (posts[postId] && posts[postId][clientId]) {
    delete posts[postId][clientId];
    console.log(`Client ${clientId} removed from postId ${postId}`);
  }
}

function broadcastTyping(currentClientId, parsedMessage) {
  const postId = parsedMessage.postId;
  if (!postId || !posts[postId]) return;

  Object.keys(posts[postId]).forEach((clientId) => {
    if (clientId !== currentClientId) {
      const connection = posts[postId][clientId];
      const message = JSON.stringify({
        type: 'typing',
        user: parsedMessage.user,
        postId: postId,
      });
      connection.send(message);
    }
  });
}

function broadcastNumberOfViewers(parsedMessage) {
  const postId = parsedMessage.postId;
  if (!postId || !posts[postId]) return;

  const numberOfViewers = Object.keys(posts[postId]).length;

  Object.keys(posts[postId]).forEach((clientId) => {
      const connection = posts[postId][clientId];
      const message = JSON.stringify({
        type: 'number_of_viewers',
        numberOfViewers: numberOfViewers,
        postId: postId,
      });
      connection.send(message);
  });
}

function handleWSClose(clientId) {
  console.log(`WebSocket client disconnected: ${clientId}`);
}

module.exports = configWSServer;

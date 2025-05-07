const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { Notification } = require('../models');
const { createNotification } = require('../controllers/notificationController');

const wss = new WebSocket.Server({ noServer: true });

// Stocăm conexiunile active
const connections = new Map();

wss.on('connection', (ws, request) => {
  const userId = request.user.id;
  connections.set(userId, ws);

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      // Procesăm diferite tipuri de mesaje
      switch (data.type) {
        case 'mark_as_read':
          await Notification.update(
            { is_read: true },
            { where: { id: data.notificationId, user_id: userId } }
          );
          break;
        case 'mark_all_read':
          await Notification.update(
            { is_read: true },
            { where: { user_id: userId, is_read: false } }
          );
          break;
      }
    } catch (error) {
      console.error('Eroare la procesarea mesajului WebSocket:', error);
    }
  });

  ws.on('close', () => {
    connections.delete(userId);
  });
});

// Funcție pentru trimiterea notificărilor în timp real
const sendNotification = async (userId, notification) => {
  const ws = connections.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'new_notification',
      notification
    }));
  }
};

// Middleware pentru autentificarea WebSocket
const authenticateWebSocket = (request, callback) => {
  const token = request.headers['sec-websocket-protocol'];
  
  if (!token) {
    callback(new Error('Token lipsă'), false);
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    request.user = decoded;
    callback(null, true);
  } catch (error) {
    callback(new Error('Token invalid'), false);
  }
};

module.exports = {
  wss,
  authenticateWebSocket,
  sendNotification
}; 
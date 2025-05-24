const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const wss = new WebSocket.Server({ noServer: true });

// Stocare conexiuni active
const connections = new Map();

// Funcție pentru autentificarea conexiunii WebSocket
const authenticateWebSocket = async (token) => {
  try {
    if (!token) {
      console.error('Token lipsă pentru WebSocket');
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'temporary_secret');
    if (!decoded || !decoded.id) {
      console.error('Token invalid sau lipsesc datele utilizatorului');
      return null;
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      console.error('Utilizator negăsit pentru WebSocket');
      return null;
    }

    return user;
  } catch (error) {
    console.error('Eroare la autentificarea WebSocket:', error);
    return null;
  }
};

// Gestionare conexiuni WebSocket
wss.on('connection', (ws, request) => {
  const user = request.user;
  if (!user) {
    console.error('Utilizator lipsă în request');
    ws.close(1008, 'Utilizator neautentificat');
    return;
  }

  const userId = user.id;
  console.log('Nouă conexiune WebSocket stabilită pentru utilizatorul:', userId);

  // Stocare conexiune
  if (!connections.has(userId)) {
    connections.set(userId, new Set());
  }
  connections.get(userId).add(ws);

  // Trimite mesaj de confirmare
  ws.send(JSON.stringify({
    type: 'connection_established',
    message: 'Conexiune WebSocket stabilită cu succes'
  }));

  // Gestionare mesaje primite
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Mesaj primit de la utilizatorul', userId, ':', data);

      if (data.type === 'mark_read' && data.notificationId) {
        // Implementare marcare notificare ca citită
        // TODO: Implementare logica pentru marcarea notificării ca citită
      }
    } catch (error) {
      console.error('Eroare la procesarea mesajului:', error);
    }
  });

  // Gestionare închidere conexiune
  ws.on('close', () => {
    console.log('Conexiune WebSocket închisă pentru utilizatorul:', userId);
    const userConnections = connections.get(userId);
    if (userConnections) {
      userConnections.delete(ws);
      if (userConnections.size === 0) {
        connections.delete(userId);
      }
    }
  });

  // Gestionare erori
  ws.on('error', (error) => {
    console.error('Eroare WebSocket pentru utilizatorul', userId, ':', error);
  });
});

// Funcție pentru trimiterea unei notificări către un utilizator specific
const sendNotification = (userId, notification) => {
  const userConnections = connections.get(userId);
  if (userConnections) {
    const message = JSON.stringify({
      type: 'new_notification',
      notification
    });
    userConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }
};

// Funcție pentru broadcast unei notificări către toți utilizatorii
const broadcastNotification = (notification) => {
  const message = JSON.stringify({
    type: 'new_notification',
    notification
  });
  connections.forEach(userConnections => {
    userConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  });
};

module.exports = {
  wss,
  authenticateWebSocket,
  sendNotification,
  broadcastNotification
}; 
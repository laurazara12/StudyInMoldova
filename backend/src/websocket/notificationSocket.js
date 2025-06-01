const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const wss = new WebSocket.Server({ noServer: true });

// Store active connections
const connections = new Map();

// Reconnection configuration
const RECONNECT_INTERVAL = 5000; // 5 seconds
const MAX_RECONNECT_ATTEMPTS = 5;

// Function for WebSocket connection authentication
const authenticateWebSocket = async (token) => {
  try {
    if (!token) {
      console.error('Missing token for WebSocket');
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'temporary_secret');
    if (!decoded || !decoded.id) {
      console.error('Invalid token or missing user data');
      return null;
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      console.error('User not found for WebSocket');
      return null;
    }

    return user;
  } catch (error) {
    console.error('WebSocket authentication error:', error);
    return null;
  }
};

// Function for handling reconnection
const handleReconnect = (ws, userId, attempt = 1) => {
  if (attempt > MAX_RECONNECT_ATTEMPTS) {
    console.error('Maximum reconnection attempts reached');
    ws.close(1000, 'Maximum reconnection attempts reached');
    return;
  }

  setTimeout(() => {
    if (ws.readyState === WebSocket.CLOSED) {
      console.log(`Reconnection attempt ${attempt} for user ${userId}`);
      // Implement reconnection logic here
    }
  }, RECONNECT_INTERVAL * attempt);
};

// Handle WebSocket connections
wss.on('connection', (ws, request) => {
  const user = request.user;
  if (!user) {
    console.error('Missing user in request');
    ws.close(1008, 'Unauthenticated user');
    return;
  }

  const userId = user.id;
  console.log('New WebSocket connection established for user:', userId);

  // Store connection
  if (!connections.has(userId)) {
    connections.set(userId, new Set());
  }
  connections.get(userId).add(ws);

  // Send confirmation message
  ws.send(JSON.stringify({
    type: 'connection_established',
    message: 'WebSocket connection successfully established'
  }));

  // Handle received messages
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Message received from user', userId, ':', data);

      if (data.type === 'mark_read' && data.notificationId) {
        // Implement marking notification as read
        // TODO: Implement logic for marking notification as read
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Handle connection close
  ws.on('close', (code, reason) => {
    console.log(`WebSocket connection closed for user ${userId}. Code: ${code}, Reason: ${reason}`);
    const userConnections = connections.get(userId);
    if (userConnections) {
      userConnections.delete(ws);
      if (userConnections.size === 0) {
        connections.delete(userId);
      }
    }
    
    // Try to reconnect if the closure was not intentional
    if (code !== 1000) {
      handleReconnect(ws, userId);
    }
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error for user', userId, ':', error);
    // Try to reconnect in case of error
    handleReconnect(ws, userId);
  });

  // Ping to keep connection alive
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 30000);

  ws.on('close', () => {
    clearInterval(pingInterval);
  });
});

// Function for sending a notification to a specific user
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

// Function for broadcasting a notification to all users
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
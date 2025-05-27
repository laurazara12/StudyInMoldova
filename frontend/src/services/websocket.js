class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
    this.handlers = new Map();
    this.isConnecting = false;
  }

  connect(token) {
    if (this.isConnecting) return;
    this.isConnecting = true;

    const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:3001'}/ws?token=${token}`;
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Conexiune WebSocket stabilită');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const handlers = this.handlers.get(data.type) || [];
          handlers.forEach(handler => handler(data));
        } catch (error) {
          console.error('Eroare la procesarea mesajului:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('Conexiune WebSocket închisă:', event.code, event.reason);
        this.isConnecting = false;
        
        if (event.code !== 1000) {
          this.handleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('Eroare WebSocket:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('Eroare la inițializarea WebSocket:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Numărul maxim de încercări de reconectare a fost atins');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Încercare reconectare ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

    setTimeout(() => {
      const token = localStorage.getItem('token');
      if (token) {
        this.connect(token);
      }
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Deconectare normală');
      this.ws = null;
    }
  }

  subscribe(type, handler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type).push(handler);
  }

  unsubscribe(type, handler) {
    if (this.handlers.has(type)) {
      const handlers = this.handlers.get(type);
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket nu este conectat');
    }
  }
}

export const websocketService = new WebSocketService(); 
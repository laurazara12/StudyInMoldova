import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../config/api.config';
import './Notification.css';

const Notification = ({ notification, onMarkAsRead }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!notification.document) return;
    
    try {
      setIsDownloading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/documents/download/${notification.document.file_path}`,
        {
          headers: getAuthHeaders(),
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', notification.document.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Eroare la descărcarea fișierului');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`notification ${notification.is_read ? 'read' : 'unread'}`}>
      <div className="notification-content">
        <p className="notification-message">{notification.message}</p>
        {notification.admin_message && (
          <p className="admin-message">
            <strong>Mesaj de la administrator:</strong> {notification.admin_message}
          </p>
        )}
        {notification.document && (
          <button 
            className="download-button"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? 'Se descarcă...' : 'Descarcă Document'}
          </button>
        )}
      </div>
      {!notification.is_read && (
        <button 
          className="mark-read-button"
          onClick={() => onMarkAsRead(notification.id)}
        >
          Marchează ca citit
        </button>
      )}
    </div>
  );
};

export default Notification; 
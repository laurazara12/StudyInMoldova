import React, { useState, useRef, useEffect } from 'react';
import './help-you-choose-AI.css';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const HelpYouChoose = () => {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: 'Bună! Sunt asistentul tău pentru alegerea programului de studii în Moldova. Cu ce te pot ajuta astăzi?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll la încărcarea paginii
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Scroll la mesaje noi
  useEffect(() => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: 'user',
      content: inputMessage
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('Sending request to:', `${API_BASE_URL}/api/help-you-choose/recommendations`);
      const response = await fetch(`${API_BASE_URL}/api/help-you-choose/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          question: inputMessage,
          interests: [],
          budget: 10000,
          duration: 4,
          language: 'română'
        })
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${responseText}`);
      }

      const data = JSON.parse(responseText);
      
      if (data.success) {
        setMessages(prev => [...prev, {
          type: 'ai',
          content: data.message || (Array.isArray(data.data) ? data.data.map(program => 
            `${program.name} - ${program.University.name} (${program.University.location})`
          ).join('\n') : JSON.stringify(data.data))
        }]);
      } else {
        throw new Error(data.message || 'Error getting response');
      }
    } catch (error) {
      console.error('Error details:', error);
      setMessages(prev => [...prev, {
        type: 'ai',
        content: 'Îmi pare rău, a apărut o eroare. Vă rugăm să încercați din nou.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="help-you-choose-page">
      <Navbar />
      <div className="help-you-choose-container">
        <div className="chat-container" ref={chatContainerRef}>
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                <div className="message-avatar">
                  {message.type === 'ai' ? '🤖' : '👤'}
                </div>
                <div className="message-content">
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message ai">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="chat-input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Scrie un mesaj..."
              className="chat-input"
            />
            <button type="submit" className="send-button" disabled={isLoading}>
              Trimite
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HelpYouChoose; 
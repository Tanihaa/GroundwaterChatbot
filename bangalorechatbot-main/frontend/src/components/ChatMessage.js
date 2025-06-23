import React, { useState } from 'react';
import DataDisplay from './DataDisplay';
import './ChatMessage.css';

function ChatMessage({ message }) {
  const [showData, setShowData] = useState(false);
  
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleData = () => {
    setShowData(!showData);
  };

  return (
    <div className={`message ${message.type}`}>
      <div className="message-header">
        <span className="avatar">
          {message.type === 'user' ? '' : ''}
        </span>
        <span className="sender">
          {message.type === 'user' ? 'You' : 'Groundwater Assistant'}
        </span>
        <span className="timestamp">
          {formatDate(message.timestamp)}
        </span>
        {message.source === 'combined' && (
          <span className="badge combined">Local Data + AI</span>
        )}
        {message.source === 'groq' && (
          <span className="badge groq">AI Only</span>
        )}
      </div>
      
      <div className="message-content">
        {message.content.split('\n').map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
      
      {message.data && (
        <div className="data-section">
          <button 
            className="data-toggle"
            onClick={toggleData}
          >
            {showData ? 'Hide Raw Data' : 'Show Raw Data'}
          </button>
          
          {showData && <DataDisplay data={message.data} />}
        </div>
      )}
    </div>
  );
}

export default ChatMessage;
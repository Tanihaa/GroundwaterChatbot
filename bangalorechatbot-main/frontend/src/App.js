import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './components/ChatMessage';
import DataDisplay from './components/DataDisplay';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('jwtToken') || null);
  const [showRegister, setShowRegister] = useState(false);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const messagesEndRef = useRef(null);

  // Commented out localStorage conversation load/save
  /*
  useEffect(() => {
    const savedConversations = localStorage.getItem('groundwater_conversations');
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('groundwater_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);
  */

  // Fetch user-specific conversation history from backend on token load/change
  useEffect(() => {
    if (!token) {
      setConversations([]);
      setMessages([]);
      setActiveConversation(null);
      return;
    }

    const fetchUserHistory = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          console.error("Failed to fetch user history");
          return;
        }
        const userHistory = await response.json();

        if (userHistory.length === 0) {
          setConversations([]);
          setMessages([]);
          setActiveConversation(null);
          return;
        }

        const messagesFromHistory = userHistory.flatMap(h => ([
          { type: 'user', content: h.query, timestamp: h.timestamp },
          { type: 'bot', content: h.response, timestamp: h.timestamp }
        ]));

        const conversation = {
          id: Date.now(),
          title: 'Previous Conversations',
          messages: messagesFromHistory,
          createdAt: userHistory[0].timestamp || new Date().toISOString()
        };

        setConversations([conversation]);
        setActiveConversation(conversation.id);
        setMessages(messagesFromHistory);

      } catch (error) {
        console.error("Error fetching user history:", error);
      }
    };

    fetchUserHistory();
  }, [token]);

  // Fetch stats periodically
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { 
      type: 'user', 
      content: input,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInput('');

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: input }),
      });

      if (response.status === 401) {
        alert('Session expired or not logged in. Please login again.');
        setToken(null);
        localStorage.removeItem('jwtToken');
        setLoading(false);
        return;
      }

      const data = await response.json();

      const botMessage = {
        type: 'bot',
        content: data.text,
        source: data.source,
        data: data.data,
        timestamp: new Date().toISOString()
      };
      
      const updatedMessages = [...messages, userMessage, botMessage];
      setMessages(updatedMessages);
      
      if (messages.length === 0) {
        const newConversation = {
          id: Date.now(),
          title: input.substring(0, 30) + (input.length > 30 ? '...' : ''),
          messages: updatedMessages,
          createdAt: new Date().toISOString()
        };
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversation(newConversation.id);
      } else if (activeConversation) {
        setConversations(prev => prev.map(conv => 
          conv.id === activeConversation 
            ? {...conv, messages: updatedMessages} 
            : conv
        ));
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          content: 'Sorry, I had trouble connecting to the server. Please try again later.',
          source: 'error',
          timestamp: new Date().toISOString()
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = () => {
    if (messages.length > 0) {
      const newConversation = {
        id: Date.now(),
        title: 'New Conversation',
        messages: [],
        createdAt: new Date().toISOString()
      };
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversation(newConversation.id);
    }
    setMessages([]);
  };

  const loadConversation = (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setMessages(conversation.messages);
      setActiveConversation(conversationId);
      setShowHistory(false);
    }
  };

  // AUTH FLOW - if no token, show login/register
  if (!token) {
    return (
      <div className="auth-wrapper">
        {showRegister ? (
          <>
            <Register onAuthSuccess={() => setShowRegister(false)} />
            <p>
              Already have an account?{' '}
              <button onClick={() => setShowRegister(false)}>Login</button>
            </p>
          </>
        ) : (
          <>
            <Login onLoginSuccess={(token) => setToken(token)} />
            <p>
              Don't have an account?{' '}
              <button onClick={() => setShowRegister(true)}>Register</button>
            </p>
          </>
        )}
      </div>
    );
  }

  // MAIN CHAT UI when logged in
  return (
    <div className="App">
      <header className="App-header">
        <div className="header-left">
          <h1>Bangalore Groundwater Assistant</h1>
          <button 
            className="history-button"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
          <button 
            className="clear-button"
            onClick={() => {
              setToken(null);
              localStorage.removeItem('jwtToken');
              setConversations([]);
              setMessages([]);
              setActiveConversation(null);
            }}
            style={{ marginLeft: '10px' }}
          >
            Logout
          </button>
        </div>
        {stats && (
          <div className="stats">
            <span>Queries: {stats.total_queries}</span>
            <span>Avg Response: {stats.avg_response_time.toFixed(2)}s</span>
          </div>
        )}
      </header>

      <div className="main-content">
        {showHistory ? (
          <div className="history-panel">
            <h2>Conversation History</h2>
            <button 
              className="new-conversation-button"
              onClick={startNewConversation}
            >
              Start New Conversation
            </button>
            <ul className="conversation-list">
              {conversations.map(conv => (
                <li 
                  key={conv.id}
                  className={`conversation-item ${activeConversation === conv.id ? 'active' : ''}`}
                  onClick={() => loadConversation(conv.id)}
                >
                  <div className="conversation-title">{conv.title}</div>
                  <div className="conversation-date">
                    {new Date(conv.createdAt).toLocaleString()}
                  </div>
                  <div className="conversation-preview">
                    {conv.messages.length > 0 
                      ? conv.messages[0].content.substring(0, 50) + '...'
                      : 'Empty conversation'}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="chat-container">
            <div className="chat-header">
              <button 
                className="clear-button"
                onClick={startNewConversation}
                disabled={messages.length === 0}
              >
                Clear Conversation
              </button>
            </div>
            <div className="messages">
              {messages.length === 0 ? (
                <div className="welcome-message">
                  <h2>Welcome to the Bangalore Groundwater Assistant!</h2>
                  <p>Ask me anything about groundwater conditions in Bangalore.</p>
                  <p>For example:</p>
                  <ul>
                    <li>"What's the water table level in Jayanagar?"</li>
                    <li>"How has groundwater quality changed in Whitefield?"</li>
                    <li>"Which areas in Bangalore have the best groundwater quality?"</li>
                  </ul>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <ChatMessage key={index} message={msg} />
                ))
              )}
              {loading && <div className="loading">Thinking...</div>}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="input-form">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about groundwater in Bangalore..."
                disabled={loading}
              />
              <button type="submit" disabled={loading}>
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

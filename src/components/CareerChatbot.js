import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FiMessageCircle, FiSend, FiX, FiMinimize2, FiMaximize2, FiTrash2, FiBot } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './CareerChatbot.css';

const CareerChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m Careerly Assistant, your AI career coach. I can help you with career advice, job search tips, interview prep, resume help, and more. What would you like to know?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  const quickSuggestions = [
    'How do I prepare for a job interview?',
    'What skills should I add to my resume?',
    'How do I negotiate salary?',
    'Tips for networking',
    'How to write a cover letter?',
    'Career change advice',
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText = null) => {
    const messageToSend = messageText || inputMessage.trim();
    
    if (!messageToSend) return;

    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // Build conversation history (excluding the system greeting)
      const conversationHistory = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await axios.post(
        `${API_URL}/ai/career-chat`,
        {
          message: messageToSend,
          conversationHistory,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: response.data.timestamp || new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error(error.response?.data?.message || 'Failed to get response');
      
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again in a moment.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickSuggestion = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m Careerly Assistant, your AI career coach. I can help you with career advice, job search tips, interview prep, resume help, and more. What would you like to know?',
        timestamp: new Date().toISOString(),
      },
    ]);
    toast.success('Conversation cleared');
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) return null;

  return (
    <>
      {/* Chatbot Toggle Button */}
      <motion.button
        className="chatbot-toggle-btn"
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <FiMessageCircle />
        <span>Career Assistant</span>
      </motion.button>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`chatbot-window ${isMinimized ? 'minimized' : ''}`}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="chatbot-header">
              <div className="header-info">
                <div className="bot-avatar">
                  <FiBot />
                </div>
                <div>
                  <h3>Careerly Assistant</h3>
                  <p>AI Career Coach</p>
                </div>
              </div>
              <div className="header-actions">
                <button
                  onClick={handleClearChat}
                  className="icon-btn"
                  title="Clear conversation"
                >
                  <FiTrash2 />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="icon-btn"
                  title={isMinimized ? 'Maximize' : 'Minimize'}
                >
                  {isMinimized ? <FiMaximize2 /> : <FiMinimize2 />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="icon-btn"
                  title="Close"
                >
                  <FiX />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div className="chatbot-messages">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        className={`message ${message.role}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, delay: index === messages.length - 1 ? 0.1 : 0 }}
                      >
                        <div className="message-content">
                          {message.role === 'assistant' && (
                            <div className="bot-icon">
                              <FiBot />
                            </div>
                          )}
                          <div className="message-bubble">
                            <p>{message.content}</p>
                            <span className="message-time">{formatTime(message.timestamp)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {loading && (
                    <motion.div
                      className="message assistant"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="message-content">
                        <div className="bot-icon">
                          <FiBot />
                        </div>
                        <div className="message-bubble loading">
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestions */}
                {messages.length === 1 && !loading && (
                  <div className="quick-suggestions">
                    <p>Quick questions:</p>
                    <div className="suggestions-grid">
                      {quickSuggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          className="suggestion-btn"
                          onClick={() => handleQuickSuggestion(suggestion)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="chatbot-input-area">
                  <div className="input-wrapper">
                    <textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about your career..."
                      rows={1}
                      className="chatbot-input"
                      disabled={loading}
                    />
                    <motion.button
                      onClick={() => handleSendMessage()}
                      disabled={!inputMessage.trim() || loading}
                      className="send-btn"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiSend />
                    </motion.button>
                  </div>
                  <small>Press Enter to send, Shift+Enter for new line</small>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CareerChatbot;


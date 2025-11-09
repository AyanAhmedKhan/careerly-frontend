import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { FiMessageCircle, FiSend, FiUser, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Messages.css';

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!user || !token) return;

    // Initialize Socket.io connection
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.io');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from Socket.io');
    });

    socketRef.current.on('new-message', (message) => {
      if (selectedConversation && message.conversation === selectedConversation._id) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
      // Update conversation list
      fetchConversations();
    });

    socketRef.current.on('user-typing', (data) => {
      if (selectedConversation && data.userId !== user.id) {
        setTyping(true);
        setTypingUser(data.userName);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setTyping(false);
          setTypingUser(null);
        }, 3000);
      }
    });

    socketRef.current.on('messages-read', (data) => {
      // Update read status in messages
      setMessages(prev =>
        prev.map(msg =>
          msg.conversation === data.conversationId && msg.sender._id !== user.id
            ? { ...msg, read: true }
            : msg
        )
      );
    });

    socketRef.current.on('error', (error) => {
      toast.error(error.message || 'Socket error');
    });

    fetchConversations();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
      socketRef.current?.emit('join-conversation', selectedConversation._id);
    }

    return () => {
      if (selectedConversation) {
        socketRef.current?.emit('leave-conversation', selectedConversation._id);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(`${API_URL}/chat/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data);
      
      // Mark messages as read
      await axios.put(`${API_URL}/chat/conversations/${conversationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      socketRef.current.emit('send-message', {
        conversationId: selectedConversation._id,
        text: messageText,
        receiverId: selectedConversation.otherParticipant._id,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (selectedConversation) {
      socketRef.current?.emit('typing', {
        conversationId: selectedConversation._id,
        isTyping: true,
      });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing', {
          conversationId: selectedConversation._id,
          isTyping: false,
        });
      }, 1000);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="messages-container">
        <div className="empty-state">
          <p>Please log in to view messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <motion.div
        className="messages-layout"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Conversations List */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h2>Messages</h2>
          </div>

          {loading ? (
            <div className="loading-state">
              <FiLoader className="spinning" />
              <p>Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="empty-state">
              <FiMessageCircle />
              <p>No conversations yet</p>
              <p className="empty-hint">Connect with people to start messaging!</p>
            </div>
          ) : (
            <div className="conversations-list">
              {conversations.map((conversation) => (
                <motion.div
                  key={conversation._id}
                  className={`conversation-item ${
                    selectedConversation?._id === conversation._id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                  whileHover={{ backgroundColor: '#f5f5f5' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="conversation-avatar">
                    {conversation.otherParticipant?.profilePicture ? (
                      <img
                        src={conversation.otherParticipant.profilePicture}
                        alt={conversation.otherParticipant.name}
                      />
                    ) : (
                      <span>{conversation.otherParticipant?.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="conversation-info">
                    <h4>{conversation.otherParticipant?.name}</h4>
                    <p className="last-message">
                      {conversation.lastMessage?.text?.substring(0, 50) || 'No messages yet'}
                    </p>
                  </div>
                  <div className="conversation-meta">
                    <span className="time">{formatTime(conversation.lastMessageAt)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Window */}
        <div className="chat-window">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="chat-avatar">
                    {selectedConversation.otherParticipant?.profilePicture ? (
                      <img
                        src={selectedConversation.otherParticipant.profilePicture}
                        alt={selectedConversation.otherParticipant.name}
                      />
                    ) : (
                      <span>
                        {selectedConversation.otherParticipant?.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3>{selectedConversation.otherParticipant?.name}</h3>
                    <p className="user-status">Online</p>
                  </div>
                </div>
                <button
                  className="view-profile-btn"
                  onClick={() => navigate(`/profile/${selectedConversation.otherParticipant._id}`)}
                >
                  <FiUser />
                  View Profile
                </button>
              </div>

              <div className="messages-area">
                {messages.map((message, index) => (
                  <motion.div
                    key={message._id || index}
                    className={`message ${message.sender._id === user.id ? 'sent' : 'received'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="message-content">
                      <p>{message.text}</p>
                      <span className="message-time">{formatTime(message.createdAt)}</span>
                    </div>
                  </motion.div>
                ))}

                {typing && typingUser && (
                  <div className="message received typing-indicator">
                    <div className="message-content">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span className="typing-text">{typingUser} is typing...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <form className="message-input-area" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type a message..."
                  className="message-input"
                  disabled={sending}
                />
                <motion.button
                  type="submit"
                  className="send-btn"
                  disabled={!newMessage.trim() || sending}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {sending ? <FiLoader className="spinning" /> : <FiSend />}
                </motion.button>
              </form>
            </>
          ) : (
            <div className="no-conversation-selected">
              <FiMessageCircle />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Messages;


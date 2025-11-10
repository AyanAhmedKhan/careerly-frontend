import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiBell, FiX, FiUserPlus, FiHeart, FiMessageCircle, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Notifications.css';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [token, API_URL]);

  useEffect(() => {
    if (token && user) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token, user, fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${API_URL}/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.filter(n => n._id !== notificationId));
      if (!notifications.find(n => n._id === notificationId)?.read) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }

    if (notification.type === 'connection_request' || notification.type === 'connection_accepted') {
      navigate(`/profile/${notification.from?._id || notification.from}`);
    } else if (notification.post) {
      // Scroll to post in feed
      navigate('/feed');
      setTimeout(() => {
        const element = document.getElementById(`post-${notification.post?._id || notification.post}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
    setShowDropdown(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'connection_request':
      case 'connection_accepted':
        return <FiUserPlus />;
      case 'post_like':
        return <FiHeart />;
      case 'post_comment':
        return <FiMessageCircle />;
      default:
        return <FiBell />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'connection_request':
      case 'connection_accepted':
        return '#0077B5';
      case 'post_like':
        return '#f02849';
      case 'post_comment':
        return '#FF7A00';
      default:
        return '#666';
    }
  };

  if (!user) return null;

  return (
    <div className="notifications-container">
      <motion.button
        className="notifications-btn"
        onClick={() => setShowDropdown(!showDropdown)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FiBell />
        {unreadCount > 0 && (
          <motion.span
            className="notification-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <motion.div
              className="notifications-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDropdown(false)}
            />
            <motion.div
              className="notifications-dropdown"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="notifications-header">
                <h3>Notifications</h3>
                <div className="notifications-actions">
                  {unreadCount > 0 && (
                    <button
                      className="mark-all-read-btn"
                      onClick={markAllAsRead}
                      title="Mark all as read"
                    >
                      <FiCheck />
                    </button>
                  )}
                  <button
                    className="close-notifications-btn"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiX />
                  </button>
                </div>
              </div>

              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="notifications-empty">
                    <FiBell className="empty-icon" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <motion.div
                      key={notification._id}
                      className={`notification-item ${!notification.read ? 'unread' : ''}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNotificationClick(notification)}
                      whileHover={{ x: 5 }}
                    >
                      <div
                        className="notification-icon"
                        style={{ color: getNotificationColor(notification.type) }}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="notification-content">
                        <div className="notification-avatar">
                          {notification.from?.profilePicture ? (
                            <img src={notification.from.profilePicture} alt={notification.from.name} />
                          ) : (
                            <span>{notification.from?.name?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="notification-text">
                          <p className="notification-message">
                            {notification.message || `${notification.from?.name || 'Someone'} ${notification.type === 'connection_request' ? 'wants to connect' : notification.type === 'connection_accepted' ? 'accepted your connection' : notification.type === 'post_like' ? 'liked your post' : 'commented on your post'}`}
                          </p>
                          <span className="notification-time">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      <button
                        className="delete-notification-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                      >
                        <FiX />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const formatTime = (date) => {
  if (!date) return 'Just now';
  const now = new Date();
  const notifDate = new Date(date);
  const diffInSeconds = Math.floor((now - notifDate) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return notifDate.toLocaleDateString();
};

export default Notifications;


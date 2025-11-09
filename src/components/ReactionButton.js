import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './ReactionButton.css';

const REACTIONS = {
  like: { emoji: '👍', label: 'Like', color: '#1877f2' },
  love: { emoji: '❤️', label: 'Love', color: '#f02849' },
  laugh: { emoji: '😂', label: 'Haha', color: '#fbbd2c' },
  cry: { emoji: '😢', label: 'Sad', color: '#fbbd2c' },
  wow: { emoji: '😮', label: 'Wow', color: '#fbbd2c' },
  angry: { emoji: '😠', label: 'Angry', color: '#e41e3f' },
};

const ReactionButton = ({ post, currentUser, onReactionUpdate }) => {
  const [showReactions, setShowReactions] = useState(false);
  const [isReacting, setIsReacting] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Get user's current reaction
  const getUserReaction = () => {
    if (!post.reactions || !currentUser) return null;
    
    for (const [type, users] of Object.entries(post.reactions)) {
      if (Array.isArray(users)) {
        const hasReacted = users.some(
          (user) => (user._id || user) === currentUser.id
        );
        if (hasReacted) return type;
      }
    }
    return null;
  };

  const currentReaction = getUserReaction();
  const totalReactions = post.reactions
    ? Object.values(post.reactions).reduce((sum, arr) => sum + (arr?.length || 0), 0)
    : (post.likes?.length || 0);

  const handleReaction = async (reactionType) => {
    if (isReacting) return;
    
    setIsReacting(true);
    setShowReactions(false);

    try {
      const response = await axios.post(`${API_URL}/posts/${post._id}/react`, {
        reactionType,
      });
      onReactionUpdate(response.data);
    } catch (error) {
      console.error('Reaction error:', error);
    } finally {
      setIsReacting(false);
    }
  };

  const handleQuickReact = async () => {
    if (currentReaction) {
      // Remove reaction
      await handleReaction(currentReaction);
    } else {
      // Add like
      await handleReaction('like');
    }
  };

  return (
    <div className="reaction-container">
      <motion.button
        className={`reaction-btn ${currentReaction ? `reaction-${currentReaction}` : ''}`}
        onClick={handleQuickReact}
        onMouseEnter={() => setShowReactions(true)}
        onMouseLeave={() => setShowReactions(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        disabled={isReacting}
      >
        <motion.span
          className="reaction-emoji"
          animate={currentReaction ? { 
            scale: [1, 1.3, 1],
            rotate: [0, -10, 10, -10, 0]
          } : {}}
          transition={{ duration: 0.5 }}
        >
          {currentReaction ? REACTIONS[currentReaction].emoji : '👍'}
        </motion.span>
        <span className="reaction-label">
          {currentReaction ? REACTIONS[currentReaction].label : 'Like'}
        </span>
      </motion.button>

      <AnimatePresence>
        {showReactions && (
          <motion.div
            className="reactions-picker"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
          >
            {Object.entries(REACTIONS).map(([type, { emoji, label }], index) => (
              <motion.button
                key={type}
                className={`reaction-option ${currentReaction === type ? 'active' : ''}`}
                onClick={() => handleReaction(type)}
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 500,
                  damping: 25
                }}
                whileHover={{ 
                  scale: 1.3,
                  y: -10,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.9 }}
                title={label}
              >
                <motion.span
                  animate={currentReaction === type ? {
                    scale: [1, 1.2, 1],
                  } : {}}
                >
                  {emoji}
                </motion.span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {totalReactions > 0 && (
        <motion.div
          className="reaction-count"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {totalReactions}
        </motion.div>
      )}
    </div>
  );
};

export default ReactionButton;


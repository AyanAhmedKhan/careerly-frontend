import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FiMessageCircle, FiEdit2, FiTrash2, FiMoreVertical, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ReactionButton from './ReactionButton';
import './PostCard.css';

const PostCard = ({
  post,
  currentUser,
  onPostUpdated,
  onPostDeleted,
  onPostLiked,
  onCommentAdded,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiReplies, setAiReplies] = useState([]);
  const [loadingAiReplies, setLoadingAiReplies] = useState(false);
  const [showAiReplies, setShowAiReplies] = useState(false);
  const navigate = useNavigate();

  // Update editText when post changes
  useEffect(() => {
    if (!isEditing) {
      setEditText(post.text);
    }
  }, [post.text, isEditing]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.post-menu')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const isOwner = post.user?._id === currentUser?.id || post.user === currentUser?.id;

  // Calculate total reactions
  const getTotalReactions = () => {
    if (post.reactions) {
      return Object.values(post.reactions).reduce((sum, arr) => sum + (arr?.length || 0), 0);
    }
    return post.likes?.length || 0;
  };

  const totalReactions = getTotalReactions();

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return postDate.toLocaleDateString();
  };

  const handleReactionUpdate = (updatedPost) => {
    onPostLiked(updatedPost);
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    const userId = post.user?._id || post.user;
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  const handleGetAiReplies = async () => {
    setLoadingAiReplies(true);
    try {
      const response = await axios.post(`${API_URL}/ai/suggest-reply`, {
        postContent: post.text,
        context: 'professional social media'
      });
      setAiReplies(response.data.replies || []);
      setShowAiReplies(true);
    } catch (error) {
      toast.error('AI replies unavailable');
    } finally {
      setLoadingAiReplies(false);
    }
  };

  const applyAiReply = (reply) => {
    setCommentText(reply);
    setShowAiReplies(false);
    toast.success('Reply suggestion applied!');
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const response = await axios.post(`${API_URL}/posts/${post._id}/comment`, {
        text: commentText,
      });
      onCommentAdded(response.data);
      setCommentText('');
      setShowComments(true);
      setShowAiReplies(false);
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleEdit = async () => {
    if (!editText.trim()) {
      toast.error('Post cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${API_URL}/posts/${post._id}`, {
        text: editText,
      });
      onPostUpdated(response.data);
      setIsEditing(false);
      toast.success('Post updated successfully');
    } catch (error) {
      toast.error('Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await axios.delete(`${API_URL}/posts/${post._id}`);
      onPostDeleted(post._id);
      toast.success('Post deleted successfully');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const user = post.user?.name ? post.user : { name: 'Unknown User' };
  const userAvatar = post.user?.profilePicture || '';

  return (
    <motion.div
      className="post-card"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="post-header">
        <Link 
          to={`/profile/${post.user?._id || post.user}`} 
          className="post-user"
          onClick={handleProfileClick}
        >
          <div className="post-avatar">
            {userAvatar ? (
              <img src={userAvatar} alt={user.name} />
            ) : (
              <span>{user.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="post-user-info">
            <h3>{user.name}</h3>
            <p>{formatDate(post.createdAt)}</p>
          </div>
        </Link>

        {isOwner && (
          <div className="post-menu">
            <button
              className="menu-btn"
              onClick={() => setShowMenu(!showMenu)}
            >
              <FiMoreVertical />
            </button>
            {showMenu && (
              <div className="menu-dropdown">
                <button onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}>
                  <FiEdit2 /> Edit
                </button>
                <button onClick={() => {
                  handleDelete();
                  setShowMenu(false);
                }}>
                  <FiTrash2 /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="edit-post">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="edit-textarea"
            rows="4"
          />
          <div className="edit-actions">
            <button onClick={() => {
              setIsEditing(false);
              setEditText(post.text);
            }}>
              Cancel
            </button>
            <button onClick={handleEdit} disabled={loading} className="save-btn">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {post.text && (
            <div className="post-content">
              <p>{post.text}</p>
            </div>
          )}

          {post.image && (
            <div className="post-image">
              <img
                src={`${API_URL.replace('/api', '')}${post.image}`}
                alt="Post"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </>
      )}

      <div className="post-stats">
        {totalReactions > 0 && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="reactions-summary"
          >
            {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
          </motion.span>
        )}
        {post.comments?.length > 0 && (
          <span>{post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}</span>
        )}
      </div>

      <div className="post-actions">
        <ReactionButton
          post={post}
          currentUser={currentUser}
          onReactionUpdate={handleReactionUpdate}
        />
        <motion.button
          className="action-btn"
          onClick={() => setShowComments(!showComments)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiMessageCircle />
          <span>Comment</span>
        </motion.button>
      </div>

      {showComments && (
        <motion.div
          className="comments-section"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <form onSubmit={handleComment} className="comment-form">
            <div className="comment-input-wrapper">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="comment-input"
              />
              <motion.button
                type="button"
                className="ai-reply-btn"
                onClick={handleGetAiReplies}
                disabled={loadingAiReplies}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Get AI reply suggestions"
              >
                <FiStar />
              </motion.button>
            </div>
            <AnimatePresence>
              {showAiReplies && aiReplies.length > 0 && (
                <motion.div
                  className="ai-replies-panel"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="ai-replies-header">
                    <FiStar />
                    <span>AI Suggestions</span>
                    <button onClick={() => setShowAiReplies(false)}>×</button>
                  </div>
                  <div className="ai-replies-list">
                    {aiReplies.map((reply, index) => (
                      <motion.div
                        key={index}
                        className="ai-reply-item"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => applyAiReply(reply)}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        {reply}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button type="submit" className="comment-submit">
              Post
            </button>
          </form>

          <div className="comments-list">
            {post.comments?.map((comment) => (
              <motion.div
                key={comment._id}
                className="comment-item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  to={`/profile/${comment.user?._id || comment.user}`}
                  className="comment-avatar-link"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/profile/${comment.user?._id || comment.user}`);
                  }}
                >
                  <div className="comment-avatar">
                    {comment.user?.profilePicture ? (
                      <img src={comment.user.profilePicture} alt={comment.user.name} />
                    ) : (
                      <span>{comment.user?.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </Link>
                <div className="comment-content">
                  <div className="comment-header">
                    <Link
                      to={`/profile/${comment.user?._id || comment.user}`}
                      className="comment-user-link"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/profile/${comment.user?._id || comment.user}`);
                      }}
                    >
                      <strong>{comment.user?.name || 'Unknown'}</strong>
                    </Link>
                    <span>{formatDate(comment.createdAt)}</span>
                  </div>
                  <p>{comment.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PostCard;


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiImage, FiSend, FiX, FiStar, FiZap, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './CreatePost.css';

const CreatePost = ({ onPostCreated }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleAISuggestions = async () => {
    setAiLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/ai/suggest-post`,
        { topic: text || 'professional growth', mood: 'motivational' }
      );
      setAiSuggestions(response.data.suggestions || []);
      setShowAIPanel(true);
    } catch (error) {
      toast.error('AI suggestions unavailable. Make sure GROQ_API_KEY is set.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleEnhance = async () => {
    if (!text.trim()) {
      toast.error('Please write something first');
      return;
    }
    setEnhancing(true);
    try {
      const response = await axios.post(`${API_URL}/ai/enhance-post`, { content: text });
      setText(response.data.enhanced || text);
      toast.success('Content enhanced!');
    } catch (error) {
      toast.error('Enhancement unavailable');
    } finally {
      setEnhancing(false);
    }
  };

  const applySuggestion = (suggestion) => {
    setText(suggestion.content || suggestion);
    setShowAIPanel(false);
    toast.success('Suggestion applied!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim() && !image) {
      toast.error('Please write something or add an image');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('text', text.trim());
      if (image) {
        formData.append('image', image);
      }

      const response = await axios.post(`${API_URL}/posts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Post created successfully!');
      setText('');
      setImage(null);
      setImagePreview(null);
      setShowAIPanel(false);
      setAiSuggestions([]);
      onPostCreated(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="create-post-card"
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ y: -5 }}
    >
      <div className="create-post-header">
        <Link
          to={`/profile/${user?.id}`}
          onClick={(e) => {
            e.preventDefault();
            navigate(`/profile/${user?.id}`);
          }}
        >
          <motion.div 
            className="user-avatar"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} />
            ) : (
              <span>{user?.name?.charAt(0).toUpperCase()}</span>
            )}
          </motion.div>
        </Link>
        <div className="user-info">
          <Link
            to={`/profile/${user?.id}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/profile/${user?.id}`);
            }}
            className="user-name-link"
          >
            <h3>{user?.name}</h3>
          </Link>
          <p>Share your thoughts with the community</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="create-post-form">
        <motion.div
          className="textarea-wrapper"
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <textarea
            className="post-textarea"
            placeholder="What's on your mind? ✨"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows="4"
          />
          {text.length > 0 && (
            <motion.div
              className="char-count"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {text.length} characters
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence>
          {imagePreview && (
            <motion.div
              className="image-preview"
              initial={{ opacity: 0, scale: 0.8, height: 0 }}
              animate={{ opacity: 1, scale: 1, height: 'auto' }}
              exit={{ opacity: 0, scale: 0.8, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <img src={imagePreview} alt="Preview" />
              <motion.button
                type="button"
                onClick={removeImage}
                className="remove-image-btn"
                whileHover={{ scale: 1.2, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiX />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAIPanel && aiSuggestions.length > 0 && (
            <motion.div
              className="ai-suggestions-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="ai-panel-header">
                <FiStar />
                <span>AI Suggestions</span>
                <button onClick={() => setShowAIPanel(false)} className="close-ai-btn">
                  <FiX />
                </button>
              </div>
              <div className="suggestions-list">
                {aiSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    className="suggestion-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    onClick={() => applySuggestion(suggestion)}
                  >
                    <div className="suggestion-content">
                      <h4>{suggestion.title || 'Suggestion'}</h4>
                      <p>{suggestion.content || suggestion}</p>
                    </div>
                    <motion.button
                      className="use-suggestion-btn"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      Use
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="create-post-actions">
          <div className="action-buttons-left">
            <motion.label
              className="image-upload-btn"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiImage />
              <span>Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </motion.label>

            <motion.button
              type="button"
              className="ai-suggest-btn"
              onClick={handleAISuggestions}
              disabled={aiLoading}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiStar />
              <span>{aiLoading ? 'Thinking...' : 'AI Ideas'}</span>
            </motion.button>

            {text.trim() && (
              <motion.button
                type="button"
                className="enhance-btn"
                onClick={handleEnhance}
                disabled={enhancing}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <FiZap />
                <span>{enhancing ? 'Enhancing...' : 'Enhance'}</span>
              </motion.button>
            )}
          </div>

          <motion.button
            type="submit"
            className="submit-post-btn"
            disabled={loading || (!text.trim() && !image)}
            whileHover={{ 
              scale: loading ? 1 : 1.05,
              boxShadow: loading ? 'none' : '0 10px 30px rgba(102, 126, 234, 0.4)'
            }}
            whileTap={{ scale: 0.95 }}
            initial={false}
          >
            {loading ? (
              <div className="spinner-small"></div>
            ) : (
              <>
                <FiSend />
                <span>Post</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreatePost;

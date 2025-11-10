import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiTrendingUp, FiUsers, FiBriefcase, FiStar, FiSearch, FiX, FiZap } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import Recommendations from '../components/Recommendations';
import toast from 'react-hot-toast';
import './Feed.css';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ posts: [], users: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchPosts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/posts`);
      setPosts(response.data);
    } catch (error) {
      toast.error('Failed to load posts');
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const fetchTrendingPosts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/posts`);
      // Sort by engagement (reactions + comments)
      const sorted = response.data
        .map(post => {
          const reactions = post.reactions 
            ? Object.values(post.reactions).reduce((sum, arr) => sum + (arr?.length || 0), 0)
            : (post.likes?.length || 0);
          const comments = post.comments?.length || 0;
          return { ...post, engagement: reactions + comments * 2 };
        })
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 5);
      setTrendingPosts(sorted);
    } catch (error) {
      console.error('Error fetching trending posts:', error);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchPosts();
    fetchTrendingPosts();
  }, [fetchPosts, fetchTrendingPosts]);

  useEffect(() => {
    if (trendingPosts.length > 0 && !aiSummary && user) {
      generateAISummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trendingPosts.length, aiSummary, user]);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map((post) => (post._id === updatedPost._id ? updatedPost : post)));
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter((post) => post._id !== postId));
  };

  const handlePostLiked = (updatedPost) => {
    setPosts(posts.map((post) => (post._id === updatedPost._id ? updatedPost : post)));
  };

  const handleCommentAdded = (updatedPost) => {
    setPosts(posts.map((post) => (post._id === updatedPost._id ? updatedPost : post)));
  };


  const handleSearch = async (query) => {
    if (!query || query.trim().length === 0) {
      setSearchResults({ posts: [], users: [] });
      return;
    }

    setSearchLoading(true);
    try {
      const [postsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/posts?search=${encodeURIComponent(query)}`),
        axios.get(`${API_URL}/users/search?q=${encodeURIComponent(query)}`),
      ]);

      setSearchResults({
        posts: postsRes.data,
        users: usersRes.data,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      handleSearch(value);
    }, 500);
  };

  const generateAISummary = async () => {
    if (trendingPosts.length === 0) return;

    setLoadingSummary(true);
    try {
      const topPosts = trendingPosts.slice(0, 5).map(p => p.text).join('\n\n');
      await axios.post(
        `${API_URL}/ai/analyze-content`,
        { content: topPosts },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Create a summary from the analysis
      const summaryResponse = await axios.post(
        `${API_URL}/ai/suggest-post`,
        {
          topic: 'trending topics summary',
          mood: 'professional',
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (summaryResponse.data.suggestions?.[0]) {
        setAiSummary(summaryResponse.data.suggestions[0].content);
      }
    } catch (error) {
      console.error('AI Summary error:', error);
      // Fallback summary
      setAiSummary(`Trending topics include discussions about professional growth, technology, and career development. ${trendingPosts.length} posts are gaining significant engagement.`);
    } finally {
      setLoadingSummary(false);
    }
  };

  if (loading) {
    return (
      <div className="feed-container">
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <div className="feed-layout">
        {/* Left Sidebar */}
        <motion.aside
          className="feed-sidebar"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="sidebar-card">
            <div className="trending-header">
              <h3>Trending Now</h3>
              {aiSummary && (
                <motion.button
                  className="ai-summary-btn"
                  onClick={() => setAiSummary(null)}
                  whileHover={{ scale: 1.05 }}
                  title="Hide AI Summary"
                >
                  <FiZap />
                </motion.button>
              )}
            </div>
            
            {aiSummary && (
              <motion.div
                className="ai-summary-box"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="ai-summary-header">
                  <FiZap className="ai-icon" />
                  <span>AI Summary</span>
                </div>
                <p className="ai-summary-text">{aiSummary}</p>
              </motion.div>
            )}

            {loadingSummary && (
              <div className="ai-summary-loading">Generating AI summary...</div>
            )}

            <div className="trending-list">
              {trendingPosts.slice(0, 3).map((post, index) => (
                <motion.div
                  key={post._id}
                  className="trending-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <FiTrendingUp className="trending-icon" />
                  <div className="trending-content">
                    <p className="trending-text">{post.text?.substring(0, 60)}...</p>
                    <span className="trending-engagement">
                      {post.reactions 
                        ? Object.values(post.reactions).reduce((sum, arr) => sum + (arr?.length || 0), 0)
                        : (post.likes?.length || 0)} reactions
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </motion.aside>

        {/* Main Feed */}
        <div className="feed-content">
          <motion.div
            className="feed-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="feed-header-content">
              <h1>Your Feed</h1>
              <motion.button
                className="search-toggle-btn"
                onClick={() => setShowSearch(!showSearch)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiSearch />
                <span>Search</span>
              </motion.button>
            </div>
            <AnimatePresence>
              {showSearch && (
                <motion.div
                  className="search-bar"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="search-input-wrapper">
                    <FiSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search posts, people, companies, skills..."
                      className="search-input"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        className="clear-search"
                        onClick={() => {
                          setSearchQuery('');
                          setSearchResults({ posts: [], users: [] });
                        }}
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                  
                  {searchQuery && (
                    <motion.div
                      className="search-results"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {searchLoading ? (
                        <div className="search-loading">Searching...</div>
                      ) : (
                        <>
                          {searchResults.users.length > 0 && (
                            <div className="search-section">
                              <h4>People ({searchResults.users.length})</h4>
                              <div className="search-users-list">
                                {searchResults.users.map((user) => (
                                  <motion.div
                                    key={user._id || user.id}
                                    className="search-user-item"
                                    whileHover={{ x: 5 }}
                                    onClick={() => navigate(`/profile/${user._id || user.id}`)}
                                  >
                                    <div className="search-user-avatar">
                                      {user.profilePicture ? (
                                        <img src={user.profilePicture} alt={user.name} />
                                      ) : (
                                        <span>{user.name?.charAt(0).toUpperCase()}</span>
                                      )}
                                    </div>
                                    <div className="search-user-info">
                                      <p className="search-user-name">{user.name}</p>
                                      {user.bio && (
                                        <p className="search-user-bio">{user.bio.substring(0, 60)}...</p>
                                      )}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {searchResults.posts.length > 0 && (
                            <div className="search-section">
                              <h4>Posts ({searchResults.posts.length})</h4>
                              <div className="search-posts-list">
                                {searchResults.posts.slice(0, 5).map((post) => (
                                  <motion.div
                                    key={post._id}
                                    className="search-post-item"
                                    whileHover={{ x: 5 }}
                                    onClick={() => {
                                      // Scroll to post in feed
                                      const element = document.getElementById(`post-${post._id}`);
                                      if (element) {
                                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      }
                                    }}
                                  >
                                    <p className="search-post-text">{post.text?.substring(0, 100)}...</p>
                                    <span className="search-post-author">
                                      by {post.user?.name || 'Unknown'}
                                    </span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {!searchLoading && searchResults.posts.length === 0 && searchResults.users.length === 0 && (
                            <div className="search-empty">No results found</div>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CreatePost onPostCreated={handlePostCreated} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Recommendations />
          </motion.div>

          <div className="posts-section">
            {posts.length === 0 ? (
              <motion.div
                className="empty-state"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <FiStar className="empty-icon" />
                <p>No posts yet. Be the first to share something!</p>
              </motion.div>
            ) : (
              <div className="posts-list">
                {posts.map((post, index) => (
                  <motion.div
                    key={post._id}
                    id={`post-${post._id}`}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ y: -5 }}
                  >
                    <PostCard
                      post={post}
                      currentUser={user}
                      onPostUpdated={handlePostUpdated}
                      onPostDeleted={handlePostDeleted}
                      onPostLiked={handlePostLiked}
                      onCommentAdded={handleCommentAdded}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;


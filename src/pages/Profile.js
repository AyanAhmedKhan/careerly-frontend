import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import ProfileSections from '../components/ProfileSections';
import ProfileScore from '../components/ProfileScore';
import { FiSettings, FiEdit2, FiMail, FiCalendar, FiUserPlus, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Profile.css';
import SplitText from '../components/SplitText';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [connectionStatus, setConnectionStatus] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const checkConnectionStatus = useCallback((user) => {
    if (!currentUser || !user) return;
    if (user.connections?.some(conn => (conn._id || conn) === currentUser.id)) {
      setConnectionStatus('connected');
    } else if (user.connectionRequests?.some(req => 
      req.user?._id === currentUser.id && req.type === 'received'
    )) {
      setConnectionStatus('pending_received');
    } else if (user.connectionRequests?.some(req => 
      req.user?._id === currentUser.id && req.type === 'sent'
    )) {
      setConnectionStatus('pending_sent');
    } else {
      setConnectionStatus('not_connected');
    }
  }, [currentUser]);

  const fetchProfile = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/users/${id}`);
      setProfileUser(response.data);
      setEditName(response.data.name);
      setEditBio(response.data.bio || '');
      checkConnectionStatus(response.data);
    } catch (error) {
      toast.error('Failed to load profile');
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [id, API_URL, checkConnectionStatus]);

  const fetchUserPosts = useCallback(async () => {
    if (!id) return;
    try {
      const response = await axios.get(`${API_URL}/posts`);
      const userPosts = response.data.filter(
        (post) => post.user?._id === id || post.user === id
      );
      setPosts(userPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }, [id, API_URL]);

  useEffect(() => {
    // Defensive: if id is missing or literally the string 'undefined', redirect to current user's profile
    console.debug('Profile page id param:', id);
    if (!id || id === 'undefined') {
      if (currentUser?.id) {
        navigate(`/profile/${currentUser.id}`);
        return;
      } else {
        setLoading(false);
        return;
      }
    }

    if (id) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [id, currentUser, fetchProfile, fetchUserPosts, navigate]);
 

  

  const handleUpdateProfile = async () => {
    try {
      const response = await axios.put(`${API_URL}/users/${id}`, {
        name: editName,
        bio: editBio,
      });
      setProfileUser(response.data);
      setIsEditing(false);
      toast.success('Profile updated successfully');
      if (currentUser?.id === id) {
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
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

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="profile-container">
        <div className="empty-state">
          <p>User not found</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === id;

  const formatJoinDate = (date) => {
    if (!date) return 'Recently';
    const joinDate = new Date(date);
    return joinDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  

  const handleConnect = async () => {
    try {
      await axios.post(`${API_URL}/users/${id}/connect`);
      toast.success('Connection request sent!');
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send connection request');
    }
  };

  const handleAcceptConnection = async () => {
    try {
      await axios.post(`${API_URL}/users/${id}/accept`);
      toast.success('Connection accepted!');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to accept connection');
    }
  };

  const handleMessage = async () => {
    try {
      // Get or create conversation
      await axios.get(`${API_URL}/chat/conversations/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      // Navigate to messages page - the conversation will be selected automatically
      navigate('/messages');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start conversation');
    }
  };

  const handleProfileUpdate = async (updates) => {
    try {
      const response = await axios.put(`${API_URL}/users/${id}`, updates);
      setProfileUser(response.data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="profile-container">
      {/* Welcome animation */}
      <div style={{ marginBottom: '1rem' }}>
        <SplitText
          text="Welcome to Careerly – AI Powered"
          className="welcome-heading"
          delay={100}
          duration={0.6}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
          tag="h2"
          onLetterAnimationComplete={() => console.log('Welcome animation complete')}
        />
      </div>
      <motion.div
        className="profile-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="profile-cover">
          <div className="profile-avatar-large">
            {profileUser.profilePicture ? (
              <img src={profileUser.profilePicture} alt={profileUser.name} />
            ) : (
              <span>{profileUser.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>

        <div className="profile-info">
          {isEditing ? (
            <div className="edit-profile-form">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="edit-input"
                placeholder="Name"
              />
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="edit-textarea"
                placeholder="Bio"
                rows="3"
                maxLength={500}
              />
              <small>{editBio.length}/500 characters</small>
              <div className="edit-actions">
                <button onClick={() => setIsEditing(false)}>Cancel</button>
                <button onClick={handleUpdateProfile} className="save-btn">
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1>{profileUser.name}</h1>
              <div className="profile-meta">
                <span className="meta-item">
                  <FiMail />
                  {profileUser.email}
                </span>
                <span className="meta-item">
                  <FiCalendar />
                  Joined {formatJoinDate(profileUser.createdAt)}
                </span>
              </div>
              {profileUser.bio && (
                <motion.p 
                  className="profile-bio"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {profileUser.bio}
                </motion.p>
              )}
              <div className="profile-actions">
                {isOwnProfile ? (
                  <>
                    <motion.button
                      className="edit-profile-btn"
                      onClick={() => setIsEditing(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiEdit2 />
                      Edit Profile
                    </motion.button>
                    <Link to="/settings">
                      <motion.button
                        className="settings-profile-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiSettings />
                        Settings
                      </motion.button>
                    </Link>
                  </>
                ) : (
                  <>
                    {connectionStatus === 'not_connected' && (
                      <motion.button
                        className="connect-btn"
                        onClick={handleConnect}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiUserPlus />
                        Connect
                      </motion.button>
                    )}
                    {connectionStatus === 'pending_received' && (
                      <motion.button
                        className="accept-btn"
                        onClick={handleAcceptConnection}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Accept Request
                      </motion.button>
                    )}
                    {connectionStatus === 'pending_sent' && (
                      <button className="pending-btn" disabled>
                        Request Sent
                      </button>
                    )}
                    {connectionStatus === 'connected' && (
                      <>
                        <motion.button
                          className="message-btn"
                          onClick={handleMessage}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiMessageCircle />
                          Message
                        </motion.button>
                        <button className="connected-btn" disabled>
                          Connected
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {isOwnProfile && (
        <ProfileScore user={profileUser} />
      )}

      <ProfileSections
        profileUser={profileUser}
        isOwnProfile={isOwnProfile}
        onUpdate={handleProfileUpdate}
      />

      <div className="profile-posts">
        <h2 className="section-title">Posts ({posts.length})</h2>
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>No posts yet</p>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PostCard
                  post={post}
                  currentUser={currentUser}
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
  );
};

export default Profile;


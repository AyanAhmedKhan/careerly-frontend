import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUsers, FiBriefcase, FiRefreshCw, FiUserPlus, FiStar, FiTrendingUp, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Recommendations.css';

const Recommendations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('connections'); // 'connections' or 'jobs'
  const [connectionRecommendations, setConnectionRecommendations] = useState([]);
  const [jobRecommendations, setJobRecommendations] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (user && token) {
      fetchConnectionRecommendations();
    }
  }, [user, token]);

  const fetchConnectionRecommendations = async () => {
    setLoadingConnections(true);
    try {
      const response = await axios.get(`${API_URL}/ai/recommend-connections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConnectionRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Failed to fetch connection recommendations:', error);
      toast.error(error.response?.data?.message || 'Failed to load connection recommendations');
    } finally {
      setLoadingConnections(false);
    }
  };

  const fetchJobRecommendations = async () => {
    setLoadingJobs(true);
    try {
      const response = await axios.get(`${API_URL}/ai/recommend-jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Failed to fetch job recommendations:', error);
      toast.error(error.response?.data?.message || 'Failed to load job recommendations');
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'jobs' && jobRecommendations.length === 0) {
      fetchJobRecommendations();
    }
  };

  const handleConnect = async (userId) => {
    try {
      await axios.post(`${API_URL}/users/${userId}/connect`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Connection request sent!');
      // Remove from recommendations
      setConnectionRecommendations(prev => prev.filter(u => u._id !== userId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send connection request');
    }
  };

  if (!user) return null;

  return (
    <div className="recommendations-container">
      <motion.div
        className="recommendations-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="recommendations-header">
          <div className="header-content">
            <div className="header-icon">
              <FiTrendingUp />
            </div>
            <div>
              <h2>AI Recommendations</h2>
              <p>Personalized suggestions just for you</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="recommendations-tabs">
          <button
            className={`tab-btn ${activeTab === 'connections' ? 'active' : ''}`}
            onClick={() => handleTabChange('connections')}
          >
            <FiUsers />
            Connections ({connectionRecommendations.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => handleTabChange('jobs')}
          >
            <FiBriefcase />
            Jobs
          </button>
        </div>

        {/* Content */}
        <div className="recommendations-content">
          <AnimatePresence mode="wait">
            {activeTab === 'connections' ? (
              <motion.div
                key="connections"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="recommendations-list"
              >
                <div className="list-header">
                  <h3>People You May Know</h3>
                  <button
                    onClick={fetchConnectionRecommendations}
                    disabled={loadingConnections}
                    className="refresh-btn"
                    title="Refresh recommendations"
                  >
                    <FiRefreshCw className={loadingConnections ? 'spinning' : ''} />
                  </button>
                </div>

                {loadingConnections ? (
                  <div className="loading-state">
                    <FiLoader className="spinning" />
                    <p>Finding the best connections for you...</p>
                  </div>
                ) : connectionRecommendations.length === 0 ? (
                  <div className="empty-state">
                    <FiUsers />
                    <p>No connection recommendations available at the moment.</p>
                    <p className="empty-hint">Complete your profile to get better recommendations!</p>
                  </div>
                ) : (
                  <div className="connections-grid">
                    {connectionRecommendations.map((recommendedUser, index) => (
                      <motion.div
                        key={recommendedUser._id}
                        className="connection-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                      >
                        <div
                          className="connection-avatar"
                          onClick={() => navigate(`/profile/${recommendedUser._id}`)}
                        >
                          {recommendedUser.profilePicture ? (
                            <img src={recommendedUser.profilePicture} alt={recommendedUser.name} />
                          ) : (
                            <span>{recommendedUser.name?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="connection-info">
                          <h4 onClick={() => navigate(`/profile/${recommendedUser._id}`)}>
                            {recommendedUser.name}
                          </h4>
                          {recommendedUser.bio && (
                            <p className="connection-bio">{recommendedUser.bio.substring(0, 80)}...</p>
                          )}
                          {recommendedUser.skills && recommendedUser.skills.length > 0 && (
                            <div className="connection-skills">
                              {recommendedUser.skills.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="skill-tag">{skill}</span>
                              ))}
                              {recommendedUser.skills.length > 3 && (
                                <span className="skill-tag more">+{recommendedUser.skills.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <motion.button
                          className="connect-btn"
                          onClick={() => handleConnect(recommendedUser._id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiUserPlus />
                          Connect
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="jobs"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="recommendations-list"
              >
                <div className="list-header">
                  <h3>Job Opportunities</h3>
                  <button
                    onClick={fetchJobRecommendations}
                    disabled={loadingJobs}
                    className="refresh-btn"
                    title="Refresh recommendations"
                  >
                    <FiRefreshCw className={loadingJobs ? 'spinning' : ''} />
                  </button>
                </div>

                {loadingJobs ? (
                  <div className="loading-state">
                    <FiLoader className="spinning" />
                    <p>Finding the best job opportunities for you...</p>
                  </div>
                ) : jobRecommendations.length === 0 ? (
                  <div className="empty-state">
                    <FiBriefcase />
                    <p>No job recommendations available at the moment.</p>
                    <p className="empty-hint">Complete your profile to get personalized job suggestions!</p>
                  </div>
                ) : (
                  <div className="jobs-list">
                    {jobRecommendations.map((job, index) => (
                      <motion.div
                        key={index}
                        className="job-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                      >
                        <div className="job-header">
                          <div className="job-title-section">
                            <h4>{job.title}</h4>
                            <div className="job-meta">
                              <span className="job-company">{job.company}</span>
                              {job.industry && (
                                <>
                                  <span className="separator">•</span>
                                  <span className="job-industry">{job.industry}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="job-match-badge">
                            <FiStar />
                            <span>Good Match</span>
                          </div>
                        </div>

                        <p className="job-description">{job.description}</p>

                        {job.requiredSkills && job.requiredSkills.length > 0 && (
                          <div className="job-skills">
                            <span className="skills-label">Required Skills:</span>
                            <div className="skills-list">
                              {job.requiredSkills.map((skill, idx) => (
                                <span key={idx} className="skill-badge">{skill}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {job.matchReason && (
                          <div className="job-match-reason">
                            <FiTrendingUp />
                            <span>{job.matchReason}</span>
                          </div>
                        )}

                        <div className="job-actions">
                          <button className="apply-btn">View Details</button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Recommendations;


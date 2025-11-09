import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiSave, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ResumeAnalyzer from '../components/ResumeAnalyzer';
import './Settings.css';

const Settings = () => {
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`${API_URL}/users/${user.id}`, {
        name: formData.name,
        bio: formData.bio,
      });
      await fetchUser();
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Note: You might want to add a password change endpoint
      toast.success('Password change feature coming soon!');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <motion.div
        className="settings-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your account settings and preferences</p>
        </div>

        <div className="settings-sections">
          {/* Profile Settings */}
          <motion.div
            className="settings-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="section-header">
              <FiUser />
              <h2>Profile Information</h2>
            </div>
            <form onSubmit={handleProfileUpdate} className="settings-form">
              <div className="form-group">
                <label>
                  <FiUser />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <FiMail />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="disabled-input"
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label>
                  <FiEdit2 />
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows="4"
                  maxLength={500}
                />
                <small>{formData.bio.length}/500 characters</small>
              </div>

              <motion.button
                type="submit"
                className="save-btn"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiSave />
                {loading ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </form>
          </motion.div>

          {/* Password Settings */}
          <motion.div
            className="settings-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="section-header">
              <FiLock />
              <h2>Change Password</h2>
            </div>
            <form onSubmit={handlePasswordChange} className="settings-form">
              <div className="form-group">
                <label>
                  <FiLock />
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-group">
                <label>
                  <FiLock />
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label>
                  <FiLock />
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  minLength={6}
                />
              </div>

              <motion.button
                type="submit"
                className="save-btn"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiLock />
                {loading ? 'Updating...' : 'Update Password'}
              </motion.button>
            </form>
          </motion.div>

          {/* AI Resume Analyzer */}
          <motion.div
            className="settings-section resume-analyzer-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ResumeAnalyzer />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;


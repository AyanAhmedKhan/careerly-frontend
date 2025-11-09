import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiHome, FiSettings, FiMessageCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Notifications from './Notifications';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-container">
        <Link to="/feed" className="navbar-logo">
          <span className="logo-icon">C</span>
          <span className="logo-text">Careerly Portal</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/feed" className="navbar-item">
            <FiHome className="navbar-icon" />
            <span>Feed</span>
          </Link>

          <Notifications />

          <Link to="/messages" className="navbar-item">
            <FiMessageCircle className="navbar-icon" />
            <span>Messages</span>
          </Link>

          <Link to={`/profile/${user.id}`} className="navbar-item">
            <FiUser className="navbar-icon" />
            <span>{user.name}</span>
          </Link>

          <Link to="/settings" className="navbar-item">
            <FiSettings className="navbar-icon" />
            <span>Settings</span>
          </Link>

          <button onClick={handleLogout} className="navbar-item logout-btn">
            <FiLogOut className="navbar-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;


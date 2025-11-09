import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/auth/me`);
      // Normalize user shape: some endpoints return { _id } while others return { id }
      const userData = response.data;
      if (userData && userData._id && !userData.id) {
        userData.id = userData._id;
      }
      setUser(userData);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = async (email, password) => {
    try {
      console.log('Attempting login to:', `${API_URL}/auth/login`);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      toast.success('Logged in successfully!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed. Check if backend is running.';
      toast.error(message);
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        toast.error('Cannot connect to server. Make sure backend is running on port 5000.');
      }
      return { success: false, message };
    }
  };

  const signup = async (name, email, password) => {
    try {
      console.log('Attempting signup to:', `${API_URL}/auth/register`);
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      const message = error.response?.data?.message || error.message || 'Signup failed. Check if backend is running.';
      toast.error(message);
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        toast.error('Cannot connect to server. Make sure backend is running on port 5000.');
      }
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully!');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


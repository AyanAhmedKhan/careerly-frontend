import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import CareerChatbot from './components/CareerChatbot';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Messages from './pages/Messages';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return user ? <Navigate to="/feed" /> : children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '10px',
                padding: '16px',
              },
            }}
          />
          <Navbar />
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
            <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/feed" />} />
          </Routes>
          <CareerChatbot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;


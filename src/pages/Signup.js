import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiUserPlus, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({ passwordMatch: '', passwordLen: '', email: '' });
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(formData.email), [formData.email]);
  const passwordStrength = useMemo(() => {
    const p = formData.password || '';
    let score = 0;
    if (p.length >= 6) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score; // 0-4
  }, [formData.password]);

  const validate = () => {
    const newErrors = { passwordMatch: '', passwordLen: '', email: '' };
    if (!emailValid) newErrors.email = 'Please enter a valid email address.';
    if (formData.password.length < 6) newErrors.passwordLen = 'Use at least 6 characters.';
    if (formData.password !== formData.confirmPassword) newErrors.passwordMatch = 'Passwords do not match.';
    setErrors(newErrors);
    return !newErrors.email && !newErrors.passwordLen && !newErrors.passwordMatch;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!acceptTerms) return;

    setLoading(true);

    const result = await signup(formData.name, formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      navigate('/feed');
    }
  };

  return (
    <div className="auth-container">
      <motion.div
        className="auth-left-panel"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="auth-left-content">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Join Careerly Portal
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Build your professional network, discover opportunities, and let AI guide your career journey.
          </motion.p>
        </div>
      </motion.div>

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="auth-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
            <div className="brand-logo" aria-hidden>
              <motion.div className="logo-mark" animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.06, 1.02, 1] }} transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}>🚀</motion.div>
            </div>
            <h1>Create Account</h1>
          <p>Join Careerly Portal and connect with professionals</p>
        </motion.div>

  <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <motion.div
            className="form-group inline-icon"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <FiUser className="input-icon" aria-hidden />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </motion.div>

          <motion.div
            className="form-group inline-icon"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <FiMail className="input-icon" aria-hidden />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </motion.div>

          <motion.div
            className="form-group inline-icon"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <FiLock className="input-icon" aria-hidden />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="auth-input"
            />
            <button
              type="button"
              className="input-append"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </motion.div>

          {/* Password helper + strength meter */}
          <div className="helper-row">
            <span className="helper-text">Use 6+ chars with numbers, symbols & uppercase.</span>
            <div className={`strength-meter level-${passwordStrength}`} aria-hidden>
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
            </div>
          </div>
          {errors.passwordLen && <div className="error-text">{errors.passwordLen}</div>}

          <motion.div
            className="form-group inline-icon"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <FiLock className="input-icon" aria-hidden />
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="auth-input"
            />
            <button
              type="button"
              className="input-append"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
              onClick={() => setShowConfirm((v) => !v)}
            >
              {showConfirm ? <FiEyeOff /> : <FiEye />}
            </button>
          </motion.div>
          {errors.passwordMatch && <div className="error-text">{errors.passwordMatch}</div>}

          {/* Terms and privacy */}
          <label className="terms-row">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
            />
            <span>
              I agree to the{' '}
              <button type="button" className="auth-link link-button">Terms</button>
              {' '}and{' '}
              <button type="button" className="auth-link link-button">Privacy Policy</button>.
            </span>
          </label>

          <motion.button
            type="submit"
            className="auth-button"
            disabled={loading || !acceptTerms || !emailValid || !!errors.passwordLen || !!errors.passwordMatch}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {loading ? (
              <div className="spinner-small"></div>
            ) : (
              <>
                <FiUserPlus />
                Create Account
              </>
            )}
          </motion.button>
        </form>

        <motion.p
          className="auth-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <FiCheckCircle style={{ verticalAlign: 'middle', marginRight: 6, color: '#00A0DC' }} />
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Signup;


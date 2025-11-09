import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiCheckCircle } from 'react-icons/fi';
import './ProfileScore.css';

const ProfileScore = ({ user }) => {
  // Helper to determine level based on percentage - declare before use to avoid temporal dead zone
  function getLevel(percentage) {
    if (percentage >= 90) return { name: 'Expert', color: '#FF7A00' };
    if (percentage >= 70) return { name: 'Professional', color: '#0077B5' };
    if (percentage >= 50) return { name: 'Intermediate', color: '#00A0DC' };
    return { name: 'Beginner', color: '#999' };
  }

  const score = useMemo(() => {
    let totalScore = 0;
    let maxScore = 0;

    // Bio (0-20 points)
    maxScore += 20;
    if (user.bio && user.bio.length > 0) {
      totalScore += Math.min(20, (user.bio.length / 25) * 20);
    }

    // Profile Picture (0-10 points)
    maxScore += 10;
    if (user.profilePicture) {
      totalScore += 10;
    }

    // Experience (0-30 points)
    maxScore += 30;
    if (user.experience && user.experience.length > 0) {
      totalScore += Math.min(30, user.experience.length * 10);
    }

    // Education (0-20 points)
    maxScore += 20;
    if (user.education && user.education.length > 0) {
      totalScore += Math.min(20, user.education.length * 10);
    }

    // Skills (0-20 points)
    maxScore += 20;
    if (user.skills && user.skills.length > 0) {
      totalScore += Math.min(20, user.skills.length * 2);
    }

    const percentage = Math.round((totalScore / maxScore) * 100);
    return {
      score: totalScore,
      maxScore,
      percentage,
      level: getLevel(percentage),
    };
  }, [user]);

  

  const suggestions = useMemo(() => {
    const suggestions = [];
    
    if (!user.bio || user.bio.length < 50) {
      suggestions.push('Add a detailed bio to showcase your professional background');
    }
    
    if (!user.profilePicture) {
      suggestions.push('Upload a profile picture to make your profile more personal');
    }
    
    if (!user.experience || user.experience.length === 0) {
      suggestions.push('Add your work experience to highlight your career journey');
    }
    
    if (!user.education || user.education.length === 0) {
      suggestions.push('Add your education to complete your professional profile');
    }
    
    if (!user.skills || user.skills.length < 5) {
      suggestions.push('Add more skills to showcase your expertise');
    }

    return suggestions;
  }, [user]);

  return (
    <motion.div
      className="profile-score-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="score-header">
        <FiAward className="score-icon" />
        <h3>Profile Strength</h3>
      </div>

      <div className="score-display">
        <motion.div
          className="score-circle"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          <svg className="score-ring" viewBox="0 0 100 100">
            <circle
              className="score-ring-bg"
              cx="50"
              cy="50"
              r="45"
            />
            <motion.circle
              className="score-ring-progress"
              cx="50"
              cy="50"
              r="45"
              stroke={score.level.color}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: score.percentage / 100 }}
              transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            />
          </svg>
          <div className="score-percentage">
            <span className="score-number">{score.percentage}%</span>
            <span className="score-level">{score.level.name}</span>
          </div>
        </motion.div>

        <div className="score-breakdown">
          <div className="breakdown-item">
            <span className="breakdown-label">Bio</span>
            <div className="breakdown-bar">
              <motion.div
                className="breakdown-fill"
                initial={{ width: 0 }}
                animate={{ width: `${user.bio ? Math.min(100, (user.bio.length / 25) * 100) : 0}%` }}
                transition={{ delay: 0.7 }}
              />
            </div>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Profile Picture</span>
            <div className="breakdown-bar">
              <motion.div
                className="breakdown-fill"
                initial={{ width: 0 }}
                animate={{ width: user.profilePicture ? '100%' : '0%' }}
                transition={{ delay: 0.8 }}
              />
            </div>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Experience</span>
            <div className="breakdown-bar">
              <motion.div
                className="breakdown-fill"
                initial={{ width: 0 }}
                animate={{ width: `${user.experience?.length > 0 ? Math.min(100, user.experience.length * 33) : 0}%` }}
                transition={{ delay: 0.9 }}
              />
            </div>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Education</span>
            <div className="breakdown-bar">
              <motion.div
                className="breakdown-fill"
                initial={{ width: 0 }}
                animate={{ width: `${user.education?.length > 0 ? Math.min(100, user.education.length * 50) : 0}%` }}
                transition={{ delay: 1.0 }}
              />
            </div>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Skills</span>
            <div className="breakdown-bar">
              <motion.div
                className="breakdown-fill"
                initial={{ width: 0 }}
                animate={{ width: `${user.skills?.length > 0 ? Math.min(100, user.skills.length * 10) : 0}%` }}
                transition={{ delay: 1.1 }}
              />
            </div>
          </div>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="score-suggestions">
          <h4>Improve Your Profile</h4>
          <ul>
            {suggestions.map((suggestion, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
              >
                <FiCheckCircle className="suggestion-icon" />
                {suggestion}
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default ProfileScore;


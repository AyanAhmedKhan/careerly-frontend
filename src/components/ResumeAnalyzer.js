import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FiFileText, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiTarget, FiLoader, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './ResumeAnalyzer.css';

const ResumeAnalyzer = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showJobDescription, setShowJobDescription] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast.error('Please enter your resume text');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/ai/analyze-resume`,
        {
          resumeText: resumeText.trim(),
          jobDescription: jobDescription.trim() || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAnalysis(response.data);
      toast.success('Resume analyzed successfully!');
    } catch (error) {
      console.error('Resume analysis error:', error);
      toast.error(error.response?.data?.message || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResumeText('');
    setJobDescription('');
    setAnalysis(null);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#FF7A00';
    return '#dc3545';
  };

  return (
    <div className="resume-analyzer-container">
      <motion.div
        className="resume-analyzer-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="analyzer-header">
          <div className="header-icon">
            <FiFileText />
          </div>
          <div>
            <h2>AI Resume Analyzer</h2>
            <p>Get instant feedback on your resume with AI-powered analysis</p>
          </div>
        </div>

        <div className="analyzer-form">
          <div className="form-section">
            <label>
              <FiFileText />
              Paste Your Resume Text
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume content here... (Name, Contact, Experience, Education, Skills, etc.)"
              rows={12}
              className="resume-textarea"
            />
            <small>{resumeText.length} characters</small>
          </div>

          <div className="job-description-toggle">
            <button
              type="button"
              onClick={() => setShowJobDescription(!showJobDescription)}
              className="toggle-btn"
            >
              {showJobDescription ? 'Hide' : 'Add'} Job Description (Optional)
            </button>
            <p className="toggle-hint">
              Add a job description to get tailored feedback
            </p>
          </div>

          <AnimatePresence>
            {showJobDescription && (
              <motion.div
                className="form-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label>
                  <FiTarget />
                  Job Description (Optional)
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here for tailored analysis..."
                  rows={6}
                  className="resume-textarea"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="analyzer-actions">
            <motion.button
              onClick={handleAnalyze}
              disabled={loading || !resumeText.trim()}
              className="analyze-btn"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <>
                  <FiLoader className="spinning" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FiTrendingUp />
                  Analyze Resume
                </>
              )}
            </motion.button>

            {resumeText && (
              <button onClick={handleClear} className="clear-btn">
                <FiX />
                Clear
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {analysis && (
            <motion.div
              className="analysis-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="results-header">
                <h3>Analysis Results</h3>
                <div className="overall-score">
                  <div className="score-circle" style={{ borderColor: getScoreColor(analysis.overallScore) }}>
                    <span style={{ color: getScoreColor(analysis.overallScore) }}>
                      {analysis.overallScore}
                    </span>
                  </div>
                  <p>Overall Score</p>
                </div>
              </div>

              {analysis.summary && (
                <div className="analysis-section summary-section">
                  <h4>
                    <FiFileText />
                    Summary
                  </h4>
                  <p>{analysis.summary}</p>
                </div>
              )}

              {analysis.strengths && analysis.strengths.length > 0 && (
                <div className="analysis-section strengths-section">
                  <h4>
                    <FiCheckCircle />
                    Strengths
                  </h4>
                  <ul>
                    {analysis.strengths.map((strength, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {strength}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                <div className="analysis-section weaknesses-section">
                  <h4>
                    <FiAlertCircle />
                    Areas for Improvement
                  </h4>
                  <ul>
                    {analysis.weaknesses.map((weakness, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {weakness}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.missingSections && analysis.missingSections.length > 0 && (
                <div className="analysis-section missing-sections">
                  <h4>
                    <FiAlertCircle />
                    Missing Sections
                  </h4>
                  <ul>
                    {analysis.missingSections.map((section, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {section}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.atsCompatibility && (
                <div className="analysis-section ats-section">
                  <h4>
                    <FiTarget />
                    ATS Compatibility
                    <span className="ats-score" style={{ color: getScoreColor(analysis.atsCompatibility.score) }}>
                      {analysis.atsCompatibility.score}%
                    </span>
                  </h4>
                  {analysis.atsCompatibility.issues && analysis.atsCompatibility.issues.length > 0 && (
                    <div className="ats-issues">
                      <h5>Issues:</h5>
                      <ul>
                        {analysis.atsCompatibility.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.atsCompatibility.suggestions && analysis.atsCompatibility.suggestions.length > 0 && (
                    <div className="ats-suggestions">
                      <h5>Suggestions:</h5>
                      <ul>
                        {analysis.atsCompatibility.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {analysis.improvements && analysis.improvements.length > 0 && (
                <div className="analysis-section improvements-section">
                  <h4>
                    <FiTrendingUp />
                    Detailed Improvements
                  </h4>
                  <div className="improvements-list">
                    {analysis.improvements.map((improvement, index) => (
                      <motion.div
                        key={index}
                        className="improvement-item"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <span className="improvement-category">{improvement.category}:</span>
                        <span className="improvement-suggestion">{improvement.suggestion}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ResumeAnalyzer;


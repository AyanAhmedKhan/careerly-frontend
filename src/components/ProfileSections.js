import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBriefcase, FiBook, FiAward, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import './ProfileSections.css';

const ProfileSections = ({ profileUser, isOwnProfile, onUpdate }) => {
  const [editingSection, setEditingSection] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({});

  const handleAdd = (section) => {
    setEditingSection(section);
    setEditingIndex(null);
    setFormData(getDefaultData(section));
  };

  const handleEdit = (section, index, item) => {
    setEditingSection(section);
    setEditingIndex(index);
    setFormData(item);
  };

  const handleDelete = async (section, index) => {
    const updated = [...(profileUser[section] || [])];
    updated.splice(index, 1);
    await onUpdate({ [section]: updated });
  };

  const handleSave = async () => {
    if (editingSection === 'skills') {
      // For skills, add the skill string directly
      if (formData.skill && formData.skill.trim()) {
        const updated = [...(profileUser.skills || [])];
        if (!updated.includes(formData.skill.trim())) {
          updated.push(formData.skill.trim());
          await onUpdate({ skills: updated });
        }
      }
    } else {
      const updated = [...(profileUser[editingSection] || [])];
      
      if (editingIndex !== null) {
        updated[editingIndex] = formData;
      } else {
        updated.push(formData);
      }

      await onUpdate({ [editingSection]: updated });
    }
    
    setEditingSection(null);
    setEditingIndex(null);
    setFormData({});
  };

  const getDefaultData = (section) => {
    if (section === 'experience') {
      return {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      };
    } else if (section === 'education') {
      return {
        school: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        description: '',
      };
    }
    return {};
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="profile-sections">
      {/* Experience Section */}
      <motion.section
        className="profile-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="section-header">
          <FiBriefcase className="section-icon" />
          <h2>Experience</h2>
          {isOwnProfile && (
            <motion.button
              className="add-btn"
              onClick={() => handleAdd('experience')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus />
              Add Experience
            </motion.button>
          )}
        </div>

        <div className="section-content">
          {profileUser.experience?.length > 0 ? (
            profileUser.experience.map((exp, index) => (
              <motion.div
                key={index}
                className="section-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <div className="item-content">
                  <h3>{exp.title}</h3>
                  <p className="item-company">{exp.company}</p>
                  <p className="item-duration">
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                    {exp.location && ` • ${exp.location}`}
                  </p>
                  {exp.description && <p className="item-description">{exp.description}</p>}
                </div>
                {isOwnProfile && (
                  <div className="item-actions">
                    <button onClick={() => handleEdit('experience', index, exp)}>
                      <FiEdit2 />
                    </button>
                    <button onClick={() => handleDelete('experience', index)}>
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <p className="empty-section">No experience added yet</p>
          )}
        </div>
      </motion.section>

      {/* Education Section */}
      <motion.section
        className="profile-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="section-header">
          <FiBook className="section-icon" />
          <h2>Education</h2>
          {isOwnProfile && (
            <motion.button
              className="add-btn"
              onClick={() => handleAdd('education')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus />
              Add Education
            </motion.button>
          )}
        </div>

        <div className="section-content">
          {profileUser.education?.length > 0 ? (
            profileUser.education.map((edu, index) => (
              <motion.div
                key={index}
                className="section-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <div className="item-content">
                  <h3>{edu.degree}</h3>
                  <p className="item-company">{edu.school}</p>
                  {edu.field && <p className="item-field">{edu.field}</p>}
                  <p className="item-duration">
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </p>
                  {edu.description && <p className="item-description">{edu.description}</p>}
                </div>
                {isOwnProfile && (
                  <div className="item-actions">
                    <button onClick={() => handleEdit('education', index, edu)}>
                      <FiEdit2 />
                    </button>
                    <button onClick={() => handleDelete('education', index)}>
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <p className="empty-section">No education added yet</p>
          )}
        </div>
      </motion.section>

      {/* Skills Section */}
      <motion.section
        className="profile-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="section-header">
          <FiAward className="section-icon" />
          <h2>Skills</h2>
          {isOwnProfile && (
            <motion.button
              className="add-btn"
              onClick={() => handleAdd('skills')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus />
              Add Skill
            </motion.button>
          )}
        </div>

        <div className="skills-content">
          {profileUser.skills?.length > 0 ? (
            <div className="skills-list">
              {profileUser.skills.map((skill, index) => (
                <motion.span
                  key={index}
                  className="skill-tag"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.1 }}
                >
                  {skill}
                  {isOwnProfile && (
                    <button
                      className="skill-remove"
                      onClick={() => {
                        const updated = [...profileUser.skills];
                        updated.splice(index, 1);
                        onUpdate({ skills: updated });
                      }}
                    >
                      <FiX />
                    </button>
                  )}
                </motion.span>
              ))}
            </div>
          ) : (
            <p className="empty-section">No skills added yet</p>
          )}
        </div>
      </motion.section>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingSection && (
          <motion.div
            className="edit-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setEditingSection(null);
              setEditingIndex(null);
              setFormData({});
            }}
          >
            <motion.div
              className="edit-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>
                  {editingIndex !== null ? 'Edit' : 'Add'}{' '}
                  {editingSection === 'experience' ? 'Experience' : editingSection === 'education' ? 'Education' : 'Skill'}
                </h3>
                <button
                  className="close-modal"
                  onClick={() => {
                    setEditingSection(null);
                    setEditingIndex(null);
                    setFormData({});
                  }}
                >
                  <FiX />
                </button>
              </div>

              <div className="modal-content">
                {editingSection === 'experience' && (
                  <ExperienceForm formData={formData} setFormData={setFormData} />
                )}
                {editingSection === 'education' && (
                  <EducationForm formData={formData} setFormData={setFormData} />
                )}
                {editingSection === 'skills' && (
                  <SkillForm formData={formData} setFormData={setFormData} />
                )}
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setEditingSection(null);
                    setEditingIndex(null);
                    setFormData({});
                  }}
                >
                  Cancel
                </button>
                <button className="save-btn" onClick={handleSave}>
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ExperienceForm = ({ formData, setFormData }) => (
  <div className="form-fields">
    <input
      type="text"
      placeholder="Job Title *"
      value={formData.title || ''}
      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      required
    />
    <input
      type="text"
      placeholder="Company *"
      value={formData.company || ''}
      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
      required
    />
    <input
      type="text"
      placeholder="Location"
      value={formData.location || ''}
      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
    />
    <div className="date-row">
      <input
        type="month"
        placeholder="Start Date"
        value={formData.startDate || ''}
        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
      />
      <input
        type="month"
        placeholder="End Date"
        value={formData.endDate || ''}
        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
        disabled={formData.current}
      />
    </div>
    <label className="checkbox-label">
      <input
        type="checkbox"
        checked={formData.current || false}
        onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
      />
      I currently work here
    </label>
    <textarea
      placeholder="Description"
      value={formData.description || ''}
      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      rows="4"
    />
  </div>
);

const EducationForm = ({ formData, setFormData }) => (
  <div className="form-fields">
    <input
      type="text"
      placeholder="School *"
      value={formData.school || ''}
      onChange={(e) => setFormData({ ...formData, school: e.target.value })}
      required
    />
    <input
      type="text"
      placeholder="Degree *"
      value={formData.degree || ''}
      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
      required
    />
    <input
      type="text"
      placeholder="Field of Study"
      value={formData.field || ''}
      onChange={(e) => setFormData({ ...formData, field: e.target.value })}
    />
    <div className="date-row">
      <input
        type="month"
        placeholder="Start Date"
        value={formData.startDate || ''}
        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
      />
      <input
        type="month"
        placeholder="End Date"
        value={formData.endDate || ''}
        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
      />
    </div>
    <textarea
      placeholder="Description"
      value={formData.description || ''}
      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      rows="4"
    />
  </div>
);

const SkillForm = ({ formData, setFormData }) => (
  <div className="form-fields">
    <input
      type="text"
      placeholder="Skill name (e.g., JavaScript, React, Python)"
      value={formData.skill || ''}
      onChange={(e) => setFormData({ skill: e.target.value })}
      autoFocus
    />
    <small style={{ color: '#666', fontSize: '0.85rem' }}>
      Press Enter or click Save to add the skill
    </small>
  </div>
);

export default ProfileSections;


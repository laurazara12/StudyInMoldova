import React, { useState, useEffect } from 'react';
import { FaGraduationCap, FaLanguage, FaCalendarAlt, FaMoneyBillWave, FaHome } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../config/api.config';
import './study-plan.css';

const StudyPlan = ({ userData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    desired_study_level: '',
    preferred_study_field: '',
    desired_academic_year: '',
    preferred_study_language: '',
    estimated_budget: '',
    accommodation_preferences: '',
    study_goals: '',
    english_level: '',
    additional_languages: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userData) {
      setFormData({
        desired_study_level: userData.desired_study_level || '',
        preferred_study_field: userData.preferred_study_field || '',
        desired_academic_year: userData.desired_academic_year || '',
        preferred_study_language: userData.preferred_study_language || '',
        estimated_budget: userData.estimated_budget || '',
        accommodation_preferences: userData.accommodation_preferences || '',
        study_goals: userData.study_goals || '',
        english_level: userData.english_level || '',
        additional_languages: userData.additional_languages || ''
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/users/study-plan`,
        formData,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        onUpdate(response.data.user);
        setIsEditing(false);
      } else {
        setError('Nu s-a putut actualiza planul de studii');
      }
    } catch (err) {
      setError('A apărut o eroare la salvarea planului de studii');
      console.error('Error updating study plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    const fields = [
      'desired_study_level',
      'preferred_study_field',
      'desired_academic_year',
      'preferred_study_language',
      'estimated_budget',
      'accommodation_preferences',
      'study_goals',
      'english_level'
    ];

    const filledFields = fields.filter(field => formData[field] && formData[field].trim() !== '');
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const renderField = (label, name, type = 'text', options = null) => {
    if (isEditing) {
      if (type === 'select' && options) {
        return (
          <div className="form-group">
            <label>{label}</label>
            <select
              name={name}
              value={formData[name]}
              onChange={handleChange}
              required
            >
              <option value="">Selectează...</option>
              {options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      }
      return (
        <div className="form-group">
          <label>{label}</label>
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            required
          />
        </div>
      );
    }

    return (
      <div className="info-item">
        <label>{label}</label>
        <span>{formData[name] || 'Nespecificat'}</span>
      </div>
    );
  };

  return (
    <div className="study-plan-section">
      <div className="section-header">
        <h2>Planul meu de studii</h2>
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
          <span className="progress-text">{calculateProgress()}% completat</span>
        </div>
        {!isEditing && (
          <button 
            className="edit-button"
            onClick={() => setIsEditing(true)}
          >
            Editează planul
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="study-plan-form">
          <div className="form-section">
            <h3>
              <FaGraduationCap /> Obiective de studii
            </h3>
            {renderField('Nivel de studii dorit', 'desired_study_level', 'select', [
              { value: 'Bachelor', label: 'Licență' },
              { value: 'Master', label: 'Master' },
              { value: 'PhD', label: 'Doctorat' }
            ])}
            {renderField('Domeniu preferat', 'preferred_study_field')}
            {renderField('An academic dorit', 'desired_academic_year')}
            {renderField('Obiective de studiu', 'study_goals', 'textarea')}
          </div>

          <div className="form-section">
            <h3>
              <FaLanguage /> Language Skills
            </h3>
            {renderField('English Level', 'english_level', 'select', [
              { value: 'A1', label: 'A1 - Beginner' },
              { value: 'A2', label: 'A2 - Elementary' },
              { value: 'B1', label: 'B1 - Intermediate' },
              { value: 'B2', label: 'B2 - Upper Intermediate' },
              { value: 'C1', label: 'C1 - Advanced' },
              { value: 'C2', label: 'C2 - Expert' }
            ])}
            {renderField('Other Languages', 'additional_languages')}
            {renderField('Preferred Study Language', 'preferred_study_language', 'select', [
              { value: 'romanian', label: 'Romanian' },
              { value: 'english', label: 'English' },
              { value: 'russian', label: 'Russian' }
            ])}
          </div>

          <div className="form-section">
            <h3>
              <FaMoneyBillWave /> Financial Details
            </h3>
            {renderField('Estimated Budget (EUR)', 'estimated_budget', 'number')}
          </div>

          <div className="form-section">
            <h3>
              <FaHome /> Accommodation
            </h3>
            {renderField('Accommodation Preferences', 'accommodation_preferences', 'select', [
              { value: 'dormitory', label: 'Student Dormitory' },
              { value: 'apartment', label: 'Apartment' },
              { value: 'hostel', label: 'Hostel' }
            ])}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-button"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </form>
      ) : (
        <div className="study-plan-info">
          <div className="info-section">
            <h3>
              <FaGraduationCap /> Obiective de studii
            </h3>
            {renderField('Nivel de studii dorit', 'desired_study_level')}
            {renderField('Domeniu preferat', 'preferred_study_field')}
            {renderField('An academic dorit', 'desired_academic_year')}
            {renderField('Obiective de studiu', 'study_goals')}
          </div>

          <div className="info-section">
            <h3>
              <FaLanguage /> Language Skills
            </h3>
            {renderField('English Level', 'english_level')}
            {renderField('Other Languages', 'additional_languages')}
            {renderField('Preferred Study Language', 'preferred_study_language')}
          </div>

          <div className="info-section">
            <h3>
              <FaMoneyBillWave /> Financial Details
            </h3>
            {renderField('Estimated Budget', 'estimated_budget')}
          </div>

          <div className="info-section">
            <h3>
              <FaHome /> Accommodation
            </h3>
            {renderField('Accommodation Preferences', 'accommodation_preferences')}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlan; 
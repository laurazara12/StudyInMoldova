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
              <FaLanguage /> Competențe lingvistice
            </h3>
            {renderField('Nivel de engleză', 'english_level', 'select', [
              { value: 'A1', label: 'A1 - Începător' },
              { value: 'A2', label: 'A2 - Elementar' },
              { value: 'B1', label: 'B1 - Intermediar' },
              { value: 'B2', label: 'B2 - Intermediar superior' },
              { value: 'C1', label: 'C1 - Avansat' },
              { value: 'C2', label: 'C2 - Expert' }
            ])}
            {renderField('Alte limbi cunoscute', 'additional_languages')}
            {renderField('Limba de studiu preferată', 'preferred_study_language', 'select', [
              { value: 'romanian', label: 'Română' },
              { value: 'english', label: 'Engleză' },
              { value: 'russian', label: 'Rusă' }
            ])}
          </div>

          <div className="form-section">
            <h3>
              <FaMoneyBillWave /> Detalii financiare
            </h3>
            {renderField('Buget estimat (EUR)', 'estimated_budget', 'number')}
          </div>

          <div className="form-section">
            <h3>
              <FaHome /> Cazare
            </h3>
            {renderField('Preferințe cazare', 'accommodation_preferences', 'select', [
              { value: 'dormitory', label: 'Cămin studențesc' },
              { value: 'apartment', label: 'Apartament' },
              { value: 'hostel', label: 'Hostel' }
            ])}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => setIsEditing(false)}
            >
              Anulează
            </button>
            <button 
              type="submit" 
              className="save-button"
              disabled={loading}
            >
              {loading ? 'Se salvează...' : 'Salvează planul'}
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
              <FaLanguage /> Competențe lingvistice
            </h3>
            {renderField('Nivel de engleză', 'english_level')}
            {renderField('Alte limbi cunoscute', 'additional_languages')}
            {renderField('Limba de studiu preferată', 'preferred_study_language')}
          </div>

          <div className="info-section">
            <h3>
              <FaMoneyBillWave /> Detalii financiare
            </h3>
            {renderField('Buget estimat', 'estimated_budget')}
          </div>

          <div className="info-section">
            <h3>
              <FaHome /> Cazare
            </h3>
            {renderField('Preferințe cazare', 'accommodation_preferences')}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlan; 
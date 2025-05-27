import React, { useState, useEffect } from 'react';
import './plan-your-studies-tab.css';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { API_BASE_URL, getAuthHeaders } from '../../../config/api.config';

const PlanYourStudies = ({ userData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    desired_study_level: '',
    preferred_study_field: '',
    desired_academic_year: '',
    preferred_study_language: '',
    estimated_budget: '',
    accommodation_preferences: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const { setUserData, updateProfile } = useAuth();

  useEffect(() => {
    if (userData) {
      setFormData({
        desired_study_level: userData.desired_study_level || '',
        preferred_study_field: userData.preferred_study_field || '',
        desired_academic_year: userData.desired_academic_year || '',
        preferred_study_language: userData.preferred_study_language || '',
        estimated_budget: userData.estimated_budget || '',
        accommodation_preferences: userData.accommodation_preferences || ''
      });
      setIsLoading(false);
    }
  }, [userData]);

  const validateField = (name, value) => {
    switch (name) {
      case 'desired_study_level':
        return value ? '' : 'Nivelul de studiu este obligatoriu';
      case 'preferred_study_field':
        return value ? '' : 'Domeniul de studiu este obligatoriu';
      case 'desired_academic_year':
        return value ? '' : 'Anul academic este obligatoriu';
      case 'preferred_study_language':
        return value ? '' : 'Limba de studiu este obligatorie';
      case 'estimated_budget':
        if (!value) return 'Bugetul este obligatoriu';
        if (isNaN(value) || Number(value) <= 0) return 'Bugetul trebuie să fie un număr pozitiv';
        return '';
      case 'accommodation_preferences':
        return value ? '' : 'Preferințele de cazare sunt obligatorii';
      default:
        return '';
    }
  };

  const calculateProfileProgress = () => {
    const fields = [
      { name: 'phone', weight: 1 },
      { name: 'date_of_birth', weight: 1 },
      { name: 'country_of_origin', weight: 1 },
      { name: 'nationality', weight: 1 },
      { name: 'desired_study_level', weight: 2 },
      { name: 'preferred_study_field', weight: 2 },
      { name: 'desired_academic_year', weight: 2 },
      { name: 'preferred_study_language', weight: 2 },
      { name: 'estimated_budget', weight: 1.5 },
      { name: 'accommodation_preferences', weight: 1.5 }
    ];

    const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);
    let completedWeight = 0;

    fields.forEach(field => {
      const value = userData?.[field.name];
      if (value && value.toString().trim() !== '') {
        if (field.name === 'estimated_budget') {
          const budget = Number(value);
          if (!isNaN(budget) && budget > 0) {
            completedWeight += field.weight;
          }
        } else {
          completedWeight += field.weight;
        }
      }
    });

    return Math.round((completedWeight / totalWeight) * 100);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    const error = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditStudyPlan = async () => {
    if (!validateForm()) {
      toast.error('Vă rugăm să completați toate câmpurile obligatorii corect');
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/users/profile`,
        formData,
        { headers: getAuthHeaders() }
      );

      if (response.data?.success) {
        const updatedUserData = response.data.data;
        setIsEditing(false);
        setFormData({
          desired_study_level: updatedUserData.desired_study_level || '',
          preferred_study_field: updatedUserData.preferred_study_field || '',
          desired_academic_year: updatedUserData.desired_academic_year || '',
          preferred_study_language: updatedUserData.preferred_study_language || '',
          estimated_budget: updatedUserData.estimated_budget || '',
          accommodation_preferences: updatedUserData.accommodation_preferences || ''
        });
        
        if (updateProfile) {
          updateProfile(updatedUserData);
        }
        
        toast.success('Planul de studii a fost actualizat cu succes!');
      }
    } catch (error) {
      console.error('Error updating study plan:', error);
      toast.error('A apărut o eroare la actualizarea planului de studii.');
    }
  };

  const getProfileRecommendations = () => {
    const recommendations = [];
    
    const fields = [
      { name: 'phone', text: 'Adăugați numărul de telefon' },
      { name: 'date_of_birth', text: 'Adăugați data nașterii' },
      { name: 'country_of_origin', text: 'Adăugați țara de origine' },
      { name: 'nationality', text: 'Adăugați naționalitatea' },
      { name: 'desired_study_level', text: 'Selectați nivelul de studiu dorit' },
      { name: 'preferred_study_field', text: 'Adăugați domeniul de studiu preferat' },
      { name: 'desired_academic_year', text: 'Selectați anul academic dorit' },
      { name: 'preferred_study_language', text: 'Selectați limba de studiu preferată' },
      { name: 'estimated_budget', text: 'Adăugați bugetul estimat' },
      { name: 'accommodation_preferences', text: 'Adăugați preferințele de cazare' }
    ];

    fields.forEach(field => {
      const isComplete = isFieldComplete(field.name);
      if (!isComplete) {
        recommendations.push({
          text: field.text,
          completed: false
        });
      }
    });
    
    return recommendations;
  };

  const isFieldComplete = (fieldName) => {
    const value = userData?.[fieldName];
    if (!value) return false;
    
    if (fieldName === 'estimated_budget') {
      const budget = Number(value);
      return !isNaN(budget) && budget > 0;
    }
    
    return value.toString().trim() !== '';
  };

  if (isLoading) {
    return (
      <div className="plan-your-studies">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Se încarcă datele...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="plan-your-studies">
      <div className="plan-your-studies-content">
        <div className="profile-progress-container">
          <div className="profile-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${calculateProfileProgress()}%` }}
              ></div>
            </div>
            <span className="progress-text">{calculateProfileProgress()}% Complet</span>
          </div>
          
          {calculateProfileProgress() < 100 && (
            <div className="profile-recommendations">
              <h3>Recomandări pentru completarea profilului</h3>
              <ul>
                {getProfileRecommendations().map((recommendation, index) => (
                  <li key={index} className={recommendation.completed ? 'completed' : ''}>
                    <span>{recommendation.text}</span>
                    {recommendation.completed && <span className="checkmark">✓</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="study-plan-section">
          <h2>Planificați-vă Studiile</h2>
          <div className="study-plan-details">
            <div className={`study-plan-field ${isFieldComplete('desired_study_level') ? 'completed' : ''}`}>
              <label>
                Nivelul de Studiu Dorit:
                {isFieldComplete('desired_study_level') && <span className="checkmark">✓</span>}
              </label>
              <span>{userData?.desired_study_level || 'Nespecificat'}</span>
            </div>
            <div className={`study-plan-field ${isFieldComplete('preferred_study_field') ? 'completed' : ''}`}>
              <label>
                Domeniul de Studiu Preferat:
                {isFieldComplete('preferred_study_field') && <span className="checkmark">✓</span>}
              </label>
              <span>{userData?.preferred_study_field || 'Nespecificat'}</span>
            </div>
            <div className={`study-plan-field ${isFieldComplete('desired_academic_year') ? 'completed' : ''}`}>
              <label>
                Anul Academic Dorit:
                {isFieldComplete('desired_academic_year') && <span className="checkmark">✓</span>}
              </label>
              <span>{userData?.desired_academic_year || 'Nespecificat'}</span>
            </div>
            <div className={`study-plan-field ${isFieldComplete('preferred_study_language') ? 'completed' : ''}`}>
              <label>
                Limba de Studiu Preferată:
                {isFieldComplete('preferred_study_language') && <span className="checkmark">✓</span>}
              </label>
              <span>{userData?.preferred_study_language || 'Nespecificată'}</span>
            </div>
            <div className={`study-plan-field ${isFieldComplete('estimated_budget') ? 'completed' : ''}`}>
              <label>
                Buget Estimat:
                {isFieldComplete('estimated_budget') && <span className="checkmark">✓</span>}
              </label>
              <span>{userData?.estimated_budget ? `${userData.estimated_budget} EUR` : 'Nespecificat'}</span>
            </div>
            <div className={`study-plan-field ${isFieldComplete('accommodation_preferences') ? 'completed' : ''}`}>
              <label>
                Preferințe Cazare:
                {isFieldComplete('accommodation_preferences') && <span className="checkmark">✓</span>}
              </label>
              <span>{userData?.accommodation_preferences || 'Nespecificate'}</span>
            </div>
          </div>
          <button 
            className="edit-study-plan-button"
            onClick={() => setIsEditing(true)}
          >
            Editează Planul de Studii
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="edit-study-plan-modal">
          <div className="modal-content">
            <h2>Editează Planul de Studii</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleEditStudyPlan(); }}>
              <div className="form-group">
                <label>Nivelul de Studiu Dorit: <span className="required">*</span></label>
                <select
                  name="desired_study_level"
                  value={formData.desired_study_level}
                  onChange={handleChange}
                  className={formErrors.desired_study_level ? 'error' : ''}
                >
                  <option value="">Selectați Nivelul</option>
                  <option value="Bachelor">Licență</option>
                  <option value="Master">Master</option>
                  <option value="PhD">Doctorat</option>
                </select>
                {formErrors.desired_study_level && (
                  <span className="error-message">{formErrors.desired_study_level}</span>
                )}
              </div>
              <div className="form-group">
                <label>Domeniul de Studiu Preferat: <span className="required">*</span></label>
                <input
                  type="text"
                  name="preferred_study_field"
                  value={formData.preferred_study_field}
                  onChange={handleChange}
                  placeholder="Introduceți domeniul de studiu"
                  className={formErrors.preferred_study_field ? 'error' : ''}
                />
                {formErrors.preferred_study_field && (
                  <span className="error-message">{formErrors.preferred_study_field}</span>
                )}
              </div>
              <div className="form-group">
                <label>Anul Academic Dorit: <span className="required">*</span></label>
                <input
                  type="text"
                  name="desired_academic_year"
                  value={formData.desired_academic_year}
                  onChange={handleChange}
                  placeholder="Introduceți anul academic"
                  className={formErrors.desired_academic_year ? 'error' : ''}
                />
                {formErrors.desired_academic_year && (
                  <span className="error-message">{formErrors.desired_academic_year}</span>
                )}
              </div>
              <div className="form-group">
                <label>Limba de Studiu Preferată: <span className="required">*</span></label>
                <select
                  name="preferred_study_language"
                  value={formData.preferred_study_language}
                  onChange={handleChange}
                  className={formErrors.preferred_study_language ? 'error' : ''}
                >
                  <option value="">Selectați Limba</option>
                  <option value="English">Engleză</option>
                  <option value="Romanian">Română</option>
                  <option value="Russian">Rusă</option>
                </select>
                {formErrors.preferred_study_language && (
                  <span className="error-message">{formErrors.preferred_study_language}</span>
                )}
              </div>
              <div className="form-group">
                <label>Buget Estimat (EUR): <span className="required">*</span></label>
                <input
                  type="number"
                  name="estimated_budget"
                  value={formData.estimated_budget}
                  onChange={handleChange}
                  placeholder="Introduceți bugetul"
                  min="0"
                  className={formErrors.estimated_budget ? 'error' : ''}
                />
                {formErrors.estimated_budget && (
                  <span className="error-message">{formErrors.estimated_budget}</span>
                )}
              </div>
              <div className="form-group">
                <label>Preferințe Cazare: <span className="required">*</span></label>
                <select
                  name="accommodation_preferences"
                  value={formData.accommodation_preferences}
                  onChange={handleChange}
                  className={formErrors.accommodation_preferences ? 'error' : ''}
                >
                  <option value="">Selectați Preferința</option>
                  <option value="Dormitory">Cămin</option>
                  <option value="Private Apartment">Apartament Privat</option>
                  <option value="Shared Apartment">Apartament Partajat</option>
                </select>
                {formErrors.accommodation_preferences && (
                  <span className="error-message">{formErrors.accommodation_preferences}</span>
                )}
              </div>
              <div className="modal-buttons">
                <button type="submit" className="save-button">Salvează</button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setIsEditing(false)}
                >
                  Anulează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanYourStudies; 
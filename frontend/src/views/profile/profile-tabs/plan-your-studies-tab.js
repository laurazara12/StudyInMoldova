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
        return value ? '' : 'Study level is required';
      case 'preferred_study_field':
        return value ? '' : 'Study field is required';
      case 'desired_academic_year':
        return value ? '' : 'Academic year is required';
      case 'preferred_study_language':
        return value ? '' : 'Study language is required';
      case 'estimated_budget':
        if (!value) return 'Budget is required';
        if (isNaN(value) || Number(value) <= 0) return 'Budget must be a positive number';
        return '';
      case 'accommodation_preferences':
        return value ? '' : 'Accommodation preferences are required';
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
      toast.error('Please fill in all required fields correctly');
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
        
        toast.success('Study plan updated successfully!');
      }
    } catch (error) {
      console.error('Error updating study plan:', error);
      toast.error('An error occurred while updating the study plan.');
    }
  };

  const getProfileRecommendations = () => {
    const recommendations = [];
    
    const fields = [
      { name: 'phone', text: 'Add phone number' },
      { name: 'date_of_birth', text: 'Add date of birth' },
      { name: 'country_of_origin', text: 'Add country of origin' },
      { name: 'nationality', text: 'Add nationality' },
      { name: 'desired_study_level', text: 'Select desired study level' },
      { name: 'preferred_study_field', text: 'Add preferred study field' },
      { name: 'desired_academic_year', text: 'Select desired academic year' },
      { name: 'preferred_study_language', text: 'Select preferred study language' },
      { name: 'estimated_budget', text: 'Add estimated budget' },
      { name: 'accommodation_preferences', text: 'Add accommodation preferences' }
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
          <p>Loading data...</p>
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
            <span className="progress-text">{calculateProfileProgress()}% Completed</span>
          </div>
          
          {calculateProfileProgress() < 100 && (
            <div className="profile-recommendations">
              <h3>Recommendations for completing the profile</h3>
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
          <h2>Plan Your Studies</h2>
          <div className="study-plan-details">
            <div className={`study-plan-field ${isFieldComplete('desired_study_level') ? 'completed' : ''}`}>
              <label>
                Desired Study Level:
                {isFieldComplete('desired_study_level') && <span className="checkmark">✓</span>}
              </label>
              <span>{userData?.desired_study_level || 'Not specified'}</span>
            </div>
            <div className={`study-plan-field ${isFieldComplete('preferred_study_field') ? 'completed' : ''}`}>
              <label>
                Preferred Study Field:
                {isFieldComplete('preferred_study_field') && <span className="checkmark">✓</span>}
              </label>
              <span>{userData?.preferred_study_field || 'Not specified'}</span>
            </div>
            <div className={`study-plan-field ${isFieldComplete('desired_academic_year') ? 'completed' : ''}`}>
              <label>
                Desired Academic Year:
                {isFieldComplete('desired_academic_year') && <span className="checkmark">✓</span>}
              </label>
              <span>{userData?.desired_academic_year || 'Not specified'}</span>
            </div>
            <div className={`study-plan-field ${isFieldComplete('preferred_study_language') ? 'completed' : ''}`}>
              <label>
                Preferred Study Language:
                {isFieldComplete('preferred_study_language') && <span className="checkmark">✓</span>}
              </label>
              <span>{userData?.preferred_study_language || 'Not specified'}</span>
            </div>
            <div className={`study-plan-field ${isFieldComplete('estimated_budget') ? 'completed' : ''}`}>
              <label>
                Estimated Budget:
                {isFieldComplete('estimated_budget') && <span className="checkmark">✓</span>}
              </label>
              <span>{userData?.estimated_budget ? `${userData.estimated_budget} EUR` : 'Not specified'}</span>
            </div>
            <div className={`study-plan-field ${isFieldComplete('accommodation_preferences') ? 'completed' : ''}`}>
              <label>
                Accommodation Preferences:
                {isFieldComplete('accommodation_preferences') && <span className="checkmark">✓</span>}
              </label>
              <span>{userData?.accommodation_preferences || 'Not specified'}</span>
            </div>
          </div>
          <button 
            className="edit-study-plan-button"
            onClick={() => setIsEditing(true)}
          >
            Edit Study Plan
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="edit-study-plan-modal">
          <div className="modal-content">
            <h2>Edit Study Plan</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleEditStudyPlan(); }}>
              <div className="form-group">
                <label>Desired Study Level: <span className="required">*</span></label>
                <select
                  name="desired_study_level"
                  value={formData.desired_study_level}
                  onChange={handleChange}
                  className={formErrors.desired_study_level ? 'error' : ''}
                >
                  <option value="">Select Level</option>
                  <option value="Bachelor">Bachelor</option>
                  <option value="Master">Master</option>
                  <option value="PhD">PhD</option>
                </select>
                {formErrors.desired_study_level && (
                  <span className="error-message">{formErrors.desired_study_level}</span>
                )}
              </div>
              <div className="form-group">
                <label>Preferred Study Field: <span className="required">*</span></label>
                <input
                  type="text"
                  name="preferred_study_field"
                  value={formData.preferred_study_field}
                  onChange={handleChange}
                  placeholder="Enter study field"
                  className={formErrors.preferred_study_field ? 'error' : ''}
                />
                {formErrors.preferred_study_field && (
                  <span className="error-message">{formErrors.preferred_study_field}</span>
                )}
              </div>
              <div className="form-group">
                <label>Desired Academic Year: <span className="required">*</span></label>
                <input
                  type="text"
                  name="desired_academic_year"
                  value={formData.desired_academic_year}
                  onChange={handleChange}
                  placeholder="Enter academic year"
                  className={formErrors.desired_academic_year ? 'error' : ''}
                />
                {formErrors.desired_academic_year && (
                  <span className="error-message">{formErrors.desired_academic_year}</span>
                )}
              </div>
              <div className="form-group">
                <label>Preferred Study Language: <span className="required">*</span></label>
                <select
                  name="preferred_study_language"
                  value={formData.preferred_study_language}
                  onChange={handleChange}
                  className={formErrors.preferred_study_language ? 'error' : ''}
                >
                  <option value="">Select Language</option>
                  <option value="English">English</option>
                  <option value="Romanian">Romanian</option>
                  <option value="Russian">Russian</option>
                </select>
                {formErrors.preferred_study_language && (
                  <span className="error-message">{formErrors.preferred_study_language}</span>
                )}
              </div>
              <div className="form-group">
                <label>Estimated Budget (EUR): <span className="required">*</span></label>
                <input
                  type="number"
                  name="estimated_budget"
                  value={formData.estimated_budget}
                  onChange={handleChange}
                  placeholder="Enter budget"
                  min="0"
                  className={formErrors.estimated_budget ? 'error' : ''}
                />
                {formErrors.estimated_budget && (
                  <span className="error-message">{formErrors.estimated_budget}</span>
                )}
              </div>
              <div className="form-group">
                <label>Accommodation Preferences: <span className="required">*</span></label>
                <select
                  name="accommodation_preferences"
                  value={formData.accommodation_preferences}
                  onChange={handleChange}
                  className={formErrors.accommodation_preferences ? 'error' : ''}
                >
                  <option value="">Select Preference</option>
                  <option value="Dormitory">Dormitory</option>
                  <option value="Private Apartment">Private Apartment</option>
                  <option value="Shared Apartment">Shared Apartment</option>
                </select>
                {formErrors.accommodation_preferences && (
                  <span className="error-message">{formErrors.accommodation_preferences}</span>
                )}
              </div>
              <div className="modal-buttons">
                <button type="submit" className="save-button">Save</button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
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
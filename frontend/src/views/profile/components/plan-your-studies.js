import React, { useState } from 'react';
import './profile-component.css';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { API_BASE_URL, getAuthHeaders } from '../../../config/api.config';

const PlanYourStudies = ({ userData, documents, documentTypes, calculateProfileProgress }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    desired_study_level: userData?.desired_study_level || '',
    preferred_study_field: userData?.preferred_study_field || '',
    desired_academic_year: userData?.desired_academic_year || '',
    preferred_study_language: userData?.preferred_study_language || '',
    estimated_budget: userData?.estimated_budget || '',
    accommodation_preferences: userData?.accommodation_preferences || ''
  });
  const { setUserData, updateProfile } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditStudyPlan = async () => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/auth/update-profile`, formData, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        const updatedUserData = response.data.user;
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
      { name: 'phone', text: 'Add phone number' },
      { name: 'date_of_birth', text: 'Add date of birth' },
      { name: 'country_of_origin', text: 'Add country of origin' },
      { name: 'nationality', text: 'Add nationality' },
      { name: 'desired_study_level', text: 'Select desired study level' },
      { name: 'preferred_study_field', text: 'Add preferred field of study' },
      { name: 'desired_academic_year', text: 'Select desired academic year' },
      { name: 'preferred_study_language', text: 'Select preferred study language' },
      { name: 'estimated_budget', text: 'Add estimated budget' },
      { name: 'accommodation_preferences', text: 'Add accommodation preferences' }
    ];

    fields.forEach(field => {
      recommendations.push({
        text: field.text,
        completed: isFieldComplete(field.name)
      });
    });
    
    return recommendations;
  };

  const isFieldComplete = (fieldName) => {
    return userData && userData[fieldName] && userData[fieldName].trim() !== '';
  };

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
            <span className="progress-text">{calculateProfileProgress()}% Complete</span>
          </div>
          
          {calculateProfileProgress() < 100 && (
            <div className="profile-recommendations">
              <h3>Recommendations for completing your profile</h3>
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
                Preferred Field of Study:
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
                <label>Desired Study Level:</label>
                <select
                  name="desired_study_level"
                  value={formData.desired_study_level}
                  onChange={handleChange}
                >
                  <option value="">Select Level</option>
                  <option value="Bachelor">Bachelor</option>
                  <option value="Master">Master</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
              <div className="form-group">
                <label>Preferred Field of Study:</label>
                <input
                  type="text"
                  name="preferred_study_field"
                  value={formData.preferred_study_field}
                  onChange={handleChange}
                  placeholder="Enter field of study"
                />
              </div>
              <div className="form-group">
                <label>Desired Academic Year:</label>
                <input
                  type="text"
                  name="desired_academic_year"
                  value={formData.desired_academic_year}
                  onChange={handleChange}
                  placeholder="Enter academic year"
                />
              </div>
              <div className="form-group">
                <label>Preferred Study Language:</label>
                <select
                  name="preferred_study_language"
                  value={formData.preferred_study_language}
                  onChange={handleChange}
                >
                  <option value="">Select Language</option>
                  <option value="English">English</option>
                  <option value="Romanian">Romanian</option>
                  <option value="Russian">Russian</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estimated Budget (EUR):</label>
                <input
                  type="number"
                  name="estimated_budget"
                  value={formData.estimated_budget}
                  onChange={handleChange}
                  placeholder="Enter budget"
                />
              </div>
              <div className="form-group">
                <label>Accommodation Preferences:</label>
                <select
                  name="accommodation_preferences"
                  value={formData.accommodation_preferences}
                  onChange={handleChange}
                >
                  <option value="">Select Preference</option>
                  <option value="Dormitory">Dormitory</option>
                  <option value="Private Apartment">Private Apartment</option>
                  <option value="Shared Apartment">Shared Apartment</option>
                </select>
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
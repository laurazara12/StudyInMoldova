import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getAuthHeaders, handleApiError } from '../../../config/api.config';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import '../profile.css';

const ProfileTab = ({ userData, onProfileUpdate }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    phone_code: userData?.phone_code || '+373',
    country_of_origin: userData?.country_of_origin || '',
    date_of_birth: userData?.date_of_birth || '',
    nationality: userData?.nationality || '',
    desired_study_level: userData?.desired_study_level || '',
    preferred_study_field: userData?.preferred_study_field || '',
    desired_academic_year: userData?.desired_academic_year || '',
    preferred_study_language: userData?.preferred_study_language || '',
    estimated_budget: userData?.estimated_budget || '',
    accommodation_preferences: userData?.accommodation_preferences || ''
  });
  const [formErrors, setFormErrors] = useState({});

  const countries = [
    'Afghanistan',
    'South Africa',
    'Albania',
    'Algeria',
    'Andorra',
    'Angola',
    'Antigua and Barbuda',
    'Argentina',
    'Armenia',
    'Australia',
    'Austria',
    'Azerbaijan',
    'Bahamas',
    'Bahrain',
    'Bangladesh',
    'Barbados',
    'Belarus',
    'Belgium',
    'Belize',
    'Benin',
    'Bhutan',
    'Myanmar',
    'Bolivia',
    'Bosnia and Herzegovina',
    'Botswana',
    'Brazil',
    'Brunei',
    'Bulgaria',
    'Burkina Faso',
    'Burundi',
    'Cambodia',
    'Cameroon',
    'Canada',
    'Cape Verde',
    'Czech Republic',
    'Chile',
    'China',
    'Cyprus',
    'Ivory Coast',
    'Colombia',
    'Comoros',
    'Congo',
    'North Korea',
    'South Korea',
    'Costa Rica',
    'Croatia',
    'Cuba',
    'Denmark',
    'Djibouti',
    'Dominica',
    'Ecuador',
    'Egypt',
    'El Salvador',
    'Switzerland',
    'United Arab Emirates',
    'Eritrea',
    'Estonia',
    'Eswatini',
    'Ethiopia',
    'Fiji',
    'Philippines',
    'Finland',
    'France',
    'Gabon',
    'Gambia',
    'Georgia',
    'Germany',
    'Ghana',
    'Greece',
    'Grenada',
    'Guatemala',
    'Guinea',
    'Guinea-Bissau',
    'Equatorial Guinea',
    'Guyana',
    'Haiti',
    'Honduras',
    'India',
    'Indonesia',
    'Jordan',
    'Iraq',
    'Iran',
    'Ireland',
    'Iceland',
    'Israel',
    'Italy',
    'Jamaica',
    'Japan',
    'Kazakhstan',
    'Kenya',
    'Kiribati',
    'Kyrgyzstan',
    'Kosovo',
    'Kuwait',
    'Laos',
    'Lesotho',
    'Latvia',
    'Lebanon',
    'Liberia',
    'Libya',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg',
    'North Macedonia',
    'Madagascar',
    'Malawi',
    'Malaysia',
    'Maldives',
    'Mali',
    'Malta',
    'Morocco',
    'Marshall Islands',
    'Mauritania',
    'Mauritius',
    'Mexico',
    'Micronesia',
    'Moldova',
    'Monaco',
    'Mongolia',
    'Montenegro',
    'Mozambique',
    'Namibia',
    'Nauru',
    'Nepal',
    'Nicaragua',
    'Niger',
    'Nigeria',
    'Norway',
    'New Zealand',
    'Oman',
    'Pakistan',
    'Palau',
    'Palestine',
    'Panama',
    'Papua New Guinea',
    'Paraguay',
    'Peru',
    'Poland',
    'Portugal',
    'Qatar',
    'United Kingdom',
    'Central African Republic',
    'Dominican Republic',
    'Romania',
    'Rwanda',
    'Russia',
    'Saint Kitts and Nevis',
    'Saint Lucia',
    'Saint Vincent and the Grenadines',
    'Samoa',
    'San Marino',
    'São Tomé and Príncipe',
    'Senegal',
    'Serbia',
    'Seychelles',
    'Sierra Leone',
    'Singapore',
    'Syria',
    'Slovakia',
    'Slovenia',
    'Solomon Islands',
    'Somalia',
    'Spain',
    'Sri Lanka',
    'United States of America',
    'Sudan',
    'South Sudan',
    'Sweden',
    'Suriname',
    'Tajikistan',
    'Tanzania',
    'Thailand',
    'East Timor',
    'Togo',
    'Tonga',
    'Trinidad and Tobago',
    'Tunisia',
    'Turkey',
    'Turkmenistan',
    'Tuvalu',
    'Ukraine',
    'Uganda',
    'Hungary',
    'Uruguay',
    'Uzbekistan',
    'Vanuatu',
    'Vatican City',
    'Venezuela',
    'Vietnam',
    'Yemen',
    'Zambia',
    'Zimbabwe'
  ];

  const phoneCodes = [
    { code: '+373', country: 'Moldova' },
    { code: '+40', country: 'Romania' },
    { code: '+380', country: 'Ukraine' },
    { code: '+7', country: 'Russia' },
    { code: '+375', country: 'Belarus' },
    { code: '+359', country: 'Bulgaria' },
    { code: '+381', country: 'Serbia' },
    { code: '+385', country: 'Croatia' },
    { code: '+386', country: 'Slovenia' },
    { code: '+421', country: 'Slovakia' },
    { code: '+420', country: 'Czech Republic' },
    { code: '+48', country: 'Poland' },
    { code: '+36', country: 'Hungary' },
    { code: '+43', country: 'Austria' },
    { code: '+49', country: 'Germany' },
    { code: '+33', country: 'France' },
    { code: '+39', country: 'Italy' },
    { code: '+34', country: 'Spain' },
    { code: '+351', country: 'Portugal' },
    { code: '+30', country: 'Greece' },
    { code: '+90', country: 'Turkey' },
    { code: '+995', country: 'Georgia' },
    { code: '+374', country: 'Armenia' },
    { code: '+994', country: 'Azerbaijan' },
    { code: '+7', country: 'Kazakhstan' },
    { code: '+996', country: 'Kyrgyzstan' },
    { code: '+992', country: 'Tajikistan' },
    { code: '+998', country: 'Uzbekistan' },
    { code: '+44', country: 'United Kingdom' },
    { code: '+1', country: 'United States and Canada' },
    { code: '+86', country: 'China' },
    { code: '+81', country: 'Japan' },
    { code: '+82', country: 'South Korea' },
    { code: '+91', country: 'India' },
    { code: '+61', country: 'Australia' },
    { code: '+64', country: 'New Zealand' },
    { code: '+27', country: 'South Africa' },
    { code: '+20', country: 'Egypt' },
    { code: '+212', country: 'Morocco' },
    { code: '+234', country: 'Nigeria' },
    { code: '+254', country: 'Kenya' },
    { code: '+55', country: 'Brazil' },
    { code: '+54', country: 'Argentina' },
    { code: '+52', country: 'Mexico' }
  ];

  useEffect(() => {
    if (isEditModalOpen) {
      setFormData({
        name: userData?.name || '',
        email: userData?.email || '',
        phone: userData?.phone || '',
        phone_code: userData?.phone_code || '+373',
        country_of_origin: userData?.country_of_origin || '',
        date_of_birth: userData?.date_of_birth || '',
        nationality: userData?.nationality || '',
        desired_study_level: userData?.desired_study_level || '',
        preferred_study_field: userData?.preferred_study_field || '',
        desired_academic_year: userData?.desired_academic_year || '',
        preferred_study_language: userData?.preferred_study_language || '',
        estimated_budget: userData?.estimated_budget || '',
        accommodation_preferences: userData?.accommodation_preferences || ''
      });
    }
  }, [isEditModalOpen, userData]);

  useEffect(() => {
    if (isEditModalOpen && userData?.phone) {
      const phoneNumber = userData.phone;
      let phoneCode = '+373';
      let phone = phoneNumber;

      for (const { code } of phoneCodes) {
        if (phoneNumber.startsWith(code)) {
          phoneCode = code;
          phone = phoneNumber.slice(code.length);
          break;
        }
      }

      setFormData({
        ...userData,
        phone_code: phoneCode,
        phone: phone
      });
    }
  }, [isEditModalOpen, userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Ștergem eroarea pentru câmpul modificat
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Name is mandatory';
    if (!formData.email) errors.email = 'Email is mandatory';
    if (!formData.phone) errors.phone = 'Phone number is mandatory';
    if (!formData.country_of_origin) errors.country_of_origin = 'Country is mandatory';
    
    if (formData.phone) {
      const phoneNumber = formData.phone.replace(/^0+/, '');
      if (phoneNumber.length < 8 || phoneNumber.length > 15) {
        errors.phone = 'Phone number must be between 8 and 15 digits';
      }
      if (!/^\d+$/.test(phoneNumber)) {
        errors.phone = 'Phone number must contain only digits';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const dataToSubmit = {
        ...formData,
        phone: formData.phone_code + formData.phone.replace(/^0+/, '')
      };
      
      delete dataToSubmit.phone_code;

      const response = await axios.put(
        `${API_BASE_URL}/api/users/profile`,
        dataToSubmit,
        { headers: getAuthHeaders() }
      );

      if (response.data?.success) {
        toast.success('Profile updated successfully');
        setIsEditModalOpen(false);
        if (onProfileUpdate) {
          const updatedData = {
            ...response.data.data,
            phone: dataToSubmit.phone
          };
          onProfileUpdate(updatedData);
        }
      } else {
        throw new Error(response.data.message || 'Error updating profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEditModal = () => {
    if (!isEditModalOpen) return null;

    return (
      <div className="edit-modal">
        <div className="edit-modal-content">
          <button 
            className="close-modal-button"
            onClick={() => setIsEditModalOpen(false)}
          >
            ×
          </button>
          <h2>Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-group">
                <label>Full Name: <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={formErrors.name ? 'error' : ''}
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              </div>
              <div className="form-group">
                <label>Email: <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={formErrors.email ? 'error' : ''}
                />
                {formErrors.email && <span className="error-message">{formErrors.email}</span>}
              </div>
              <div className="form-group">
                <label>Phone: <span className="required">*</span></label>
                <div className="phone-input-group">
                  <select
                    name="phone_code"
                    value={formData.phone_code}
                    onChange={handleChange}
                    className="phone-code-select"
                  >
                    {phoneCodes.map(({ code, country }) => (
                      <option key={code} value={code}>
                        {code} ({country})
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    className={formErrors.phone ? 'error' : ''}
                  />
                </div>
                {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Country: <span className="required">*</span></label>
                <select
                  name="country_of_origin"
                  value={formData.country_of_origin}
                  onChange={handleChange}
                  className={formErrors.country_of_origin ? 'error' : ''}
                  required
                >
                  <option value="">Select country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {formErrors.country_of_origin && <span className="error-message">{formErrors.country_of_origin}</span>}
              </div>
            </div>

            <div className="form-section">
              <h3>Academic Information</h3>
              <div className="form-group">
                <label>Date of Birth:</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Nationality:</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Desired Study Level:</label>
                <input
                  type="text"
                  name="desired_study_level"
                  value={formData.desired_study_level}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Preferred Study Field:</label>
                <input
                  type="text"
                  name="preferred_study_field"
                  value={formData.preferred_study_field}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Desired Academic Year:</label>
                <input
                  type="text"
                  name="desired_academic_year"
                  value={formData.desired_academic_year}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Preferred Study Language:</label>
                <input
                  type="text"
                  name="preferred_study_language"
                  value={formData.preferred_study_language}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Estimated Budget (EUR):</label>
                <input
                  type="number"
                  name="estimated_budget"
                  value={formData.estimated_budget}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Accommodation Preferences:</label>
                <textarea
                  name="accommodation_preferences"
                  value={formData.accommodation_preferences}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="save-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="profile-tab">
      <div className="profile-info">
        <div className="profile-header">
        <h2>Personal Information</h2>
        </div>
        <button 
            className="edit-button"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Profile
          </button>
          
        <div className="info-grid">
          <div className="info-item">
            <label>Full Name:</label>
            <span>{userData?.name || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <label>Email:</label>
            <span>{userData?.email || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <label>Phone:</label>
            <span>{userData?.phone || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <label>Date of Birth:</label>
            <span>{userData?.date_of_birth ? new Date(userData.date_of_birth).toLocaleDateString('en-US') : 'Not specified'}</span>
          </div>
          <div className="info-item">
            <label>Country of Origin:</label>
            <span>{userData?.country_of_origin || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <label>Nationality:</label>
            <span>{userData?.nationality || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <label>Desired Study Level:</label>
            <span>{userData?.desired_study_level || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <label>Preferred Study Field:</label>
            <span>{userData?.preferred_study_field || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <label>Desired Academic Year:</label>
            <span>{userData?.desired_academic_year || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <label>Preferred Study Language:</label>
            <span>{userData?.preferred_study_language || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <label>Estimated Budget:</label>
            <span>{userData?.estimated_budget ? `${userData.estimated_budget} EUR` : 'Not specified'}</span>
          </div>
          <div className="info-item">
            <label>Accommodation Preferences:</label>
            <span>{userData?.accommodation_preferences || 'Not specified'}</span>
          </div>
        </div>
      </div>
      {renderEditModal()}
    </div>
  );
};

export default ProfileTab;
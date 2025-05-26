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
    'Afganistan',
    'Africa de Sud',
    'Albania',
    'Algeria',
    'Andorra',
    'Angola',
    'Antigua și Barbuda',
    'Argentina',
    'Armenia',
    'Australia',
    'Austria',
    'Azerbaidjan',
    'Bahamas',
    'Bahrain',
    'Bangladesh',
    'Barbados',
    'Belarus',
    'Belgia',
    'Belize',
    'Benin',
    'Bhutan',
    'Birmania',
    'Bolivia',
    'Bosnia și Herțegovina',
    'Botswana',
    'Brazilia',
    'Brunei',
    'Bulgaria',
    'Burkina Faso',
    'Burundi',
    'Cambodgia',
    'Camerun',
    'Canada',
    'Capul Verde',
    'Cehia',
    'Chile',
    'China',
    'Cipru',
    'Coasta de Fildeș',
    'Columbia',
    'Comore',
    'Congo',
    'Coreea de Nord',
    'Coreea de Sud',
    'Costa Rica',
    'Croația',
    'Cuba',
    'Danemarca',
    'Djibouti',
    'Dominica',
    'Ecuador',
    'Egipt',
    'El Salvador',
    'Elveția',
    'Emiratele Arabe Unite',
    'Eritreea',
    'Estonia',
    'Eswatini',
    'Etiopia',
    'Fiji',
    'Filipine',
    'Finlanda',
    'Franța',
    'Gabon',
    'Gambia',
    'Georgia',
    'Germania',
    'Ghana',
    'Grecia',
    'Grenada',
    'Guatemala',
    'Guineea',
    'Guineea-Bissau',
    'Guineea Ecuatorială',
    'Guyana',
    'Haiti',
    'Honduras',
    'India',
    'Indonezia',
    'Iordania',
    'Irak',
    'Iran',
    'Irlanda',
    'Islanda',
    'Israel',
    'Italia',
    'Jamaica',
    'Japonia',
    'Kazahstan',
    'Kenya',
    'Kiribati',
    'Kârgâzstan',
    'Kosovo',
    'Kuweit',
    'Laos',
    'Lesotho',
    'Letonia',
    'Liban',
    'Liberia',
    'Libia',
    'Liechtenstein',
    'Lituania',
    'Luxemburg',
    'Macedonia de Nord',
    'Madagascar',
    'Malawi',
    'Malaysia',
    'Maldive',
    'Mali',
    'Malta',
    'Maroc',
    'Marshall',
    'Mauritania',
    'Mauritius',
    'Mexic',
    'Micronezia',
    'Moldova',
    'Monaco',
    'Mongolia',
    'Muntenegru',
    'Mozambic',
    'Namibia',
    'Nauru',
    'Nepal',
    'Nicaragua',
    'Niger',
    'Nigeria',
    'Norvegia',
    'Noua Zeelandă',
    'Oman',
    'Pakistan',
    'Palau',
    'Palestina',
    'Panama',
    'Papua Noua Guinee',
    'Paraguay',
    'Peru',
    'Polonia',
    'Portugalia',
    'Qatar',
    'Regatul Unit',
    'Republica Centrafricană',
    'Republica Dominicană',
    'România',
    'Rwanda',
    'Rusia',
    'Saint Kitts și Nevis',
    'Saint Lucia',
    'Saint Vincent și Grenadine',
    'Samoa',
    'San Marino',
    'São Tomé și Príncipe',
    'Senegal',
    'Serbia',
    'Seychelles',
    'Sierra Leone',
    'Singapore',
    'Siria',
    'Slovacia',
    'Slovenia',
    'Solomon',
    'Somalia',
    'Spania',
    'Sri Lanka',
    'Statele Unite ale Americii',
    'Sudan',
    'Sudanul de Sud',
    'Suedia',
    'Surinam',
    'Tadjikistan',
    'Tanzania',
    'Thailanda',
    'Timorul de Est',
    'Togo',
    'Tonga',
    'Trinidad și Tobago',
    'Tunisia',
    'Turcia',
    'Turkmenistan',
    'Tuvalu',
    'Ucraina',
    'Uganda',
    'Ungaria',
    'Uruguay',
    'Uzbekistan',
    'Vanuatu',
    'Vatican',
    'Venezuela',
    'Vietnam',
    'Yemen',
    'Zambia',
    'Zimbabwe'
  ];

  const phoneCodes = [
    { code: '+373', country: 'Moldova' },
    { code: '+40', country: 'România' },
    { code: '+380', country: 'Ucraina' },
    { code: '+7', country: 'Rusia' },
    { code: '+375', country: 'Belarus' },
    { code: '+359', country: 'Bulgaria' },
    { code: '+381', country: 'Serbia' },
    { code: '+385', country: 'Croația' },
    { code: '+386', country: 'Slovenia' },
    { code: '+421', country: 'Slovacia' },
    { code: '+420', country: 'Cehia' },
    { code: '+48', country: 'Polonia' },
    { code: '+36', country: 'Ungaria' },
    { code: '+43', country: 'Austria' },
    { code: '+49', country: 'Germania' },
    { code: '+33', country: 'Franța' },
    { code: '+39', country: 'Italia' },
    { code: '+34', country: 'Spania' },
    { code: '+351', country: 'Portugalia' },
    { code: '+30', country: 'Grecia' },
    { code: '+90', country: 'Turcia' },
    { code: '+995', country: 'Georgia' },
    { code: '+374', country: 'Armenia' },
    { code: '+994', country: 'Azerbaidjan' },
    { code: '+7', country: 'Kazahstan' },
    { code: '+996', country: 'Kârgâzstan' },
    { code: '+992', country: 'Tadjikistan' },
    { code: '+998', country: 'Uzbekistan' },
    { code: '+44', country: 'Regatul Unit' },
    { code: '+1', country: 'Statele Unite și Canada' },
    { code: '+86', country: 'China' },
    { code: '+81', country: 'Japonia' },
    { code: '+82', country: 'Coreea de Sud' },
    { code: '+91', country: 'India' },
    { code: '+61', country: 'Australia' },
    { code: '+64', country: 'Noua Zeelandă' },
    { code: '+27', country: 'Africa de Sud' },
    { code: '+20', country: 'Egipt' },
    { code: '+212', country: 'Maroc' },
    { code: '+234', country: 'Nigeria' },
    { code: '+254', country: 'Kenya' },
    { code: '+55', country: 'Brazilia' },
    { code: '+54', country: 'Argentina' },
    { code: '+52', country: 'Mexic' }
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
    if (!formData.name) errors.name = 'Numele este obligatoriu';
    if (!formData.email) errors.email = 'Email-ul este obligatoriu';
    if (!formData.phone) errors.phone = 'Telefonul este obligatoriu';
    if (!formData.country_of_origin) errors.country_of_origin = 'Țara este obligatorie';
    
    if (formData.phone) {
      const phoneNumber = formData.phone.replace(/^0+/, '');
      if (phoneNumber.length < 8 || phoneNumber.length > 15) {
        errors.phone = 'Numărul de telefon trebuie să aibă între 8 și 15 cifre';
      }
      if (!/^\d+$/.test(phoneNumber)) {
        errors.phone = 'Numărul de telefon trebuie să conțină doar cifre';
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
        toast.success('Profilul a fost actualizat cu succes');
        setIsEditModalOpen(false);
        if (onProfileUpdate) {
          const updatedData = {
            ...response.data.data,
            phone: dataToSubmit.phone
          };
          onProfileUpdate(updatedData);
        }
      } else {
        throw new Error(response.data.message || 'Eroare la actualizarea profilului');
      }
    } catch (error) {
      console.error('Eroare la actualizarea profilului:', error);
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
          <h2>Editare Profil</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Informații Personale</h3>
              <div className="form-group">
                <label>Nume Complet: <span className="required">*</span></label>
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
                <label>Telefon: <span className="required">*</span></label>
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
                    placeholder="Număr de telefon"
                    className={formErrors.phone ? 'error' : ''}
                  />
                </div>
                {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Țara: <span className="required">*</span></label>
                <select
                  name="country_of_origin"
                  value={formData.country_of_origin}
                  onChange={handleChange}
                  className={formErrors.country_of_origin ? 'error' : ''}
                  required
                >
                  <option value="">Selectează țara</option>
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
              <h3>Informații Academice</h3>
              <div className="form-group">
                <label>Data Nașterii:</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Naționalitate:</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Nivelul de Studiu Dorit:</label>
                <input
                  type="text"
                  name="desired_study_level"
                  value={formData.desired_study_level}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Domeniul Preferat:</label>
                <input
                  type="text"
                  name="preferred_study_field"
                  value={formData.preferred_study_field}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Anul Academic Dorit:</label>
                <input
                  type="text"
                  name="desired_academic_year"
                  value={formData.desired_academic_year}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Limba de Studiu Preferată:</label>
                <input
                  type="text"
                  name="preferred_study_language"
                  value={formData.preferred_study_language}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Buget Estimat (EUR):</label>
                <input
                  type="number"
                  name="estimated_budget"
                  value={formData.estimated_budget}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Preferințe Cazare:</label>
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
                {isSubmitting ? 'Se salvează...' : 'Salvează Modificările'}
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmitting}
              >
                Anulează
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
        <h2>Informații Personale</h2>
        </div>
        <button 
            className="edit-button"
            onClick={() => setIsEditModalOpen(true)}
          >
            Editează Profilul
          </button>
          
        <div className="info-grid">
          <div className="info-item">
            <label>Nume Complet:</label>
            <span>{userData?.name || 'Nespecificat'}</span>
          </div>
          <div className="info-item">
            <label>Email:</label>
            <span>{userData?.email || 'Nespecificat'}</span>
          </div>
          <div className="info-item">
            <label>Telefon:</label>
            <span>{userData?.phone || 'Nespecificat'}</span>
          </div>
          <div className="info-item">
            <label>Data Nașterii:</label>
            <span>{userData?.date_of_birth ? new Date(userData.date_of_birth).toLocaleDateString('ro-RO') : 'Nespecificată'}</span>
          </div>
          <div className="info-item">
            <label>Țara de Origine:</label>
            <span>{userData?.country_of_origin || 'Nespecificată'}</span>
          </div>
          <div className="info-item">
            <label>Naționalitate:</label>
            <span>{userData?.nationality || 'Nespecificată'}</span>
          </div>
          <div className="info-item">
            <label>Nivelul de Studiu Dorit:</label>
            <span>{userData?.desired_study_level || 'Nespecificat'}</span>
          </div>
          <div className="info-item">
            <label>Domeniul Preferat:</label>
            <span>{userData?.preferred_study_field || 'Nespecificat'}</span>
          </div>
          <div className="info-item">
            <label>Anul Academic Dorit:</label>
            <span>{userData?.desired_academic_year || 'Nespecificat'}</span>
          </div>
          <div className="info-item">
            <label>Limba de Studiu Preferată:</label>
            <span>{userData?.preferred_study_language || 'Nespecificată'}</span>
          </div>
          <div className="info-item">
            <label>Buget Estimat:</label>
            <span>{userData?.estimated_budget ? `${userData.estimated_budget} EUR` : 'Nespecificat'}</span>
          </div>
          <div className="info-item">
            <label>Preferințe Cazare:</label>
            <span>{userData?.accommodation_preferences || 'Nespecificate'}</span>
          </div>
        </div>
      </div>
      {renderEditModal()}
    </div>
  );
};

export default ProfileTab;
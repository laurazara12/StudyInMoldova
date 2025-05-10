import React from 'react';
import './edit-profile-modal.css';

const EditProfileModal = ({ 
  isOpen, 
  onClose, 
  formData, 
  handleChange, 
  handleSubmit, 
  formErrors, 
  isSubmitting 
}) => {
  if (!isOpen) return null;

  return (
    <div className="edit-modal">
      <div className="edit-modal-content">
        <button 
          className="close-modal-button"
          onClick={onClose}
        >
          ×
        </button>
        <h2>Editează profilul</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Date personale</h3>
            <div className="form-group">
              <label>Nume complet: <span className="required">*</span></label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className={formErrors.first_name ? 'error' : ''}
              />
              {formErrors.first_name && <span className="error-message">{formErrors.first_name}</span>}
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
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={formErrors.phone ? 'error' : ''}
              />
              {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
            </div>
            <div className="form-group">
              <label>Țară: <span className="required">*</span></label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={formErrors.country ? 'error' : ''}
              />
              {formErrors.country && <span className="error-message">{formErrors.country}</span>}
            </div>
            <div className="form-group">
              <label>Oraș: <span className="required">*</span></label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={formErrors.city ? 'error' : ''}
              />
              {formErrors.city && <span className="error-message">{formErrors.city}</span>}
            </div>
            <div className="form-group">
              <label>Adresă: <span className="required">*</span></label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={formErrors.address ? 'error' : ''}
              />
              {formErrors.address && <span className="error-message">{formErrors.address}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="save-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Se salvează...' : 'Salvează modificările'}
            </button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={onClose}
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

export default EditProfileModal; 
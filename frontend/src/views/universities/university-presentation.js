import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCloudinaryImageUrl } from '../../config/cloudinary';
import './universities.css';

const UniversityPresentation = ({ university }) => {
  const navigate = useNavigate();
  const { t } = useTranslation(['universities', 'common']);

  if (!university) {
    return <div className="university-card">Loading...</div>;
  }

  const getFirstSentence = (text) => {
    if (!text) return '';
    const firstSentence = text.match(/^[^.!?]+[.!?]/);
    return firstSentence ? firstSentence[0] + '...' : text;
  };

  const handleImageError = (e) => {
    e.target.src = 'https://res.cloudinary.com/dlbu43xwt/image/upload/v1747599121/dorin-seremet-_atwwma7pyw-unsplash-1400w_w6dekv.jpg';
    e.target.onerror = null;
  };

  const generateSlug = (name) => {
    // Mapping for common names
    const nameMappings = {
      // USM
      'usm': 'usm',
      'universitatea de stat din moldova': 'usm',
      'universitatea de stat a moldovei': 'usm',
      'moldova state university': 'usm',
      'moldova state university (usm)': 'usm',
      
      // UTM
      'utm': 'utm',
      'universitatea tehnica a moldovei': 'utm',
      'universitatea tehnica din moldova': 'utm',
      'technical university of moldova': 'utm',
      'technical university of moldova (utm)': 'utm',
      
      // ASEM
      'asem': 'asem',
      'academia de studii economice din moldova': 'asem',
      'academy of economic studies of moldova': 'asem',
      'academy of economic studies of moldova (asem)': 'asem',
      
      // Nicolae Testemițanu
      'universitatea de stat de medicina si farmacie nicolae testemitanu': 'testemitanu',
      'universitatea de stat de medicina si farmacie nicolae testemitanu': 'testemitanu',
      'nicolae testemitanu state university of medicine and pharmacy': 'testemitanu',
      'testemitanu': 'testemitanu',
      
      // ULIM
      'ulim': 'ulim',
      'universitatea libera internationala din moldova': 'ulim',
      'free international university of moldova': 'ulim',
      'free international university of moldova (ulim)': 'ulim',
      
      // USEM
      'usem': 'usem',
      'universitatea de studii europene din moldova': 'usem',
      'european university of moldova': 'usem',
      'european university of moldova (usem)': 'usem',
      
      // Alecu Russo
      'universitatea de stat alecu russo din balti': 'russo-balti',
      'alecu russo state university of balti': 'russo-balti',
      'russo-balti': 'russo-balti',
      
      // Comrat
      'universitatea de stat din comrat': 'comrat',
      'comrat state university': 'comrat',
      
      // Ion Creangă
      'universitatea pedagogica de stat ion creanga': 'creanga',
      'ion creanga state pedagogical university': 'creanga',
      'creanga': 'creanga',
      
      // AMTAP
      'academia de muzica teatru si arte plastice': 'amtap',
      'academy of music theatre and fine arts': 'amtap',
      'amtap': 'amtap',
      
      // UASM
      'universitatea agrara de stat din moldova': 'uasm',
      'state agrarian university of moldova': 'uasm',
      'uasm': 'uasm',
      
      // USEFS
      'universitatea de stat de educatie fizica si sport': 'usefs',
      'state university of physical education and sport': 'usefs',
      'usefs': 'usefs',
      
      // Hasdeu
      'universitatea de stat bogdan petriceicu hasdeu din cahul': 'hasdeu-cahul',
      'bogdan petriceicu hasdeu state university of cahul': 'hasdeu-cahul',
      'hasdeu-cahul': 'hasdeu-cahul',
      
      // Taraclia
      'universitatea de stat din taraclia': 'taraclia',
      'taraclia state university': 'taraclia',
      
      // Perspectiva
      'universitatea perspectiva-int': 'perspectiva',
      'perspectiva-int university': 'perspectiva',
      'perspectiva': 'perspectiva',
      
      // IMI-NOVA
      'institutul international de management imi-nova': 'imi-nova',
      'international institute of management imi-nova': 'imi-nova',
      'imi-nova': 'imi-nova',
      
      // UCCM
      'universitatea cooperatist-comerciala din moldova': 'uccm',
      'cooperative-commercial university of moldova': 'uccm',
      'uccm': 'uccm',
      
      // USM
      'universitatea slavona': 'usm',
      'slavonic university': 'usm',
      'usm': 'usm',
      
      // USPEES
      'universitatea de studii politice si economice europene constantin stere': 'uspees',
      'constantin stere european university of political and economic studies': 'uspees',
      'uspees': 'uspees',
      
      // UAP
      'universitatea de administratie publica': 'uap',
      'public administration university': 'uap',
      'uap': 'uap'
    };

    return nameMappings[name] || name.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const getUniversityPath = (university) => {
    if (!university || !university.name) return null;
    
    const slug = generateSlug(university.name.toLowerCase());
    return `/universities/${slug}`;
  };

  // Function to get image URL
  const getImageUrl = () => {
    if (!university.image_url) {
      return 'https://res.cloudinary.com/dlbu43xwt/image/upload/v1747599121/dorin-seremet-_atwwma7pyw-unsplash-1400w_w6dekv.jpg';
    }

    // Check if URL is already a Cloudinary URL
    if (university.image_url.includes('cloudinary.com')) {
      return university.image_url;
    }

    // If not a Cloudinary URL, try to treat it as a public ID
    return getCloudinaryImageUrl(university.image_url, {
      width: 370,
      height: 270,
      crop: 'fill',
      quality: 'auto:good'
    });
  };

  const handleViewDetails = () => {
    const path = getUniversityPath(university);
    if (path) {
      navigate(path);
    } else {
      navigate('/error404-page');
    }
  };

  return (
    <div className="university-card university-card-small-font">
      <img 
        src={getImageUrl()}
        alt={university.name} 
        className="university-image"
        onError={handleImageError}
      />
      <div className="university-content">
        <div className="university-header">
          <span className="university-type">
            {university.type === 'Public' ? t('universities:university.public') : t('universities:university.private')}
          </span>
          <h2 className="university-title-small">
            <Link to={getUniversityPath(university) || '#'} style={{ textDecoration: 'none', color: 'inherit' }}>
              {university.name}
            </Link>
          </h2>
          {university.location && (
            <span className="university-type">{university.location}</span>
          )}
        </div>
        <p className="university-description-small">{getFirstSentence(university.description)}</p>
        <div className="university-details-row">
          <div className="university-details-col">
            <h3 className="university-details-title-small">{t('universities:university.ranking')}</h3>
            <div className="university-ranking-small">
              {console.log('University ranking for', university.name, ':', university.ranking)}
              {university.ranking && university.ranking !== '' ? (
                <div className="ranking-value">
                  {university.ranking}
                </div>
              ) : (
                <div className="no-ranking-info">
                  <i className="fas fa-info-circle"></i>
                  <span>{t('universities:university.noRanking')}</span>
                </div>
              )}
            </div>
            {university.website && (
              <>
                <h3 className="university-details-title-small">{t('universities:university.website')}</h3>
                <div className="university-link-wrapper">
                  <a href={university.website} className="university-link-small" target="_blank" rel="noopener noreferrer">{university.website}</a>
                </div>
              </>
            )}
          </div>
          <div className="university-details-col">
            <h3 className="university-details-title-small">{t('universities:university.tuitionFees')}</h3>
            <ul className="tuition-fees tuition-fees-small">
              {university.tuition_fees ? (
                <>
                  <li>
                    <span className="fee-label">{t('universities:university.bachelor')}:</span>
                    <span className="fee-value">
                      {university.tuition_fees.bachelor || 'N/A'}
                    </span>
                  </li>
                  <li>
                    <span className="fee-label">{t('universities:university.master')}:</span>
                    <span className="fee-value">
                      {university.tuition_fees.master || 'N/A'}
                    </span>
                  </li>
                  <li>
                    <span className="fee-label">{t('universities:university.phd')}:</span>
                    <span className="fee-value">
                      {university.tuition_fees.phd || 'N/A'}
                    </span>
                  </li>
                </>
              ) : (
                <li className="no-fees-info">
                  <i className="fas fa-info-circle"></i>
                  <span>{t('universities:university.noFees')}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="university-actions">
          <button onClick={handleViewDetails} className="btn1">
            {t('universities:university.viewDetails')}
          </button>
          <a href={`mailto:${university.contactEmail || ''}`} className="btn2">
            {t('universities:university.contactUniversity')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default UniversityPresentation; 
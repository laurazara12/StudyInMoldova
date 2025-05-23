import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCloudinaryImageUrl } from '../config/cloudinary';
import '../views/universities/universities.css';

const UniversityPresentation = ({ university }) => {
  const navigate = useNavigate();

  if (!university) {
    return <div className="university-card">Se încarcă...</div>;
  }

  const handleImageError = (e) => {
    // Folosim imaginea de rezervă din Cloudinary când imaginea nu se poate încărca
    e.target.src = 'https://res.cloudinary.com/dlbu43xwt/image/upload/v1747599121/dorin-seremet-_atwwma7pyw-unsplash-1400w_w6dekv.jpg';
    e.target.onerror = null;
  };

  const generateSlug = (name) => {
    // Mapare pentru nume comune
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

  // Funcție pentru a obține URL-ul imaginii
  const getImageUrl = () => {
    if (!university.image_url) {
      return 'https://res.cloudinary.com/dlbu43xwt/image/upload/v1747599121/dorin-seremet-_atwwma7pyw-unsplash-1400w_w6dekv.jpg';
    }

    // Verificăm dacă URL-ul este deja un URL Cloudinary
    if (university.image_url.includes('cloudinary.com')) {
      return university.image_url;
    }

    // Dacă nu este un URL Cloudinary, încercăm să-l tratăm ca un public ID
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
          <span className="university-type">{university.type === 'Public' ? 'Universitate publică' : 'Universitate privată'}</span>
          <h2 className="university-title-small">
            <Link to={getUniversityPath(university) || '#'} style={{ textDecoration: 'none', color: 'inherit' }}>
              {university.name}
            </Link>
          </h2>
        </div>
        <p className="university-description-small">{university.description}</p>
        {university.website && (
          <div className="university-link-wrapper">
            <a href={university.website} className="university-link-small" target="_blank" rel="noopener noreferrer">{university.website}</a>
          </div>
        )}
        <div className="university-details-row">
          <div className="university-details-col">
            <h3 className="university-details-title-small">Clasament universitate</h3>
            <div className="university-ranking-small">
              {university.name.toLowerCase().includes('asem') ? (
                <>
                  <div>Top 1000 Business Schools worldwide (2019)</div>
                  <div>1 Palme of Excellence</div>
                </>
              ) : (
                university.ranking || 'N/A'
              )}
            </div>
          </div>
          <div className="university-details-col">
            <h3 className="university-details-title-small">Taxe de studii (2023)</h3>
            <ul className="tuition-fees tuition-fees-small">
              {university.tuition_fees && Object.keys(university.tuition_fees).length > 0 ? (
                <>
                  {university.tuition_fees.bachelor && <li>Licență: {university.tuition_fees.bachelor}</li>}
                  {university.tuition_fees.master && <li>Master: {university.tuition_fees.master}</li>}
                  {university.tuition_fees.phd && <li>Doctorat: {university.tuition_fees.phd}</li>}
                </>
              ) : (
                <li>Pentru informații actualizate despre taxele de studii, vă rugăm să contactați universitatea la adresa: {university.contact_info?.email || 'contact@ase.md'}</li>
              )}
            </ul>
          </div>
        </div>
        <div className="university-actions">
          <button onClick={handleViewDetails} className="btn btn-secondary btn-small">
            Vezi detalii
          </button>
          <a href={`mailto:${university.contactEmail || ''}`} className="btn btn-primary btn-small">
            Contactează universitatea
          </a>
        </div>
      </div>
    </div>
  );
};

export default UniversityPresentation; 
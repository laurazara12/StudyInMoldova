import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getUniversityBySlug, 
  getUniversityPrograms,
  getProgramDetails,
  getProgramSpecializations,
  getProgramTuitionFees 
} from '../../services/universityService';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import './university-template.css';

const UniversityTemplate = ({ 
  customSections = [],
  beforeHero = null,
  afterHero = null,
  beforePrograms = null,
  afterPrograms = null,
  beforeFooter = null,
  customFooter = null,
  customStyles = {},
  customComponents = []
}) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [university, setUniversity] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [programDetails, setProgramDetails] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUniversityData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const universityData = await getUniversityBySlug(slug);
        console.log('Date universității primite:', universityData);
        
        if (!isMounted) return;
        
        if (!universityData || !universityData.name) {
          setError('Universitatea nu a fost găsită sau datele sunt incomplete');
          return;
        }
        
        setUniversity(universityData);
        
        // Încărcăm programele de studiu
        const programsData = await getUniversityPrograms(universityData.id);
        if (!isMounted) return;
        
        if (!Array.isArray(programsData)) {
          console.error('Date invalide pentru programe:', programsData);
          setPrograms([]);
        } else {
          setPrograms(programsData);
        }

        // Încărcăm detaliile pentru fiecare program
        const details = {};
        for (const program of programsData) {
          try {
            const [programInfo, specializations, tuitionFees] = await Promise.all([
              getProgramDetails(program.id),
              getProgramSpecializations(program.id),
              getProgramTuitionFees(program.id)
            ]);
            
            if (!isMounted) return;
            
            details[program.id] = {
              ...programInfo,
              specializations: Array.isArray(specializations) ? specializations : [],
              tuitionFees: tuitionFees || null
            };
          } catch (error) {
            console.error(`Eroare la încărcarea detaliilor programului ${program.id}:`, error);
            if (!isMounted) return;
            
            details[program.id] = {
              ...program,
              specializations: [],
              tuitionFees: null
            };
          }
        }
        
        if (!isMounted) return;
        setProgramDetails(details);
        
      } catch (err) {
        if (!isMounted) return;
        console.error('Eroare la încărcarea datelor:', err);
        setError(err.message || 'A apărut o eroare la încărcarea datelor');
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchUniversityData();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="university-template">
        <Navbar />
        <div className="university-body">
          <div className="loading-container">
            <p>Se încarcă...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="university-template">
        <Navbar />
        <div className="university-body">
          <div className="error-container">
            <h2>Eroare</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/universities')} className="back-button">
              Înapoi la lista de universități
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!university) {
    return (
      <div className="university-template">
        <Navbar />
        <div className="university-body">
          <div className="error-container">
            <h2>Universitatea nu a fost găsită</h2>
            <p>Nu am putut găsi universitatea căutată.</p>
            <button onClick={() => navigate('/universities')} className="back-button">
              Înapoi la lista de universități
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="university-template" style={customStyles}>
      <Navbar />
      
      {/* Conținut personalizat înainte de hero */}
      {beforeHero}

      {/* Secțiunea Hero */}
      <div className="university-hero">
        <div className="hero-content">
          <h1>{university.name}</h1>
          <div className="hero-details">
            <span className="university-type">{university.type}</span>
            <span className="university-location">{university.location}</span>
          </div>
        </div>
      </div>

      {/* Conținut personalizat după hero */}
      {afterHero}

      <div className="university-content">
        {/* Secțiunea Despre */}
        <section className="university-section">
          <h3>Despre Universitate</h3>
          <div className="about-content">
            <div className="about-text">
              <p>{university.description || 'Nu există descriere disponibilă.'}</p>
              {university.tuition_fees && (
                <div className="tuition-fees">
                  <h4>Taxe de școlarizare (MDL/an):</h4>
                  <ul>
                    {university.tuition_fees.bachelor && (
                      <li>Licență: {university.tuition_fees.bachelor} MDL</li>
                    )}
                    {university.tuition_fees.master && (
                      <li>Masterat: {university.tuition_fees.master} MDL</li>
                    )}
                    {university.tuition_fees.phd && (
                      <li>Doctorat: {university.tuition_fees.phd} MDL</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            <div className="about-stats">
              <div className="stat-item">
                <span className="stat-number">{programs.length || 'N/A'}</span>
                <span className="stat-label">Programe de studii</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{university.type === 'public' ? 'Publică' : 'Privată'}</span>
                <span className="stat-label">Tip</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{university.location || 'N/A'}</span>
                <span className="stat-label">Locație</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{university.contact_info?.email ? 'Disponibil' : 'N/A'}</span>
                <span className="stat-label">Contact</span>
              </div>
            </div>
          </div>
        </section>

        {/* Secțiuni personalizate */}
        {customSections}

        {/* Conținut personalizat înainte de programe */}
        {beforePrograms}

        {/* Programe de studii */}
        <section className="university-section">
          <h3>Programe de Studii</h3>
          {programs.length > 0 ? (
            <div className="programs-grid">
              {programs.map(program => {
                const details = programDetails[program.id] || {};
                return (
                  <div key={program.id} className="program-card">
                    <h4>{program.name}</h4>
                    <p>{program.description}</p>
                    {details.tuitionFees && (
                      <div className="program-fees">
                        <h5>Taxe de școlarizare:</h5>
                        <p>{details.tuitionFees} MDL/an</p>
                      </div>
                    )}
                    {details.specializations && details.specializations.length > 0 && (
                      <div className="program-specializations">
                        <h5>Specializări:</h5>
                        <ul>
                          {details.specializations.map(spec => (
                            <li key={spec.id}>{spec.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p>Nu există programe de studii disponibile momentan.</p>
          )}
        </section>

        {/* Conținut personalizat înainte de footer */}
        {beforeFooter}
      </div>

      {/* Footer personalizat sau default */}
      {customFooter || <Footer />}
    </div>
  );
};

export default UniversityTemplate; 
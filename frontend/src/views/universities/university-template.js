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
          setError('University not found or data is incomplete');
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
            <p>Loading...</p>
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
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/universities')} className="back-button">
              Back to universities list
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
            <h2>University not found</h2>
            <p>We couldn't find the requested university.</p>
            <button onClick={() => navigate('/universities')} className="back-button">
              Back to universities list
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
          <h3>About University</h3>
          <div className="about-content">
            <div className="about-text">
              <p>{university.description || 'No description available.'}</p>
              {university.tuition_fees && (
                <div className="tuition-fees">
                  <h4>Tuition Fees (MDL/year):</h4>
                  <ul>
                    {university.tuition_fees.bachelor && (
                      <li>Bachelor's: {university.tuition_fees.bachelor} MDL</li>
                    )}
                    {university.tuition_fees.master && (
                      <li>Master's: {university.tuition_fees.master} MDL</li>
                    )}
                    {university.tuition_fees.phd && (
                      <li>PhD: {university.tuition_fees.phd} MDL</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            <div className="about-stats">
              <div className="stat-item">
                <span className="stat-number">{programs.length || 'N/A'}</span>
                <span className="stat-label">Study Programs</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{university.type === 'public' ? 'Public' : 'Private'}</span>
                <span className="stat-label">Type</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{university.location || 'N/A'}</span>
                <span className="stat-label">Location</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{university.contact_info?.email ? 'Available' : 'N/A'}</span>
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
          <h3>Study Programs</h3>
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
                        <h5>Tuition Fees:</h5>
                        <p>{details.tuitionFees} MDL/year</p>
                      </div>
                    )}
                    {details.specializations && details.specializations.length > 0 && (
                      <div className="program-specializations">
                        <h5>Specializations:</h5>
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
            <p>No study programs available at the moment.</p>
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
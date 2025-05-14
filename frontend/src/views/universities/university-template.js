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
        const universityData = await getUniversityBySlug(slug);
        
        if (isMounted) {
          if (universityData && universityData.name) {
            setUniversity(universityData);
            
            // Încărcăm programele de studiu
            const programsData = await getUniversityPrograms(universityData.id);
            setPrograms(programsData);

            // Încărcăm detaliile pentru fiecare program
            const details = {};
            for (const program of programsData) {
              const [programInfo, specializations, tuitionFees] = await Promise.all([
                getProgramDetails(program.id),
                getProgramSpecializations(program.id),
                getProgramTuitionFees(program.id)
              ]);
              
              details[program.id] = {
                ...programInfo,
                specializations,
                tuitionFees
              };
            }
            setProgramDetails(details);
            
            setError(null);
          } else {
            setError('Universitatea nu a fost găsită sau datele sunt incomplete');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'A apărut o eroare la încărcarea datelor');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
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
        <div className="university-body">
          <div className="error-container">
            <h2>Eroare</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/universities')}>
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
          <div className="not-found-container">
            <h2>Universitatea nu a fost găsită</h2>
            <p>Nu am putut găsi universitatea căutată.</p>
            <button onClick={() => navigate('/universities')}>
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
      <div className="university-body">
        {/* Secțiunea de contact */}
        <div className="contact-info">
          <div className="contact-item">
            <span className="icon">📍</span>
            <p>{university.contactInfo?.address || 'Adresa nu este disponibilă'}</p>
          </div>
          <div className="contact-item">
            <span className="icon">📞</span>
            <p>{university.contactInfo?.phone || 'Telefonul nu este disponibil'}</p>
          </div>
          <div className="contact-item">
            <span className="icon">✉️</span>
            <a href={`mailto:${university.contactInfo?.email}`}>{university.contactInfo?.email || 'Email-ul nu este disponibil'}</a>
          </div>
          <div className="contact-item">
            <span className="icon">🌐</span>
            <a href={university.contactInfo?.website} target="_blank" rel="noopener noreferrer">
              {university.contactInfo?.website || 'Website-ul nu este disponibil'}
            </a>
          </div>
        </div>

        {/* Header */}
        <div className="university-header">
          <h1>{university.name}</h1>
          {university.acronym && <h2>{university.acronym}</h2>}
        </div>

        {/* Conținut personalizat înainte de hero */}
        {beforeHero}

        {/* Anunț */}
        <div className="announcement">
          Programe de schimb internațional disponibile pentru anul academic 2024-2025
        </div>

        {/* Conținut personalizat după hero */}
        {afterHero}

        {/* Conținut principal */}
        <div className="university-content">
          {/* Secțiunea Despre */}
          <section className="university-section">
            <h3>Despre Universitate</h3>
            <div className="about-content">
              <div className="about-text">
                <p>{university.description || 'Nu există descriere disponibilă.'}</p>
              </div>
              <div className="about-stats">
                <div className="stat-item">
                  <span className="stat-number">{university.stats?.students || 'N/A'}</span>
                  <span className="stat-label">Studenți</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{programs.length || 'N/A'}</span>
                  <span className="stat-label">Programe de studii</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{university.stats?.faculties || 'N/A'}</span>
                  <span className="stat-label">Facultăți</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{university.stats?.doctoralSchools || 'N/A'}</span>
                  <span className="stat-label">Școli doctorale</span>
                </div>
              </div>
            </div>
          </section>

          {/* Secțiuni personalizate */}
          {customSections}

          {/* Conținut personalizat înainte de programe */}
          {beforePrograms}

          {/* Secțiunea Programe de Studii */}
          {programs.length > 0 && (
            <section className="university-section">
              <h3>Programe de Studii</h3>
              <div className="programs-grid">
                {programs.map((program) => {
                  const details = programDetails[program.id];
                  return (
                    <div key={program.id} className="program-card">
                      <h4>{program.name}</h4>
                      <div className="program-details">
                        <p><strong>Nivel:</strong> {program.level}</p>
                        <p><strong>Durata:</strong> {program.duration} ani</p>
                        <p><strong>Limba de studiu:</strong> {program.language}</p>
                        {details?.tuitionFees && (
                          <p><strong>Taxă de școlarizare:</strong> {details.tuitionFees.amount} MDL/an</p>
                        )}
                        {details?.specializations && details.specializations.length > 0 && (
                          <div className="specializations">
                            <h5>Specializări:</h5>
                            <ul>
                              {details.specializations.map((spec, index) => (
                                <li key={index}>{spec.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Conținut personalizat după programe */}
          {afterPrograms}

          {/* Componente personalizate */}
          {customComponents.map((Component, index) => (
            <Component key={`custom-${index}`} university={university} programs={programs} programDetails={programDetails} />
          ))}
        </div>

        {/* Conținut personalizat înainte de footer */}
        {beforeFooter}
      </div>
      {/* Footer personalizat sau default */}
      {customFooter || <Footer />}
    </div>
  );
};

export default UniversityTemplate; 
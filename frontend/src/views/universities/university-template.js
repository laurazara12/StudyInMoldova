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
        <Navbar />
        <div className="university-body">
          <div className="error-container">
            <h2>Eroare</h2>
            <p>{error}</p>
            <button 
              onClick={() => navigate('/universities')}
              className="back-button"
            >
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
            <p>{university.contact_info?.address || 'Adresa nu este disponibilă'}</p>
          </div>
          <div className="contact-item">
            <span className="icon">📞</span>
            <p>{university.contact_info?.phone || 'Telefonul nu este disponibil'}</p>
          </div>
          <div className="contact-item">
            <span className="icon">✉️</span>
            <a href={`mailto:${university.contact_info?.email}`}>{university.contact_info?.email || 'Email-ul nu este disponibil'}</a>
          </div>
          <div className="contact-item">
            <span className="icon">🌐</span>
            <a href={university.contact_info?.website} target="_blank" rel="noopener noreferrer">
              {university.contact_info?.website || 'Website-ul nu este disponibil'}
            </a>
          </div>
        </div>

        {/* Header */}
        <div className="university-header">
          <h1>{university.name}</h1>
          <h2>{university.type === 'public' ? 'Universitate publică' : 'Universitate privată'}</h2>
          {university.location && <p className="university-location">{university.location}</p>}
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
            <div className="programs-table-container">
              <table className="programs-table">
                <thead>
                  <tr>
                    <th>Program de studii</th>
                    <th>Nivel</th>
                    <th>Durata</th>
                    <th>Limba de studiu</th>
                    <th>Taxă de școlarizare</th>
                    <th>Specializări</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map(program => {
                    const details = programDetails[program.id] || {};
                    const tuitionFees = details.tuition_fees || '';
                    const specializations = details.specializations || [];
                    
                    return (
                      <tr key={program.id}>
                        <td>{program.name || 'N/A'}</td>
                        <td>{program.degree_type || 'N/A'}</td>
                        <td>{program.duration ? `${program.duration} ani` : 'N/A'}</td>
                        <td>{program.language || 'N/A'}</td>
                        <td>
                          {tuitionFees ? tuitionFees : 'N/A'}
                        </td>
                        <td>
                          {specializations.length > 0 ? 
                            specializations.map(spec => spec.name).join(', ') : 
                            'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

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
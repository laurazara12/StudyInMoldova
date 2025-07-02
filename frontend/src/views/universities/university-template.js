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
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [selectedProgramDetails, setSelectedProgramDetails] = useState({});
  const [loadingProgramDetails, setLoadingProgramDetails] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchUniversityData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getUniversityBySlug(slug);
        const universityData = response.data ? response.data : response;
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

  const handleProgramClick = async (programId) => {
    if (selectedProgramDetails[programId]) {
      setSelectedProgramId(programId); // deja încărcat
      return;
    }
    setLoadingProgramDetails(true);
    try {
      const [programInfo, specializations, tuitionFees] = await Promise.all([
        getProgramDetails(programId),
        getProgramSpecializations(programId),
        getProgramTuitionFees(programId)
      ]);
      setSelectedProgramDetails(prev => ({
        ...prev,
        [programId]: {
          ...programInfo,
          specializations: Array.isArray(specializations) ? specializations : [],
          tuitionFees: tuitionFees || null
        }
      }));
      setSelectedProgramId(programId);
    } catch (error) {
      // tratează eroarea
    } finally {
      setLoadingProgramDetails(false);
    }
  };

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
      <div
        className="university-hero"
        style={{
          backgroundImage: `url(${
            university.image_url && university.image_url.trim() !== ''
              ? university.image_url
              : 'https://res.cloudinary.com/dlbu43xwt/image/upload/v1747599108/sasha-pleshco-LI5MSjGm6sQ-unsplash_qquwmh.jpg'
          })`
        }}
      >
        <div className="hero-overlay"></div>
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
                      <li>
                        Bachelor's: {
                          typeof university.tuition_fees.bachelor === 'object'
                            ? `${university.tuition_fees.bachelor.amount} ${university.tuition_fees.bachelor.currency}`
                            : university.tuition_fees.bachelor
                        }
                      </li>
                    )}
                    {university.tuition_fees.master && (
                      <li>
                        Master's: {
                          typeof university.tuition_fees.master === 'object'
                            ? `${university.tuition_fees.master.amount} ${university.tuition_fees.master.currency}`
                            : university.tuition_fees.master
                        }
                      </li>
                    )}
                    {university.tuition_fees.phd && (
                      <li>
                        PhD: {
                          typeof university.tuition_fees.phd === 'object'
                            ? `${university.tuition_fees.phd.amount} ${university.tuition_fees.phd.currency}`
                            : university.tuition_fees.phd
                        }
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            <div className="about-stats">
              <div className="stat-item">
              <span className="stat-label">Study Programs</span>
                <span className="stat-number">{programs.length || 'N/A'}</span>

              </div>
              <div className="stat-item">
                <span className="stat-label">Phone number</span>
                <span className="stat-number">
                  {university.contact_info?.phone || 'N/A'}
                </span>

              </div>
              <div className="stat-item">
              <span className="stat-label">Location</span>
                <span className="stat-number">{university.location || 'N/A'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                <span className="stat-label">Contact</span>
                  {university.contact_info?.email 
                    ? (
                        <>
                          <div>Email: {university.contact_info.email}</div>
                        </>
                      )
                    : 'N/A'}
                </span>

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
          <h3>Programe de studii</h3>
          {programs.length > 0 ? (
            <div className="programs-table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nume program</th>
                    <th>Grad</th>
                    <th>Limbă</th>
                    <th>Durată</th>
                    <th>Taxă</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map(program => (
                    <tr key={program.id}>
                      <td>{program.id}</td>
                      <td>
                        <strong>{program.name || 'N/A'}</strong>
                        {program.description && (
                          <div className="program-description">
                            {program.description.length > 20
                              ? program.description.slice(0, 20) + '...'
                              : program.description}
                          </div>
                        )}
                      </td>
                      <td>{program.degree_type || 'N/A'}</td>
                      <td>{program.language || 'N/A'}</td>
                      <td>{program.duration || 'N/A'}</td>
                      <td>{program.tuition_fees ? `${program.tuition_fees} EUR` : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
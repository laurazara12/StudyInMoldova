import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import './programs.css';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/programs');
        if (!response.ok) {
          throw new Error('Failed to fetch programs');
        }
        const data = await response.json();
        setPrograms(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  if (loading) {
    return (
      <div className="programs-container">
        <Navbar />
        <div className="loading">Loading programs...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="programs-container">
        <Navbar />
        <div className="error">Error: {error}</div>
        <Footer />
      </div>
    );
  }

  // Calculează statistici pentru header
  const totalPrograms = programs.length;
  const uniqueUniversities = [...new Set(programs.map(p => p.university?.name).filter(Boolean))].length;
  const uniqueDegrees = [...new Set(programs.map(p => p.degree).filter(Boolean))].length;

  return (
    <div className="programs-container">
      <Helmet>
        <title>Study Programs - Study In Moldova</title>
        <meta property="og:title" content="Study Programs - Study In Moldova" />
      </Helmet>
      <Navbar />
      <div className="programs-content">
        <div className="programs-header">
          <h1>Available Study Programs</h1>
          <p>Discover all the study programs offered by our partner universities in Moldova</p>
          
          {programs.length > 0 && (
            <div className="programs-stats">
              <div className="program-stat">
                <div className="program-stat-number">{totalPrograms}</div>
                <div className="program-stat-label">Total Programs</div>
              </div>
              <div className="program-stat">
                <div className="program-stat-number">{uniqueUniversities}</div>
                <div className="program-stat-label">Universities</div>
              </div>
              <div className="program-stat">
                <div className="program-stat-number">{uniqueDegrees}</div>
                <div className="program-stat-label">Degree Types</div>
              </div>
            </div>
          )}
        </div>
        
        {programs.length === 0 ? (
          <div className="no-programs-message">
            <h2>No programs available yet</h2>
            <p>We are currently working on adding study programs to our database. Please check back later.</p>
          </div>
        ) : (
          <div className="programs-list">
            {programs.map((program) => (
              <div key={program.id} className="program-card">
                <div className="program-header">
                  <h2>{program.name}</h2>
                  <span className="program-university">{program.university?.name || 'Unknown University'}</span>
                </div>
                <div className="program-details">
                  <div className="program-detail">
                    <span className="detail-label">Faculty:</span>
                    <span className="detail-value">{program.faculty}</span>
                  </div>
                  <div className="program-detail">
                    <span className="detail-label">Degree:</span>
                    <span className="detail-value">{program.degree}</span>
                  </div>
                  <div className="program-detail">
                    <span className="detail-label">Credits:</span>
                    <span className="detail-value">{program.credits} ECTS</span>
                  </div>
                  <div className="program-detail">
                    <span className="detail-label">Languages:</span>
                    <span className="detail-value">
                      {Array.isArray(program.languages) 
                        ? program.languages.join(', ')
                        : program.languages}
                    </span>
                  </div>
                  {program.duration && (
                    <div className="program-detail">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{program.duration}</span>
                    </div>
                  )}
                  {program.tuitionFee && (
                    <div className="program-detail">
                      <span className="detail-label">Tuition Fee:</span>
                      <span className="detail-value">{program.tuitionFee}</span>
                    </div>
                  )}
                </div>
                {program.description && (
                  <div className="program-description">
                    <p>{program.description}</p>
                  </div>
                )}
                <div className="program-actions">
                  <a 
                    href={`/universities/${program.universityId}`} 
                    className="view-university-button"
                  >
                    View University
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Programs;

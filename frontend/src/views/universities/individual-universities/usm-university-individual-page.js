import React from 'react'
import UniversityTemplate from '../university-template'
import './usm-university-individual-page.css'

const USMUniversityIndividualPage = () => {
  const customSections = [
    <div key="usm-about" className="usm-section usm-about">
      <h2>About University</h2>
      <div className="about-content">
        <div className="about-text">
          <p>Founded on October 1, 1946, USM is the first higher education institution with university status in the Republic of Moldova. Initially, it operated with 320 students and 35 teaching staff in 5 faculties.</p>
          <p>Currently, USM has approximately 11,000 students and offers over 100 undergraduate and master's programs across 11 faculties and 4 doctoral schools.</p>
          <p>The university is recognized for promoting academic freedom, pluralism of opinions, and quality in training highly qualified specialists.</p>
        </div>
        <div className="about-stats">
          <div className="stat-item">
            <span className="stat-number">11,000+</span>
            <span className="stat-label">Students</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100+</span>
            <span className="stat-label">Study Programs</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">11</span>
            <span className="stat-label">Faculties</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">4</span>
            <span className="stat-label">Doctoral Schools</span>
          </div>
        </div>
      </div>
    </div>,
    <div key="usm-faculties" className="usm-section usm-faculties">
      <h2>Faculties</h2>
      <div className="faculties-grid">
        <div className="faculty-card">Faculty of Biology and Geosciences</div>
        <div className="faculty-card">Faculty of Chemistry and Chemical Technology</div>
        <div className="faculty-card">Faculty of Law</div>
        <div className="faculty-card">Faculty of Journalism and Communication Sciences</div>
        <div className="faculty-card">Faculty of Physics and Engineering</div>
        <div className="faculty-card">Faculty of History and Philosophy</div>
        <div className="faculty-card">Faculty of Mathematics and Computer Science</div>
        <div className="faculty-card">Faculty of Letters</div>
        <div className="faculty-card">Faculty of Economic Sciences</div>
        <div className="faculty-card">Faculty of Psychology, Educational Sciences, Sociology and Social Work</div>
        <div className="faculty-card">Faculty of International Relations, Political and Administrative Sciences</div>
      </div>
    </div>,
    <div key="usm-mission" className="usm-section usm-mission">
      <h2>Mission and Objectives</h2>
      <div className="mission-grid">
        <div className="mission-card">
          <h3>Staff Training</h3>
          <p>Training highly qualified staff for the national economy, capable of working in the changing conditions of life and market economy.</p>
        </div>
        <div className="mission-card">
          <h3>Scientific Research</h3>
          <p>Organization and development of fundamental and applied scientific research, oriented towards solving current socio-economic problems.</p>
        </div>
        <div className="mission-card">
          <h3>Values and Development</h3>
          <p>Promoting general human and national values, forming the ethical and civic profile of young students.</p>
        </div>
        <div className="mission-card">
          <h3>Quality and Integration</h3>
          <p>Ensuring the quality of higher education and integration into the European space of higher education and research.</p>
        </div>
      </div>
    </div>,
    <div key="usm-cooperation" className="usm-section usm-cooperation">
      <h2>International Cooperation</h2>
      <div className="cooperation-grid">
        <div className="cooperation-card">
          <h3>International Association of Universities (IAU)</h3>
          <p>Active member since 1992</p>
        </div>
        <div className="cooperation-card">
          <h3>Francophone University Agency (AUF)</h3>
          <p>Collaboration in educational projects</p>
        </div>
        <div className="cooperation-card">
          <h3>Eurasian Universities Association (AEU)</h3>
          <p>Academic exchanges and research</p>
        </div>
        <div className="cooperation-card">
          <h3>CUMRU Consortium</h3>
          <p>Regional cooperation with universities from Romania and Ukraine</p>
        </div>
        <div className="cooperation-card">
          <h3>Universitaria Consortium</h3>
          <p>Member since 2018</p>
        </div>
      </div>
    </div>,
    <div key="usm-achievements" className="usm-section usm-achievements">
      <h2>Recognition and Awards</h2>
      <div className="achievements-timeline">
        <div className="achievement-item">
          <span className="year">2001</span>
          <p>First higher education institution accredited at national level</p>
        </div>
        <div className="achievement-item">
          <span className="year">2011</span>
          <p>Awarded the "Order of the Republic" for outstanding merits</p>
        </div>
        <div className="achievement-item">
          <span className="year">2013</span>
          <p>Consistent ranking in first place among universities in the Republic of Moldova</p>
        </div>
      </div>
    </div>,
    <div key="usm-facilities" className="usm-section usm-facilities">
      <h2>Facilities</h2>
      <div className="facilities-grid">
        <div className="facility-card">
          <span className="facility-icon">🏛️</span>
          <h3>6 teaching blocks</h3>
        </div>
        <div className="facility-card">
          <span className="facility-icon">🏠</span>
          <h3>10 student dormitories</h3>
        </div>
        <div className="facility-card">
          <span className="facility-icon">📚</span>
          <h3>University library</h3>
        </div>
        <div className="facility-card">
          <span className="facility-icon">🏋️</span>
          <h3>Sports Palace</h3>
        </div>
        <div className="facility-card">
          <span className="facility-icon">🎭</span>
          <h3>Culture House</h3>
        </div>
        <div className="facility-card">
          <span className="facility-icon">🍽️</span>
          <h3>Cafeterias</h3>
        </div>
        <div className="facility-card">
          <span className="facility-icon">🏕️</span>
          <h3>Practice and recreation bases</h3>
        </div>
      </div>
    </div>
  ];

  return (
    <UniversityTemplate
      customSections={customSections}
      beforeHero={
        <div className="usm-contact-info">
          <div className="contact-item">
            <span className="icon">📍</span>
            <p>Str. Alexei Mateevici 60, Chișinău, MD-2009</p>
          </div>
          <div className="contact-item">
            <span className="icon">📞</span>
            <p>+373 22 244 810</p>
          </div>
          <div className="contact-item">
            <span className="icon">✉️</span>
            <a href="mailto:rector@usm.md">rector@usm.md</a>
          </div>
          <div className="contact-item">
            <span className="icon">🌐</span>
            <a href="https://usm.md" target="_blank" rel="noopener noreferrer">usm.md</a>
          </div>
          <div className="contact-item">
            <span className="icon">📱</span>
            <a href="https://facebook.com/usm.md" target="_blank" rel="noopener noreferrer">facebook.com/usm.md</a>
          </div>
        </div>
      }
      afterHero={
        <div className="usm-announcement">
          International exchange programs available for academic year 2024-2025
        </div>
      }
      afterPrograms={
        <div className="usm-special-programs">
          <h3>Special study programs in English</h3>
          <p>Discover study opportunities in English at USM</p>
        </div>
      }
    />
  );
};

export default USMUniversityIndividualPage;

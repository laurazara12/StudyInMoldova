import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import './about.css';

const About = () => {
  return (
    <div className="about-page">
      <Navbar />
      <div className="about-hero">
        <div className="about-hero-content">
          <h1>About StudyInMoldova</h1>
          <p>Your trusted platform for international students in the Republic of Moldova</p>
        </div>
      </div>

      <div className="about-container">
        <section className="about-section why-moldova-section">
          <div className="why-moldova-content">
            <div className="why-moldova-grid">
              <div className="why-moldova-card">
                <div className="card-icon"><i className="fas fa-graduation-cap"></i></div>
                <h3>Quality Education</h3>
                <p>Modern programs and experienced professors, internationally recognized.</p>
              </div>
              <div className="why-moldova-card">
                <div className="card-icon"><i className="fas fa-coins"></i></div>
                <h3>Affordable Costs</h3>
                <p>Competitive tuition fees and living costs compared to other European countries.</p>
              </div>
              <div className="why-moldova-card">
                <div className="card-icon"><i className="fas fa-landmark"></i></div>
                <h3>Rich Culture</h3>
                <p>A country with fascinating history and vibrant culture, perfect for international students.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section services-section">
          <div className="section-header">
            <h2>What We Offer</h2>
            <p>Complete services for international students</p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon"><i className="fas fa-university"></i></div>
              <h3>Universities</h3>
              <p>Complete information about universities in Moldova, their programs and facilities.</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><i className="fas fa-book"></i></div>
              <h3>Study Programs</h3>
              <p>Detailed information about available study programs, specializations and development opportunities.</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><i className="fas fa-home"></i></div>
              <h3>Student Life</h3>
              <p>Guides for accommodation, transportation, cultural activities and adaptation in Moldova.</p>
            </div>
          </div>
        </section>

        <section className="about-section stats-section">
          <div className="section-header">
            <h2>Statistics</h2>
            <p>Our impact in international education</p>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">5000+</div>
              <h3>International Students</h3>
              <p>Students from over 50 countries who chose Moldova</p>
            </div>
            <div className="stat-card">
              <div className="stat-number">15+</div>
              <h3>Partner Universities</h3>
              <p>Higher education institutions in Moldova</p>
            </div>
            <div className="stat-card">
              <div className="stat-number">95%</div>
              <h3>Satisfaction Rate</h3>
              <p>Students satisfied with our services</p>
            </div>
          </div>
        </section>
        <section className="about-section cta-section">
          <div className="cta-content">
            <h2>Ready to start your adventure in Moldova?</h2>
            <p>Let's explore together the study opportunities and build your future in the Republic of Moldova!</p>
            <div className="cta-buttons">
              <Link to="/universities" className="cta-button primary">Explore Universities</Link>
              <Link to="/contact" className="cta-button secondary">Contact Us</Link>
            </div>
          </div>
        </section>

        <section className="about-section team-section">
          <div className="section-header">
            <h2>Our Team</h2>
            <p>Professionals dedicated to international education</p>
          </div>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar"><i className="fas fa-user-graduate"></i></div>
              <h3>Educational Consultants</h3>
              <p>Specialists in guiding students to suitable programs.</p>
              <ul className="member-expertise">
                <li>Academic assessment</li>
                <li>Career counseling</li>
                <li>Application support</li>
              </ul>
            </div>
            
            <div className="team-member">
              <div className="member-avatar"><i className="fas fa-user-tie"></i></div>
              <h3>Student Support Specialists</h3>
              <p>Professionals dedicated to assisting students in the enrollment process.</p>
              <ul className="member-expertise">
                <li>Visa assistance</li>
                <li>Housing and transportation</li>
                <li>Cultural orientation</li>
              </ul>
            </div>
            <div className="team-member">
              <div className="member-avatar"><i className="fas fa-chalkboard-teacher"></i></div>
              <h3>Academic Experts</h3>
              <p>Professors and researchers with experience in international education.</p>
              <ul className="member-expertise">
                <li>Curriculum development</li>
                <li>Academic research</li>
                <li>Student mentoring</li>
              </ul>
            </div>
          </div>
        </section>

      
      </div>
      <Footer />
    </div>
  );
};

export default About;

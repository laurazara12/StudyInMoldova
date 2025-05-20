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
          <h1>Despre StudyInMoldova</h1>
          <p>Platforma ta de încredere pentru studii în Republica Moldova</p>
        </div>
      </div>

      <div className="about-container">
        <section className="about-section mission-section">
          <div className="section-icon">🎯</div>
          <h2>Misiunea Noastră</h2>
          <p>
            StudyInMoldova este platforma ta de încredere pentru descoperirea oportunităților de studiu în Republica Moldova. 
            Ne dedicăm să oferim studenților internaționali toate informațiile necesare pentru a lua cea mai bună decizie 
            privind educația lor în Moldova.
          </p>
        </section>

        <section className="about-section services-section">
          <div className="section-icon">✨</div>
          <h2>Ce Oferim</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🏛️</div>
              <h3>Universități</h3>
              <p>Informații complete despre universitățile din Moldova, programele lor și facilitățile oferite.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📚</div>
              <h3>Programe de Studiu</h3>
              <p>Detalii despre programele de studiu disponibile, specializări și oportunități de dezvoltare.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🏠</div>
              <h3>Viața Studențească</h3>
              <p>Ghiduri pentru cazare, transport, activități culturale și adaptare în Moldova.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📝</div>
              <h3>Asistență</h3>
              <p>Suport în procesul de înscriere și obținere a documentelor necesare.</p>
            </div>
          </div>
        </section>

        <section className="about-section why-moldova-section">
          <div className="section-icon">🇲🇩</div>
          <h2>De Ce Moldova?</h2>
          <div className="why-moldova-grid">
            <div className="why-moldova-card">
              <h3>Educație de Calitate</h3>
              <p>Universități recunoscute internațional cu programe moderne și profesori experimentați.</p>
            </div>
            <div className="why-moldova-card">
              <h3>Costuri Accesibile</h3>
              <p>Taxe de școlarizare și costuri de trai competitive în comparație cu alte țări europene.</p>
            </div>
            <div className="why-moldova-card">
              <h3>Cultură Bogată</h3>
              <p>O țară cu o istorie fascinantă și o cultură vibrantă, perfectă pentru studenți internaționali.</p>
            </div>
            <div className="why-moldova-card">
              <h3>Locație Strategică</h3>
              <p>Poziționată în inima Europei, cu acces ușor la alte țări europene.</p>
            </div>
          </div>
        </section>

        <section className="about-section team-section">
          <div className="section-icon">👥</div>
          <h2>Echipa Noastră</h2>
          <p className="team-intro">
            Suntem o echipă dedicată de profesioniști cu experiență în educație internațională și asistență studențească. 
            Ne străduim să oferim suport personalizat fiecărui student interesat de studii în Moldova.
          </p>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar">👨‍🎓</div>
              <h3>Consultanți Educaționali</h3>
              <p>Specialiști în ghidarea studenților spre programele potrivite.</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">👩‍💼</div>
              <h3>Asistenți Studenți</h3>
              <p>Profesioniști dedicați suportului în procesul de înscriere.</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">👨‍🏫</div>
              <h3>Experți Academici</h3>
              <p>Profesori și cercetători cu experiență în educație internațională.</p>
            </div>
          </div>
        </section>

        <section className="about-section cta-section">
          <h2>Pregătit să începi aventura ta în Moldova?</h2>
          <p>Hai să explorăm împreună oportunitățile de studiu și să-ți construim viitorul în Republica Moldova!</p>
          <div className="cta-buttons">
            <Link to="/universities" className="cta-button primary">Explorează Universitățile</Link>
            <Link to="/contact" className="cta-button secondary">Contactează-ne</Link>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default About;

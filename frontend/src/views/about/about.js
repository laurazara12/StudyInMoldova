import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import { Helmet } from 'react-helmet-async';
import './about.css';

const About = () => {
  const { t } = useTranslation('about');

  return (
    <div className="about-page">
      <Helmet>
        <title>{t('title')}</title>
        <meta name="description" content={t('description')} />
      </Helmet>

      <Navbar />
      <div className="about-hero">
        <div className="about-hero-content">
          <h1>{t('hero.title')}</h1>
          <p>{t('hero.subtitle')}</p>
        </div>
      </div>

      <div className="about-container">
        <section className="about-section">
          <h2>{t('whatWeOffer.title')}</h2>
          <p>{t('whatWeOffer.description')}</p>
          <div className="features-grid">
            <div className="feature-card">
              <h3>{t('whatWeOffer.features.completeGuide.title')}</h3>
              <p>{t('whatWeOffer.features.completeGuide.description')}</p>
            </div>
            <div className="feature-card">
              <h3>{t('whatWeOffer.features.personalizedAssistance.title')}</h3>
              <p>{t('whatWeOffer.features.personalizedAssistance.description')}</p>
            </div>
            <div className="feature-card">
              <h3>{t('whatWeOffer.features.practicalResources.title')}</h3>
              <p>{t('whatWeOffer.features.practicalResources.description')}</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>{t('whyUnique.title')}</h2>
          <ul className="unique-points">
            <li>
              <strong>{t('whyUnique.points.specializedPlatform')}</strong>
            </li>
            <li>
              <strong>{t('whyUnique.points.updatedInformation')}</strong>
            </li>
            <li>
              <strong>{t('whyUnique.points.personalizedSupport')}</strong>
            </li>
            <li>
              <strong>{t('whyUnique.points.completeResources')}</strong>
            </li>
          </ul>
        </section>

        <section className="about-section">
          <h2>{t('howToUse.title')}</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>{t('howToUse.steps.explore.title')}</h3>
              <p>{t('howToUse.steps.explore.description')}</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>{t('howToUse.steps.plan.title')}</h3>
              <p>{t('howToUse.steps.plan.description')}</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>{t('howToUse.steps.prepare.title')}</h3>
              <p>{t('howToUse.steps.prepare.description')}</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>{t('howToUse.steps.apply.title')}</h3>
              <p>{t('howToUse.steps.apply.description')}</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>{t('vision.title')}</h2>
          <p>{t('vision.description')}</p>
        </section>

        <section className="about-section why-moldova-section">
          <div className="why-moldova-content">
            <div className="why-moldova-grid">
              <div className="why-moldova-card">
                <div className="card-icon"><i className="fas fa-graduation-cap"></i></div>
                <h3>{t('whyMoldova.cards.qualityEducation.title')}</h3>
                <p>{t('whyMoldova.cards.qualityEducation.description')}</p>
              </div>
              <div className="why-moldova-card">
                <div className="card-icon"><i className="fas fa-coins"></i></div>
                <h3>{t('whyMoldova.cards.affordableCosts.title')}</h3>
                <p>{t('whyMoldova.cards.affordableCosts.description')}</p>
              </div>
              <div className="why-moldova-card">
                <div className="card-icon"><i className="fas fa-landmark"></i></div>
                <h3>{t('whyMoldova.cards.richCulture.title')}</h3>
                <p>{t('whyMoldova.cards.richCulture.description')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section services-section">
          <div className="section-header">
            <h2>{t('services.title')}</h2>
            <p>{t('services.subtitle')}</p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon"><i className="fas fa-university"></i></div>
              <h3>{t('services.cards.universities.title')}</h3>
              <p>{t('services.cards.universities.description')}</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><i className="fas fa-book"></i></div>
              <h3>{t('services.cards.studyPrograms.title')}</h3>
              <p>{t('services.cards.studyPrograms.description')}</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><i className="fas fa-home"></i></div>
              <h3>{t('services.cards.studentLife.title')}</h3>
              <p>{t('services.cards.studentLife.description')}</p>
            </div>
          </div>
        </section>

        <section className="about-section stats-section">
          <div className="section-header">
            <h2>{t('statistics.title')}</h2>
            <p>{t('statistics.subtitle')}</p>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{t('statistics.cards.students.number')}</div>
              <h3>{t('statistics.cards.students.title')}</h3>
              <p>{t('statistics.cards.students.description')}</p>
            </div>
            <div className="stat-card">
              <div className="stat-number">{t('statistics.cards.universities.number')}</div>
              <h3>{t('statistics.cards.universities.title')}</h3>
              <p>{t('statistics.cards.universities.description')}</p>
            </div>
            <div className="stat-card">
              <div className="stat-number">{t('statistics.cards.satisfaction.number')}</div>
              <h3>{t('statistics.cards.satisfaction.title')}</h3>
              <p>{t('statistics.cards.satisfaction.description')}</p>
            </div>
          </div>
        </section>

        <section className="about-section cta-section">
          <div className="cta-content">
            <h2>{t('cta.title')}</h2>
            <p>{t('cta.description')}</p>
            <div className="cta-buttons">
              <Link to="/universities" className="cta-button primary">{t('cta.buttons.explore')}</Link>
              <Link to="/contact" className="cta-button secondary">{t('cta.buttons.contact')}</Link>
            </div>
          </div>
        </section>

        <section className="about-section team-section">
          <div className="section-header">
            <h2>{t('team.title')}</h2>
            <p>{t('team.subtitle')}</p>
          </div>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar"><i className="fas fa-user-graduate"></i></div>
              <h3>{t('team.members.consultants.title')}</h3>
              <p>{t('team.members.consultants.description')}</p>
              <ul className="member-expertise">
                {t('team.members.consultants.expertise', { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div className="team-member">
              <div className="member-avatar"><i className="fas fa-user-tie"></i></div>
              <h3>{t('team.members.support.title')}</h3>
              <p>{t('team.members.support.description')}</p>
              <ul className="member-expertise">
                {t('team.members.support.expertise', { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="team-member">
              <div className="member-avatar"><i className="fas fa-chalkboard-teacher"></i></div>
              <h3>{t('team.members.experts.title')}</h3>
              <p>{t('team.members.experts.description')}</p>
              <ul className="member-expertise">
                {t('team.members.experts.expertise', { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
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

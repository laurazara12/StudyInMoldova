import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import './living-in-moldova.css';

const LivingInMoldova = () => {
  const { t } = useTranslation('livingInMoldova');

  return (
    <div className="living-in-moldova-container">
      <Helmet>
        <title>{t('title')} | StudyInMoldova</title>
        <meta name="description" content={t('subtitle')} />
      </Helmet>
      <Navbar rootClassName="navbar-root-class-name" />
      <div className="living-in-moldova-header">
        <div className="living-in-moldova-header-content">
          <h1>{t('title')}</h1>
          <p>{t('subtitle')}</p>
        </div>
      </div>
      <div className="living-in-moldova-content">
        <div className="living-in-moldova-grid">
          <div className="living-in-moldova-card">
            <h2 className="living-in-moldova-card-title">{t('sections.currency.title')}</h2>
            <div className="living-in-moldova-card-content">
              <span>{t('sections.currency.aboutCurrency')}</span>
              {t('sections.currency.currencyInfo', { returnObjects: true }).map((info, index) => (
                <span key={index}>{info}</span>
              ))}
              <span>{t('sections.currency.monthlyBudget')}</span>
              {t('sections.currency.budgetItems', { returnObjects: true }).map((item, index) => (
                <span key={index}>{item}</span>
              ))}
              <div className="living-in-moldova-tip">
                {t('sections.currency.tip')}
              </div>
              <div className="living-in-moldova-links">
                <Link to="/universities" className="living-in-moldova-link">{t('sections.currency.links.universityCosts')}</Link>
                <Link to="/programs" className="living-in-moldova-link">{t('sections.currency.links.programFees')}</Link>
              </div>
            </div>
          </div>

          <div className="living-in-moldova-card">
            <h2 className="living-in-moldova-card-title">{t('sections.accommodation.title')}</h2>
            <div className="living-in-moldova-card-content">
              <span>{t('sections.accommodation.options')}</span>
              {t('sections.accommodation.optionsList', { returnObjects: true }).map((option, index) => (
                <span key={index}>{option}</span>
              ))}
              <span>{t('sections.accommodation.popularAreas')}</span>
              {t('sections.accommodation.areasList', { returnObjects: true }).map((area, index) => (
                <span key={index}>{area}</span>
              ))}
              <div className="living-in-moldova-tip">
                {t('sections.accommodation.tip')}
              </div>
              <div className="living-in-moldova-links">
                <Link to="/universities/usm-university-individual-page" className="living-in-moldova-link">{t('sections.accommodation.links.usmHousing')}</Link>
                <Link to="/universities/utm-university-individual-page" className="living-in-moldova-link">{t('sections.accommodation.links.utmHousing')}</Link>
              </div>
            </div>
          </div>

          <div className="living-in-moldova-card">
            <h2 className="living-in-moldova-card-title">{t('sections.transportation.title')}</h2>
            <div className="living-in-moldova-card-content">
              <span>{t('sections.transportation.intro')}</span>
              {t('sections.transportation.options', { returnObjects: true }).map((option, index) => (
                <span key={index}>{option}</span>
              ))}
              <span>{t('sections.transportation.apps')}</span>
              {t('sections.transportation.appsList', { returnObjects: true }).map((app, index) => (
                <span key={index}>{app}</span>
              ))}
              <div className="living-in-moldova-tip">
                {t('sections.transportation.tip')}
              </div>
              <div className="living-in-moldova-links">
                <Link to="/living-in-moldova/transportation-guide" className="living-in-moldova-link">{t('sections.transportation.links.transportGuide')}</Link>
              </div>
            </div>
          </div>

          <div className="living-in-moldova-card">
            <h2 className="living-in-moldova-card-title">{t('sections.food.title')}</h2>
            <div className="living-in-moldova-card-content">
              <span>{t('sections.food.localFavorites')}</span>
              {t('sections.food.favoritesList', { returnObjects: true }).map((favorite, index) => (
                <span key={index}>{favorite}</span>
              ))}
              <span>{t('sections.food.budgetOptions')}</span>
              {t('sections.food.budgetList', { returnObjects: true }).map((option, index) => (
                <span key={index}>{option}</span>
              ))}
              <div className="living-in-moldova-tip">
                {t('sections.food.tip')}
              </div>
              <div className="living-in-moldova-links">
                <a href="https://www.moldova.travel/en/things-to-do/food-and-drink" target="_blank" rel="noopener noreferrer" className="living-in-moldova-link">{t('sections.food.links.cuisine')}</a>
              </div>
            </div>
          </div>

          <div className="living-in-moldova-card">
            <h2 className="living-in-moldova-card-title">{t('sections.healthcare.title')}</h2>
            <div className="living-in-moldova-card-content">
              <span>{t('sections.healthcare.importantInfo')}</span>
              {t('sections.healthcare.infoList', { returnObjects: true }).map((info, index) => (
                <span key={index}>{info}</span>
              ))}
              <span>{t('sections.healthcare.helpPlaces')}</span>
              {t('sections.healthcare.helpList', { returnObjects: true }).map((place, index) => (
                <span key={index}>{place}</span>
              ))}
              <div className="living-in-moldova-tip">
                {t('sections.healthcare.tip')}
              </div>
              <div className="living-in-moldova-links">
                <Link to="/contact" className="living-in-moldova-link">{t('sections.healthcare.links.insuranceHelp')}</Link>
              </div>
            </div>
          </div>

          <div className="living-in-moldova-card">
            <h2 className="living-in-moldova-card-title">{t('sections.culture.title')}</h2>
            <div className="living-in-moldova-card-content">
              <span>{t('sections.culture.languages')}</span>
              {t('sections.culture.languagesList', { returnObjects: true }).map((language, index) => (
                <span key={index}>{language}</span>
              ))}
              <span>{t('sections.culture.experiences')}</span>
              {t('sections.culture.experiencesList', { returnObjects: true }).map((experience, index) => (
                <span key={index}>{experience}</span>
              ))}
              <div className="living-in-moldova-tip">
                {t('sections.culture.tip')}
              </div>
              <div className="living-in-moldova-links">
                <Link to="/programs" className="living-in-moldova-link">{t('sections.culture.links.languageCourses')}</Link>
                <a href="https://www.moldova.travel/en/things-to-do/culture" target="_blank" rel="noopener noreferrer" className="living-in-moldova-link">{t('sections.culture.links.culturalEvents')}</a>
              </div>
            </div>
          </div>
        </div>

        <div className="living-in-moldova-contact">
          <h2 className="living-in-moldova-contact-title">{t('contact.title')}</h2>
          <p className="living-in-moldova-contact-text">
            {t('contact.text')}
          </p>
          <div className="living-in-moldova-contact-links">
            <Link to="/contact" className="living-in-moldova-contact-button">
              {t('contact.buttons.getInTouch')}
            </Link>
            <Link to="/about" className="living-in-moldova-contact-button">
              {t('contact.buttons.planStudies')}
            </Link>
          </div>
        </div>
      </div>
      <Footer rootClassName="footer-root-class-name" />
    </div>
  );
};

export default LivingInMoldova;

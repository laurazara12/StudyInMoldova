import React from 'react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/navbar'
import Footer from '../../components/footer'
import './documents.css'

const Documents = () => {
  const { t } = useTranslation('documents')

  return (
    <div className="documents-page">
      <Helmet>
        <title>{t('title')} - Study In Moldova</title>
        <meta name="description" content={t('description')} />
        <meta name="keywords" content={t('keywords')} />
      </Helmet>

      <Navbar />
      <div className="documents-container">
        <div className="documents-info">
          <h1>{t('title')}</h1>
          <p className="last-updated">{t('lastUpdated')}: 13.07.2025</p>
          
          <div className="documents-card">
            <div className="documents-section">
              <h2>{t('importantNotice.title')}</h2>
              <div className="notice-box">
                <p>
                  {t('importantNotice.content')}
                </p>
              </div>
            </div>

            <div className="documents-section">
              <h2>{t('generalDocuments.title')}</h2>
              <div className="documents-grid">
                <div className="document-item">
                  <div className="document-icon"><i className="fas fa-graduation-cap"></i></div>
                  <div className="document-details">
                    <h3>{t('generalDocuments.academicDocuments.title')}</h3>
                    <ul>
                      {t('generalDocuments.academicDocuments.items', { returnObjects: true }).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="document-item">
                  <div className="document-icon"><i className="fas fa-id-card"></i></div>
                  <div className="document-details">
                    <h3>{t('generalDocuments.personalDocuments.title')}</h3>
                    <ul>
                      {t('generalDocuments.personalDocuments.items', { returnObjects: true }).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="document-item">
                  <div className="document-icon"><i className="fas fa-language"></i></div>
                  <div className="document-details">
                    <h3>{t('generalDocuments.languageProficiency.title')}</h3>
                    <ul>
                      {t('generalDocuments.languageProficiency.items', { returnObjects: true }).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="document-item">
                  <div className="document-icon"><i className="fas fa-file-alt"></i></div>
                  <div className="document-details">
                    <h3>{t('generalDocuments.applicationDocuments.title')}</h3>
                    <ul>
                      {t('generalDocuments.applicationDocuments.items', { returnObjects: true }).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="documents-section">
              <h2>{t('legalizationRequirements.title')}</h2>
              <div className="legalization-info">
                <h3>{t('legalizationRequirements.subtitle')}</h3>
                <p>
                  {t('legalizationRequirements.content')}
                </p>
                <ul>
                  {t('legalizationRequirements.items', { returnObjects: true }).map((item, index) => (
                    <li key={index}>
                      <strong>{item.title}</strong> {item.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="documents-section">
              <h2>{t('applicationProcess.title')}</h2>
              <div className="process-steps">
                <div className="step-item">
                  <div className="step-icon"><i className="fas fa-1"></i></div>
                  <div className="step-details">
                    <h3>{t('applicationProcess.steps.1.title')}</h3>
                    <p>{t('applicationProcess.steps.1.description')}</p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-icon"><i className="fas fa-2"></i></div>
                  <div className="step-details">
                    <h3>{t('applicationProcess.steps.2.title')}</h3>
                    <p>{t('applicationProcess.steps.2.description')}</p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-icon"><i className="fas fa-3"></i></div>
                  <div className="step-details">
                    <h3>{t('applicationProcess.steps.3.title')}</h3>
                    <p>{t('applicationProcess.steps.3.description')}</p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-icon"><i className="fas fa-4"></i></div>
                  <div className="step-details">
                    <h3>{t('applicationProcess.steps.4.title')}</h3>
                    <p>{t('applicationProcess.steps.4.description')}</p>
                  </div>
                </div>
              </div>
            </div>

            
            <div className="documents-section">
              <h2>{t('needHelp.title')}</h2>
              <div className="help-section">
                <p>
                  {t('needHelp.content')}
                </p>
                <div className="help-buttons">
                  <a href="/contact" className="btn1">{t('needHelp.buttons.contact')}</a>
                  <a href="/faq" className="btn2">{t('needHelp.buttons.faq')}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Documents 
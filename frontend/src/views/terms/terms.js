import React from 'react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/navbar'
import Footer from '../../components/footer'
import './terms.css'

const Terms = () => {
  const { t } = useTranslation('terms')

  return (
    <>
      <Helmet>
        <title>{t('title')} - Study In Moldova</title>
        <meta name="description" content="Terms and conditions for using StudyInMoldova platform" />
      </Helmet>

      <Navbar />
      <div className="terms-container">
        <div className="terms-content">
          <h1>{t('title')}</h1>
          <p className="last-updated">{t('lastUpdated')} 01.03.2024</p>
          
          <section>
            <h2>{t('sections.accepting.title')}</h2>
            <p>{t('sections.accepting.content')}</p>
          </section>

          <section>
            <h2>{t('sections.service.title')}</h2>
            <p>{t('sections.service.content')}</p>
            <ul>
              {t('sections.service.items', { returnObjects: true }).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>{t('sections.obligations.title')}</h2>
            <p>{t('sections.obligations.content')}</p>
            <ul>
              {t('sections.obligations.items', { returnObjects: true }).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>{t('sections.property.title')}</h2>
            <p>{t('sections.property.content')}</p>
            <ul>
              {t('sections.property.items', { returnObjects: true }).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>{t('sections.liability.title')}</h2>
            <p>{t('sections.liability.content')}</p>
            <ul>
              {t('sections.liability.items', { returnObjects: true }).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>{t('sections.modifications.title')}</h2>
            <p>{t('sections.modifications.content')}</p>
          </section>

          <section>
            <h2>{t('sections.law.title')}</h2>
            <p>{t('sections.law.content')}</p>
          </section>

          <section>
            <h2>{t('sections.contact.title')}</h2>
            <p>{t('sections.contact.content')}</p>
            <p>{t('sections.contact.email')}</p>
            <p>{t('sections.contact.phone')}</p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Terms 
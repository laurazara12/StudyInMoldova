import React from 'react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/navbar'
import Footer from '../../components/footer'
import './privacy.css'

const Privacy = () => {
  const { t } = useTranslation('privacy')

  return (
    <>
      <Helmet>
        <title>{t('title')} - Study In Moldova</title>
        <meta name="description" content="Privacy policy for StudyInMoldova platform" />
      </Helmet>

      <Navbar />
      <div className="privacy-container">
        <div className="privacy-content">
          <h1>{t('title')}</h1>
          
          <section>
            <h2>{t('sections.general.title')}</h2>
            <p>{t('sections.general.content')}</p>
          </section>

          <section>
            <h2>{t('sections.information.title')}</h2>
            <p>{t('sections.information.content')}</p>
            <ul>
              {t('sections.information.items', { returnObjects: true }).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>{t('sections.usage.title')}</h2>
            <p>{t('sections.usage.content')}</p>
            <ul>
              {t('sections.usage.items', { returnObjects: true }).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>{t('sections.protection.title')}</h2>
            <p>{t('sections.protection.content')}</p>
          </section>

          <section>
            <h2>{t('sections.rights.title')}</h2>
            <p>{t('sections.rights.content')}</p>
            <ul>
              {t('sections.rights.items', { returnObjects: true }).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>{t('sections.cookies.title')}</h2>
            <p>{t('sections.cookies.content')}</p>
          </section>

          <section>
            <h2>{t('sections.changes.title')}</h2>
            <p>{t('sections.changes.content')}</p>
          </section>

          <section>
            <h2>{t('sections.contact.title')}</h2>
            <p>{t('sections.contact.content')}</p>
            <p>{t('sections.contact.email')}</p>
            <p>{t('sections.contact.phone')}</p>
          </section>

          <section className="last-updated">
            <p>{t('lastUpdated')} 05/21/2025</p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Privacy 
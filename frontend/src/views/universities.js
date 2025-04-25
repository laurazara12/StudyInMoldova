import React, { Fragment, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet'
import Navbar from '../components/navbar'
import SearchBar from '../components/search-bar'
import UniversityPresentation from '../components/UniversityPresentation'
import Footer from '../components/footer'
import universityService from '../services/universityService'
import './universities.css'
import { useAuth } from '../contexts/AuthContext'

const Universities = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const data = await universityService.getAllUniversities();
      setUniversities(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="universities-page">
        <Navbar />
        <div className="universities-loading">{t('universities.loading')}</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="universities-page">
        <Navbar />
        <div className="universities-error">{t('universities.error')}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="universities-page">
      <Helmet>
        <title>{t('universities.title')} | Study in Moldova</title>
        <meta name="description" content={t('universities.metaDescription')} />
      </Helmet>
      <Navbar />
      <div className="universities-content">
        <SearchBar />
        <div className="universities-grid">
          {universities.map((university) => (
            <UniversityPresentation
              key={university.id}
              university={university}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Universities;

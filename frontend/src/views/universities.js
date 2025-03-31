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
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUniversity, setNewUniversity] = useState({
    name: '',
    description: '',
    location: '',
    imageUrl: '',
    website: ''
  });

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

  const handleAddUniversity = async (e) => {
    e.preventDefault();
    try {
      await universityService.createUniversity(newUniversity);
      setNewUniversity({
        name: '',
        description: '',
        location: '',
        imageUrl: '',
        website: ''
      });
      setShowAddForm(false);
      fetchUniversities();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUniversity(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div className="universities-loading">{t('universities.loading')}</div>;
  }

  if (error) {
    return <div className="universities-error">{t('universities.error')}</div>;
  }

  return (
    <div className="universities-container">
      <Helmet>
        <title>{t('universities.title')} | Study in Moldova</title>
        <meta name="description" content={t('universities.metaDescription')} />
      </Helmet>
      <Navbar
        text={
          <Fragment>
            <span className="universities-text10">Study In Moldova</span>
          </Fragment>
        }
        login={
          <Fragment>
            <span className="universities-text11">Login</span>
          </Fragment>
        }
        text2={
          <Fragment>
            <span className="universities-text12">Living In Moldova</span>
          </Fragment>
        }
        text3={
          <Fragment>
            <span className="universities-text13">Programmes</span>
          </Fragment>
        }
        text4={
          <Fragment>
            <span className="universities-text14">Help You Choose</span>
          </Fragment>
        }
        text5={
          <Fragment>
            <span className="universities-text15">Universities</span>
          </Fragment>
        }
        text6={
          <Fragment>
            <span className="universities-text16">Plan Your Studies</span>
          </Fragment>
        }
        login1={
          <Fragment>
            <span className="universities-text17">Login</span>
          </Fragment>
        }
        text12={
          <Fragment>
            <span className="universities-text18">About</span>
          </Fragment>
        }
        text13={
          <Fragment>
            <span className="universities-text19">Features</span>
          </Fragment>
        }
        text14={
          <Fragment>
            <span className="universities-text20">Pricing</span>
          </Fragment>
        }
        text15={
          <Fragment>
            <span className="universities-text21">Team</span>
          </Fragment>
        }
        text16={
          <Fragment>
            <span className="universities-text22">Blog</span>
          </Fragment>
        }
        register={
          <Fragment>
            <span className="universities-text23">Register</span>
          </Fragment>
        }
        register1={
          <Fragment>
            <span className="universities-text24">Register</span>
          </Fragment>
        }
        rootClassName="navbarroot-class-name5"
      ></Navbar>
      <SearchBar
        text1={
          <Fragment>
            <span className="universities-text25">
              Looking for a university ?
            </span>
          </Fragment>
        }
        button={
          <Fragment>
            <span className="universities-text26">Submit</span>
          </Fragment>
        }
      ></SearchBar>
      {user?.role === 'admin' && (
        <div className="admin-controls">
          <button 
            className="add-university-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? t('universities.cancelAdd') : t('universities.addNew')}
          </button>
        </div>
      )}
      {showAddForm && (
        <form className="add-university-form" onSubmit={handleAddUniversity}>
          <input
            type="text"
            name="name"
            placeholder={t('universities.form.name')}
            value={newUniversity.name}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="description"
            placeholder={t('universities.form.description')}
            value={newUniversity.description}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="location"
            placeholder={t('universities.form.location')}
            value={newUniversity.location}
            onChange={handleInputChange}
            required
          />
          <input
            type="url"
            name="imageUrl"
            placeholder={t('universities.form.imageUrl')}
            value={newUniversity.imageUrl}
            onChange={handleInputChange}
            required
          />
          <input
            type="url"
            name="website"
            placeholder={t('universities.form.website')}
            value={newUniversity.website}
            onChange={handleInputChange}
            required
          />
          <button type="submit" className="submit-university-btn">
            {t('universities.form.submit')}
          </button>
        </form>
      )}
      <div className="universities-grid">
        {universities.map((university) => (
          <UniversityPresentation
            key={university.id}
            university={university}
          />
        ))}
      </div>
      <Footer
        link5={
          <Fragment>
            <span className="universities-text36">Link 5</span>
          </Fragment>
        }
        action1={
          <Fragment>
            <span className="universities-text37">Subscribe</span>
          </Fragment>
        }
        content1={
          <Fragment>
            <span className="universities-text38">Subscribe</span>
          </Fragment>
        }
        content3={
          <Fragment>
            <span className="universities-text39">© 2024</span>
          </Fragment>
        }
        link1={
          <Fragment>
            <span className="universities-text40">Link 1</span>
          </Fragment>
        }
        privacyLink={
          <Fragment>
            <span className="universities-text41">Privacy Policy</span>
          </Fragment>
        }
        cookiesLink={
          <Fragment>
            <span className="universities-text42">Cookies Settings</span>
          </Fragment>
        }
        link3={
          <Fragment>
            <span className="universities-text43">Link 3</span>
          </Fragment>
        }
        link4={
          <Fragment>
            <span className="universities-text44">Link 4</span>
          </Fragment>
        }
        link2={
          <Fragment>
            <span className="universities-text45">Link 2</span>
          </Fragment>
        }
        termsLink={
          <Fragment>
            <span className="universities-text46">Terms of Service</span>
          </Fragment>
        }
        content2={
          <Fragment>
            <span className="universities-text47">
              By subscribing you agree to with our Privacy Policy and provide
              consent to receive updates from our company.
            </span>
          </Fragment>
        }
        rootClassName="footerroot-class-name"
      ></Footer>
    </div>
  )
}

export default Universities

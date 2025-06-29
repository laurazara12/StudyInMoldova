import React, { Fragment } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/navbar'
import HeroLandingPage from './components/hero-landing-page'
import FeaturesWhyStudyInMoldova1 from './components/features-why-study-in-moldova1'
import CTA from './components/cta'
import FeaturesWhyStudyInMoldova2 from './components/features-why-study-in-moldova2'
import FeatureLocations from './components/feature-locations'
import FeatureSteps from './components/feature-steps'
import Testimonial from './components/testimonial'
import Footer from '../../components/footer'
import './landing.css'
import { useTranslation } from 'react-i18next';

function Home() {
  const { t } = useTranslation('landing');
  const navigate = useNavigate();
  const handleExplorePrograms = () => {
    navigate('/programs');
  };

  return (
    <div className="landing-container">
      <Helmet>
        <title>Study In Moldova</title>
        <meta property="og:title" content="Study In Moldova" />
      </Helmet>
      <Navbar
        text={
          <Fragment>
            <span className="landing-text10"></span>
          </Fragment>
        }
        login={
          <Fragment>
            <span className="landing-text11">Login</span>
          </Fragment>
        }
        text2={
          <Fragment>
            <span className="landing-text12">Living In Moldova</span>
          </Fragment>
        }
        text3={
          <Fragment>
            <span className="landing-text13">Programmes</span>
          </Fragment>
        }
        text4={
          <Fragment>
            <span className="landing-text14">Help You Choose</span>
          </Fragment>
        }
        text5={
          <Fragment>
            <span className="landing-text15">Universities</span>
          </Fragment>
        }
        text6={
          <Fragment>
            <span className="landing-text16">Plan Your Studies</span>
          </Fragment>
        }
        login1={
          <Fragment>
            <span className="landing-text17">Login</span>
          </Fragment>
        }
        text12={
          <Fragment>
            <span className="landing-text18">About</span>
          </Fragment>
        }
        text13={
          <Fragment>
            <span className="landing-text19">Features</span>
          </Fragment>
        }
        text14={
          <Fragment>
            <span className="landing-text20">Pricing</span>
          </Fragment>
        }
        text15={
          <Fragment>
            <span className="landing-text21">Team</span>
          </Fragment>
        }
        text16={
          <Fragment>
            <span className="landing-text22">Blog</span>
          </Fragment>
        }
        register={
          <Fragment>
            <span className="landing-text23">Register</span>
          </Fragment>
        }
        register1={
          <Fragment>
            <span className="landing-text24">Register</span>
          </Fragment>
        }
        rootClassName="navbarroot-class-name"
      ></Navbar>
      <HeroLandingPage
        action1={
          <Fragment>
            <button 
              className="btn1 "
              onClick={handleExplorePrograms}
            >
              <span>
                <span>{t('heroLandingPage.buttonExplorePrograms')}</span>
              </span>
            </button>
          </Fragment>
        }
        action2={
          <Fragment>
            <span className="btn2">{t('heroLandingPage.buttonContactUs')}</span>
          </Fragment>
        }
        content1={
          <Fragment>
            <span className="landing-text27">
              {t('heroLandingPage.content')}
            </span>
          </Fragment>
        }
        heading1={
          <Fragment>
            <h1 className="landing-text28">{t('heroLandingPage.heading')}</h1>
          </Fragment>
        }
      ></HeroLandingPage>
      <FeaturesWhyStudyInMoldova1
        feature1Title={
          <Fragment>
            <span className="landing-text29">
              {t('featuresWhyStudyInMoldova1.feature1Title')}
            </span>
          </Fragment>
        }
        feature2Title={
          <Fragment>
            <span className="landing-text30">
            {t('featuresWhyStudyInMoldova1.feature2Title')}
            </span>
          </Fragment>
        }
        feature3Title={
          <Fragment>
            {t('featuresWhyStudyInMoldova1.feature3Title')}
          </Fragment>
        }
        feature1Description={
          <Fragment>
            <span className="landing-text32">
              {t('featuresWhyStudyInMoldova1.feature1Description')}
            </span>
          </Fragment>
        }
        feature2Description={
          <Fragment>
            <span className="landing-text33">
            {t('featuresWhyStudyInMoldova1.feature2Description')}
            </span>
          </Fragment>
        }
        feature2Description1={
          <Fragment>
            <span className="landing-text34">
            {t('featuresWhyStudyInMoldova1.feature3Description')}
            </span>
          </Fragment>
        }
      ></FeaturesWhyStudyInMoldova1>
      <CTA
        action1={
          <Fragment>
            <span className="landing-text35">{t('cta.action')}</span>
          </Fragment>
        }
        content1={
          <Fragment>
            <span className="landing-text36">
              {t('cta.content')}
            </span>
          </Fragment>
        }
        heading1={
          <Fragment>
            <span className="landing-text37">
            {t('cta.heading')}
            </span>
          </Fragment>
        }
      ></CTA>
      <FeaturesWhyStudyInMoldova2
        feature1Title={
          <Fragment>
            <span className="landing-text38">{t('featuresWhyStudyInMoldova2.feature1Title')}</span>
          </Fragment>
        }
        feature2Title={
          <Fragment>
            <span className="landing-text39">{t('featuresWhyStudyInMoldova2.feature2Title')}</span>
          </Fragment>
        }
        feature3Title={
          <Fragment>
            <span className="landing-text40">{t('featuresWhyStudyInMoldova2.feature2Title')}</span>
          </Fragment>
        }
        feature1Description={
          <Fragment>
            <span className="landing-text41">
              {t('featuresWhyStudyInMoldova2.feature1Description')}
            </span>
          </Fragment>
        }
        feature2Description={
          <Fragment>
            <span className="landing-text42">
            {t('featuresWhyStudyInMoldova2.feature1Description')}
            </span>
          </Fragment>
        }
        feature3Description={
          <Fragment>
            <span className="landing-text43">
            {t('featuresWhyStudyInMoldova2.feature1Description')}
            </span>
          </Fragment>
        }
        activeTab={0}
      ></FeaturesWhyStudyInMoldova2>

      <FeatureSteps

      stepsDescription={
        <p className="feature-steps-text11 thq-body-large">
              {t('featureSteps.stepsDescription')}
          </p>
      }

      action1={
        <Fragment>
          <button 
            className="btn1 "
            onClick={handleExplorePrograms}
          >
            <span>
              <span>{t('featureSteps.buttonExplorePrograms')}</span>
            </span>
          </button>
        </Fragment>
      }
      action2={
        <Fragment>
          <span className="btn2">{t('featureSteps.buttonContactUs')}</span>
        </Fragment>
      }
      content1={
        <Fragment>
          <span className="landing-text27">
            Your access to Moldovan universities. We process international applications for all universities in Moldova. We evaluate your documents and guide you through the process.
          </span>
        </Fragment>
      }
      heading1={
        <Fragment>
          <h1 className="landing-text28">Study in Moldova</h1>
        </Fragment>
      }
        step1Title={
          <Fragment>
            <span className="landing-text50">{t('featureSteps.steps.1.title')}</span>
          </Fragment>
        }
        step2Title={
          <Fragment>
            <span className="landing-text51">{t('featureSteps.steps.2.title')}</span>
          </Fragment>
        }
        step3Title={
          <Fragment>
            <span className="landing-text52">
            {t('featureSteps.steps.3.title')}
            </span>
          </Fragment>
        }
        step4Title={
          <Fragment>
            <span className="landing-text53">{t('featureSteps.steps.4.title')}</span>
          </Fragment>
        }
        step5Title={
          <Fragment>
            <span className="landing-text54">{t('featureSteps.steps.5.title')}</span>
          </Fragment>
        }
        step6Title={
          <Fragment>
            <span className="landing-text55">{t('featureSteps.steps.6.title')}</span>
          </Fragment>
        }
        step7Title={
          <Fragment>
            <span className="landing-text56">{t('featureSteps.steps.7.title')}</span>
          </Fragment>
        }
        step1Description={
          <Fragment>
            <span className="landing-text57">
            {t('featureSteps.steps.1.description')}
            </span>
          </Fragment>
        }
        step2Description={
          <Fragment>
            <span className="landing-text58">
            {t('featureSteps.steps.2.description')}
            </span>
          </Fragment>
        }
        step3Description={
          <Fragment>
            <span className="landing-text59">
            {t('featureSteps.steps.3.description')}
            </span>
          </Fragment>
        }
        step4Description={
          <Fragment>
            <span className="landing-text60">
            {t('featureSteps.steps.4.description')}
            </span>
          </Fragment>
        }
        step5Description={
          <Fragment>
            <span className="landing-text61">
            {t('featureSteps.steps.5.description')}
            </span>
          </Fragment>
        }
        step6Description={
          <Fragment>
            <span className="landing-text62">
            {t('featureSteps.steps.6.description')}
            </span>
          </Fragment>
        }
        step7Description={
          <Fragment>
            <span className="landing-text63">
            {t('featureSteps.steps.7.description')}
            </span>
          </Fragment>
        }
      ></FeatureSteps>
      <Testimonial

        review1={
          <Fragment>
            <span className="landing-text58">
              {t('testimonial.reviews.1.text')}
            </span>
          </Fragment>
        }
        review2={
          <Fragment>
            <span className="landing-text59">
            {t('testimonial.reviews.2.text')}
            </span>
          </Fragment>
        }
        review3={
          <Fragment>
            <span className="landing-text60">
            {t('testimonial.reviews.3.text')}
            </span>
          </Fragment>
        }
        review4={
          <Fragment>
            <span className="landing-text61">
            {t('testimonial.reviews.4.text')}
            </span>
          </Fragment>
        }
        heading1={
          <Fragment>
            <span className="landing-text63">{t('testimonial.heading')}</span>
          </Fragment>
        }
        author1Name={
          <Fragment>
            <span className="landing-text64">{t('testimonial.reviews.1.author')}</span>
          </Fragment>
        }
        author2Name={
          <Fragment>
            <span className="landing-text65">{t('testimonial.reviews.2.author')}</span>
          </Fragment>
        }
        author3Name={
          <Fragment>
            <span className="landing-text66">{t('testimonial.reviews.3.author')}</span>
          </Fragment>
        }
        author4Name={
          <Fragment>
            <span className="landing-text67">{t('testimonial.reviews.4.author')}</span>
          </Fragment>
        }
        author1Position={
          <Fragment>
            <span className="landing-text68">{t('testimonial.reviews.1.position')}</span>
          </Fragment>
        }
        author2Position={
          <Fragment>
            <span className="landing-text69">{t('testimonial.reviews.2.position')}</span>
          </Fragment>
        }
        author3Position={
          <Fragment>
            <span className="landing-text70">{t('testimonial.reviews.3.position')}</span>
          </Fragment>
        }
        author4Position={
          <Fragment>
            <span className="landing-text71">{t('testimonial.reviews.4.position')}</span>
          </Fragment>
        }
      ></Testimonial>
      <FeatureLocations
        content1={
          <Fragment>
            <span className="landing-text44">
              {t('featureLocations.description')}
            </span>
          </Fragment>
        }
        heading1={
          <Fragment>
            <span className="landing-text45">
              In which cities can you study ?
            </span>
          </Fragment>
        }
        location1={
          <Fragment>
            <span className="landing-text46">Chișinău</span>
          </Fragment>
        }
        location2={
          <Fragment>
            <span className="landing-text47">Other Cities ...</span>
          </Fragment>
        }
        location1Description={
          <Fragment>
            <span className="landing-text48">
              Chișinău - Moldova&apos;s capital city, the place where you can
              find most and the best universities in the country 
            </span>
          </Fragment>
        }
        location2Description={
          <Fragment>
            <span className="landing-text49">
              If Chișinău is not your cup of tea, for sure there are a couple
              other options that you might find interesting. 
            </span>
          </Fragment>
        }
      ></FeatureLocations>
      <Footer
        link5={
          <Fragment>
            <span className="landing-text72">Link 5</span>
          </Fragment>
        }
        action1={
          <Fragment>
            <span className="landing-text73">Subscribe</span>
          </Fragment>
        }
        content1={
          <Fragment>
            <span className="landing-text74">Subscribe</span>
          </Fragment>
        }
        content3={
          <Fragment>
            <span className="landing-text75">
              © 2024
              <span
                dangerouslySetInnerHTML={{
                  __html: ' ',
                }}
              />
            </span>
          </Fragment>
        }
        link1={
          <Fragment>
            <span className="landing-text76">Link 1</span>
          </Fragment>
        }
        privacyLink={
          <Fragment>
            <span className="landing-text77">Privacy Policy</span>
          </Fragment>
        }
        cookiesLink={
          <Fragment>
            <span className="landing-text78">Cookies Settings</span>
          </Fragment>
        }
        link3={
          <Fragment>
            <span className="landing-text79">Link 3</span>
          </Fragment>
        }
        link4={
          <Fragment>
            <span className="landing-text80">Link 4</span>
          </Fragment>
        }
        link2={
          <Fragment>
            <span className="landing-text81">Link 2</span>
          </Fragment>
        }
        termsLink={
          <Fragment>
            <span className="landing-text82">Terms of Service</span>
          </Fragment>
        }
        content2={
          <Fragment>
            <span className="landing-text83">
              By subscribing you agree to with our Privacy Policy and provide
              consent to receive updates from our company.
            </span>
          </Fragment>
        }
      ></Footer>
    </div>
  )
}

export default Home

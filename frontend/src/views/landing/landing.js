import React, { Fragment } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'

import Navbar from '../../components/navbar'
import HeroLandingPage from './components/hero-landing-page'
import FeaturesWhyStudyInMoldova1 from './components/features-why-study-in-moldova1'
import CTA from '../../components/cta'
import FeaturesWhyStudyInMoldova2 from './components/features-why-study-in-moldova2'
import FeatureLocations from './components/feature-locations'
import FeatureSteps from './components/feature-steps'
import Testimonial from './components/testimonial'
import Footer from '../../components/footer'
import './landing.css'

function Home() {
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
            <span className="landing-text10">Study In Moldova</span>
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
                <span>Explore Programs</span>
              </span>
            </button>
          </Fragment>
        }
        action2={
          <Fragment>
            <span className="btn2">Contact Us</span>
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
      ></HeroLandingPage>
      <FeaturesWhyStudyInMoldova1
        feature1Title={
          <Fragment>
            <span className="landing-text29">
              European Education, No Visa Hassle
            </span>
          </Fragment>
        }
        feature2Title={
          <Fragment>
            <span className="landing-text30">
              Globally Recognized Universities
            </span>
          </Fragment>
        }
        feature3Title={
          <Fragment>
            <span className="landing-text31">Education on the Rise</span>
          </Fragment>
        }
        feature1Description={
          <Fragment>
            <span className="landing-text32">
              Moldova offers quality education with a simple application process
              and visa-free entry for many international students. Check if you
              qualify today!
            </span>
          </Fragment>
        }
        feature2Description={
          <Fragment>
            <span className="landing-text33">
              Moldovan institutions like Moldova State University and Technical
              University of Moldova rank in QS Europe University Rankings.
            </span>
          </Fragment>
        }
        feature2Description1={
          <Fragment>
            <span className="landing-text34">
              Moldova's students show steady improvement in global assessments,
              reflecting quality-driven reforms.
            </span>
          </Fragment>
        }
      ></FeaturesWhyStudyInMoldova1>
      <CTA
        action1={
          <Fragment>
            <span className="landing-text35">Apply Now</span>
          </Fragment>
        }
        content1={
          <Fragment>
            <span className="landing-text36">
              Apply in 6 simple steps:
              1. Create your account
              2. Check your eligibility
              3. Prepare your documents
              4. Choose your programs
              5. Submit your application
              6. Track your status
            </span>
          </Fragment>
        }
        heading1={
          <Fragment>
            <span className="landing-text37">
              Start Your Journey to Studying in Moldova Today!
            </span>
          </Fragment>
        }
      ></CTA>
      <FeaturesWhyStudyInMoldova2
        feature1Title={
          <Fragment>
            <span className="landing-text38">High Literacy Rates</span>
          </Fragment>
        }
        feature2Title={
          <Fragment>
            <span className="landing-text39">Affordable Education</span>
          </Fragment>
        }
        feature3Title={
          <Fragment>
            <span className="landing-text40">Education That Moves Forward</span>
          </Fragment>
        }
        feature1Description={
          <Fragment>
            <span className="landing-text41">
              With a 99.6% literacy rate, Moldova provides a strong academic
              foundation for international students.
            </span>
          </Fragment>
        }
        feature2Description={
          <Fragment>
            <span className="landing-text42">
              Studying in Moldova is cost-effective compared to many other
              European countries, making it an attractive option for
              international students.
            </span>
          </Fragment>
        }
        feature3Description={
          <Fragment>
            <span className="landing-text43">
              Moldova is dedicated to quality education, with 6.25% of its GDP
              allocated to public education in 2023—higher than the global
              average of 4.4%. This strong investment ensures well-funded
              universities, skilled professors, and modern learning resources.
              With a 99.7% literacy rate among young adults and a
              student-to-teacher ratio of 17.9 in primary education.
            </span>
          </Fragment>
        }
        activeTab={0}
      ></FeaturesWhyStudyInMoldova2>
      <FeatureSteps
        step1Title={
          <Fragment>
            <span className="landing-text50">1. Create Account</span>
          </Fragment>
        }
        step2Title={
          <Fragment>
            <span className="landing-text51">2. Browse & Save Programs</span>
          </Fragment>
        }
        step3Title={
          <Fragment>
            <span className="landing-text52">
              3. Research Universities
            </span>
          </Fragment>
        }
        step4Title={
          <Fragment>
            <span className="landing-text53">4. Upload Documents</span>
          </Fragment>
        }
        step5Title={
          <Fragment>
            <span className="landing-text54">5. Submit Application</span>
          </Fragment>
        }
        step6Title={
          <Fragment>
            <span className="landing-text55">6. Track Progress</span>
          </Fragment>
        }
        step7Title={
          <Fragment>
            <span className="landing-text56">7. Get Support</span>
          </Fragment>
        }
        step1Description={
          <Fragment>
            <span className="landing-text57">
              Create your account and verify your email. This is your first step towards studying in Moldova.
            </span>
          </Fragment>
        }
        step2Description={
          <Fragment>
            <span className="landing-text58">
              Check if your qualifications meet the requirements for Moldovan universities.
            </span>
          </Fragment>
        }
        step3Description={
          <Fragment>
            <span className="landing-text59">
              Prepare and verify all required documents according to our checklist.
            </span>
          </Fragment>
        }
        step4Description={
          <Fragment>
            <span className="landing-text60">
              Browse and select your preferred study programs from our partner universities.
            </span>
          </Fragment>
        }
        step5Description={
          <Fragment>
            <span className="landing-text61">
              Submit your application and pay the processing fee through our secure platform.
            </span>
          </Fragment>
        }
        step6Description={
          <Fragment>
            <span className="landing-text62">
              Track your application status and receive updates in real-time.
            </span>
          </Fragment>
        }
        step7Description={
          <Fragment>
            <span className="landing-text63">
              Contact us anytime for questions or support throughout your journey.
            </span>
          </Fragment>
        }
      ></FeatureSteps>
      <Testimonial
        review1={
          <Fragment>
            <span className="landing-text58">
              I highly recommend considering Moldova for your studies!
            </span>
          </Fragment>
        }
        review2={
          <Fragment>
            <span className="landing-text59">
              Moldova is a hidden gem for international students seeking quality
              education without breaking the bank.
            </span>
          </Fragment>
        }
        review3={
          <Fragment>
            <span className="landing-text60">
              Choosing Moldova for my Ph.D. studies was one of the best
              decisions I&apos;ve made in my academic career.
            </span>
          </Fragment>
        }
        review4={
          <Fragment>
            <span className="landing-text61">
              My time in Moldova has broadened my horizons and left me with
              unforgettable memories.
            </span>
          </Fragment>
        }
        content1={
          <Fragment>
            <span className="landing-text62">
              Useful Tools:
              • Check Your Eligibility
              • Document Requirements by Country
              • Application Deadlines
              • Processing Times
              • Fee Calculator
            </span>
          </Fragment>
        }
        heading1={
          <Fragment>
            <span className="landing-text63">Student Testimonials</span>
          </Fragment>
        }
        author1Name={
          <Fragment>
            <span className="landing-text64">Jessica Smith</span>
          </Fragment>
        }
        author2Name={
          <Fragment>
            <span className="landing-text65">Ahmed Khan</span>
          </Fragment>
        }
        author3Name={
          <Fragment>
            <span className="landing-text66">Elena Petrova</span>
          </Fragment>
        }
        author4Name={
          <Fragment>
            <span className="landing-text67">David Lee</span>
          </Fragment>
        }
        author1Position={
          <Fragment>
            <span className="landing-text68">Bachelor&apos;s Student</span>
          </Fragment>
        }
        author2Position={
          <Fragment>
            <span className="landing-text69">Master&apos;s Student</span>
          </Fragment>
        }
        author3Position={
          <Fragment>
            <span className="landing-text70">Ph.D. Candidate</span>
          </Fragment>
        }
        author4Position={
          <Fragment>
            <span className="landing-text71">Exchange Student</span>
          </Fragment>
        }
      ></Testimonial>
      <FeatureLocations
        content1={
          <Fragment>
            <span className="landing-text44">
              Moldova is not a big country, and while there are universities in
              other cities, most opportunities for higher education can be found
              in the capital city, Chișinău.
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

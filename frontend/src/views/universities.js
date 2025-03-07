import React, { Fragment } from 'react'

import { Helmet } from 'react-helmet'

import Navbar from '../components/navbar'
import SearchBar from '../components/search-bar'
import UniversityPresentation from '../components/university-presentation'
import Footer from '../components/footer'
import './universities.css'

const Universities = (props) => {
  return (
    <div className="universities-container">
      <Helmet>
        <title>Universities - exported project</title>
        <meta property="og:title" content="Universities - exported project" />
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
      <UniversityPresentation
        rootClassName="university-presentationroot-class-name"
        universityName="Moldova State University"
        universityContactUniversityButtonUrl="https://international.usm.md/"
        universityState={
          <Fragment>
            <span className="universities-text27">Public University </span>
          </Fragment>
        }
        universityImage="https://raw.githubusercontent.com/laurazara12/Study-in-Moldova/refs/heads/main/images/1b28fedef0a20c48308bae0e7b4f7b9a.jpg"
        seeMoreButton={
          <Fragment>
            <span className="universities-text28">See More</span>
          </Fragment>
        }
        universityDescription={
          <Fragment>
            <span className="universities-text29">
              Moldova State University (USM) is the leading public university in
              Moldova, located in the capital, Chișinău. Offers a wide range of
              programs across various faculties, including law, economics,
              international relations, and engineering. With a strong reputation
              in education and research, USM has partnerships with universities
              worldwide and welcomes students from over 80 countries.
            </span>
          </Fragment>
        }
      ></UniversityPresentation>
      <UniversityPresentation
        universityName="Moldova Technical University"
        universityContactUniversityButtonUrl="https://utm.md/en/"
        universityState={
          <Fragment>
            <span className="universities-text30">Public University </span>
          </Fragment>
        }
        universityImage="https://raw.githubusercontent.com/laurazara12/Study-in-Moldova/refs/heads/main/images/utm-main.webp"
        seeMoreButton={
          <Fragment>
            <span className="universities-text31">See More</span>
          </Fragment>
        }
        universityDescription={
          <Fragment>
            <span className="universities-text32">
              The Technical University of Moldova (UTM) is the engineering and
              technology institution in the country, shaping the future through
              innovation, research, and academic excellence.
              <span
                dangerouslySetInnerHTML={{
                  __html: ' ',
                }}
              />
            </span>
          </Fragment>
        }
      ></UniversityPresentation>
      <UniversityPresentation
        universityName="Nicolae Testimitanu State University of Medicine and Pharmacy "
        universityState={
          <Fragment>
            <span className="universities-text33">Public University</span>
          </Fragment>
        }
        seeMoreButton={
          <Fragment>
            <span className="universities-text34">See More</span>
          </Fragment>
        }
        universityDescription={
          <Fragment>
            <span className="universities-text35">
              The Nicolae Testemițanu State University of Medicine and Pharmacy
              is Moldova’s leading medical institution, known for its high
              academic standards and modern facilities. With a strong emphasis
              on practical training, international collaboration, and
              cutting-edge research, the university prepares students for
              successful medical careers worldwide. It offers English-taught
              programs, making it an excellent choice for international
              students.
            </span>
          </Fragment>
        }
        universityRankingText="Ranking Web of Universities (Webometrics) place 3657 ( first place in Moldova ) "
        universityLink="https://admission.usmf.md/en"
        tuitionFeesMaster="  "
        tuitionFeesPHD="  "
        tuitionFeesBachelor="Integrated: 4000 -  7000 Euro / Year  "
        universityImage="/images/dsc_5137-1000w.jpeg"
      ></UniversityPresentation>
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
            <span className="universities-text39">
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

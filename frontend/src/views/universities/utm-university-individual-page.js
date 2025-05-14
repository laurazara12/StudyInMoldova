import React, { Fragment, useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import Navbar from '../../components/navbar'
import USMHeroUniversityIndividualPage1 from '../../components/usm-hero-university-individual-page1'
import FeatureStudyCycles from '../../components/feature-study-cycles'
import UniHeroVideo from '../../components/uni-hero-video'
import { API_BASE_URL, getAuthHeaders } from '../../config/api.config'
import './utm-university-individual-page.css'

const UTMUniversityIndividualPage = (props) => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/programs?universityId=2`, {
          headers: getAuthHeaders()
        });
        
        if (!response.ok) {
          throw new Error(`Eroare HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        if (!data || !Array.isArray(data)) {
          throw new Error('Format invalid al datelor primite');
        }
        
        setPrograms(data);
      } catch (err) {
        console.error('Eroare la încărcarea programelor:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  return (
    <div className="utm-university-individual-page-container">
      <Helmet>
        <title>UTMUniversityIndividualPage - exported project</title>
        <meta
          property="og:title"
          content="UTMUniversityIndividualPage - exported project"
        />
      </Helmet>
      <Navbar
        text={
          <Fragment>
            <span className="utm-university-individual-page-text10">
              Study In Moldova
            </span>
          </Fragment>
        }
        login={
          <Fragment>
            <span className="utm-university-individual-page-text11">Login</span>
          </Fragment>
        }
        text2={
          <Fragment>
            <span className="utm-university-individual-page-text12">
              Living In Moldova
            </span>
          </Fragment>
        }
        text3={
          <Fragment>
            <span className="utm-university-individual-page-text13">
              Programmes
            </span>
          </Fragment>
        }
        text4={
          <Fragment>
            <span className="utm-university-individual-page-text14">
              Help You Choose
            </span>
          </Fragment>
        }
        text5={
          <Fragment>
            <span className="utm-university-individual-page-text15">
              Universities
            </span>
          </Fragment>
        }
        text6={
          <Fragment>
            <span className="utm-university-individual-page-text16">
              Plan Your Studies
            </span>
          </Fragment>
        }
        login1={
          <Fragment>
            <span className="utm-university-individual-page-text17">Login</span>
          </Fragment>
        }
        text12={
          <Fragment>
            <span className="utm-university-individual-page-text18">About</span>
          </Fragment>
        }
        text13={
          <Fragment>
            <span className="utm-university-individual-page-text19">
              Features
            </span>
          </Fragment>
        }
        text14={
          <Fragment>
            <span className="utm-university-individual-page-text20">
              Pricing
            </span>
          </Fragment>
        }
        text15={
          <Fragment>
            <span className="utm-university-individual-page-text21">Team</span>
          </Fragment>
        }
        text16={
          <Fragment>
            <span className="utm-university-individual-page-text22">Blog</span>
          </Fragment>
        }
        register={
          <Fragment>
            <span className="utm-university-individual-page-text23">
              Register
            </span>
          </Fragment>
        }
        register1={
          <Fragment>
            <span className="utm-university-individual-page-text24">
              Register
            </span>
          </Fragment>
        }
        rootClassName="navbarroot-class-name7"
      ></Navbar>
      <USMHeroUniversityIndividualPage1
        action1={
          <Fragment>
            <span className="utm-university-individual-page-text25">
              See the official website
            </span>
          </Fragment>
        }
        content1={
          <Fragment>
            <span className="utm-university-individual-page-text26">
              The Technical University of Moldova (UTM) is the engineering and
              technology institution in the country, shaping the future through
              innovation, research, and academic excellence. Established in
              1964, UTM has grown into a hub of technical education, offering a
              wide range of programs in engineering, architecture, IT, food
              technology, and more. With state-of-the-art laboratories,
              international collaborations, and a strong focus on practical
              skills, UTM prepares students to become industry-ready
              professionals. Its commitment to research and development makes it
              a key player in Moldova's technological advancement, fostering a
              new generation of engineers and innovators.
            </span>
          </Fragment>
        }
        heading1={
          <Fragment>
            <span className="utm-university-individual-page-text27">
              Welcome to Technical University of Moldova
            </span>
          </Fragment>
        }
        image1Src="/images/img_4929-1400w.jpg"
      ></USMHeroUniversityIndividualPage1>
      <FeatureStudyCycles
        sectionTitle={
          <Fragment>
            <span className="utm-university-individual-page-text28">
              Discover the ONLY higher education that shapes future engineers of
              Moldova
            </span>
          </Fragment>
        }
        feature1Title={
          <Fragment>
            <span className="utm-university-individual-page-text29">
              Bachelor&apos;s degree
              <span
                dangerouslySetInnerHTML={{
                  __html: ' ',
                }}
              />
            </span>
          </Fragment>
        }
        feature1Title1={
          <Fragment>
            <span className="utm-university-individual-page-text30">
              <span className="utm-university-individual-page-text31">
                3-4 years (180-240 ECTS)
              </span>
              <span>
                <span
                  dangerouslySetInnerHTML={{
                    __html: ' ',
                  }}
                />
              </span>
            </span>
          </Fragment>
        }
        feature1Title2={
          <Fragment>
            <span className="utm-university-individual-page-text33">
              Master&apos;s degree
              <span
                dangerouslySetInnerHTML={{
                  __html: ' ',
                }}
              />
            </span>
          </Fragment>
        }
        feature1Title3={
          <Fragment>
            <span className="utm-university-individual-page-text34">
              Doctoral studies/PhD
              <span
                dangerouslySetInnerHTML={{
                  __html: ' ',
                }}
              />
            </span>
          </Fragment>
        }
        feature1Title11={
          <Fragment>
            <span className="utm-university-individual-page-text35">
              <span className="utm-university-individual-page-text36">
                1-2 years (60-120 ECTS)
              </span>
              <span>
                <span
                  dangerouslySetInnerHTML={{
                    __html: ' ',
                  }}
                />
              </span>
            </span>
          </Fragment>
        }
        feature1Title12={
          <Fragment>
            <span className="utm-university-individual-page-text38">
              <span className="utm-university-individual-page-text39">
                3-4 years
              </span>
              <span>
                <span
                  dangerouslySetInnerHTML={{
                    __html: ' ',
                  }}
                />
              </span>
            </span>
          </Fragment>
        }
        sectionDescription={
          <Fragment>
            <span className="utm-university-individual-page-text41">
              The Republic of Moldova has been part of the Bologna Process since
              2005, when it joined the European Higher Education Area (EHEA).
              Since then, the country has reformed its higher education system
              to align with the three-cycle structure
            </span>
          </Fragment>
        }
        feature1Description={
          <Fragment>
            <span className="utm-university-individual-page-text42">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse varius enim in eros elementum tristique. Duis cursus,
              mi quis viverra ornare, eros dolor interdum nulla.
            </span>
          </Fragment>
        }
        feature2Description={
          <Fragment>
            <span className="utm-university-individual-page-text43">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse varius enim in eros elementum tristique. Duis cursus,
              mi quis viverra ornare, eros dolor interdum nulla.
            </span>
          </Fragment>
        }
        feature3Description={
          <Fragment>
            <span className="utm-university-individual-page-text44">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse varius enim in eros elementum tristique. Duis cursus,
              mi quis viverra ornare, eros dolor interdum nulla.
            </span>
          </Fragment>
        }
      ></FeatureStudyCycles>

      <div className="programs-table-container">
        <h2 className="programs-title">Discover the available programs</h2>
        {loading ? (
          <div className="loading">Se încarcă...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <table className="programs-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Faculty</th>
                <th>Degree</th>
                <th>Credits</th>
                <th>Languages</th>
              </tr>
            </thead>
            <tbody>
              {programs.length > 0 ? (
                programs.map((program) => (
                  <tr key={program.id} className="program-row">
                    <td>{program.name}</td>
                    <td>{program.faculty}</td>
                    <td>{program.degree}</td>
                    <td>{program.credits}</td>
                    <td>{Array.isArray(program.languages) ? program.languages.join(', ') : program.languages}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-results">
                    Nu s-au găsit programe disponibile.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <UniHeroVideo
        content1={
          <Fragment>
            <span className="utm-university-individual-page-text51">
              <br></br>
              <span>
                Ranked among the top three universities in The Technical
                University of Moldova (UTM) has once again confirmed its
                position as one of the country&apos;s top universities, ranking
                second in the Webometrics 2024 classification for Moldova. This
                ranking, conducted by the Cybermetrics Lab of the Spanish
                National Research Council, evaluates universities worldwide
                based on visibility, transparency, and research excellence.
                <span
                  dangerouslySetInnerHTML={{
                    __html: ' ',
                  }}
                />
              </span>
            </span>
          </Fragment>
        }
        heading1={
          <Fragment>
            <span className="utm-university-individual-page-text54">
              Engineers create the future
            </span>
          </Fragment>
        }
      ></UniHeroVideo>
    </div>
  )
}

export default UTMUniversityIndividualPage

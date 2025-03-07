import React, { Fragment } from 'react'

import { Helmet } from 'react-helmet'

import Navbar from '../../components/navbar'
import USMHeroUniversityIndividualPage from '../../components/usm-hero-university-individual-page'
import AvailableProgramesTable from '../../components/available-programes-table'
import FeatureStudyCycles from '../../components/feature-study-cycles'
import UniHeroVideo from '../../components/uni-hero-video'
import './usm-university-individual-page.css'

const USMUniversityIndividualPage = (props) => {
  return (
    <div className="usm-university-individual-page-container">
      <Helmet>
        <title>USMUniversityIndividualPage - exported project</title>
        <meta
          property="og:title"
          content="USMUniversityIndividualPage - exported project"
        />
      </Helmet>
      <Navbar
        text={
          <Fragment>
            <span className="usm-university-individual-page-text10">
              Study In Moldova
            </span>
          </Fragment>
        }
        login={
          <Fragment>
            <span className="usm-university-individual-page-text11">Login</span>
          </Fragment>
        }
        text2={
          <Fragment>
            <span className="usm-university-individual-page-text12">
              Living In Moldova
            </span>
          </Fragment>
        }
        text3={
          <Fragment>
            <span className="usm-university-individual-page-text13">
              Programmes
            </span>
          </Fragment>
        }
        text4={
          <Fragment>
            <span className="usm-university-individual-page-text14">
              Help You Choose
            </span>
          </Fragment>
        }
        text5={
          <Fragment>
            <span className="usm-university-individual-page-text15">
              Universities
            </span>
          </Fragment>
        }
        text6={
          <Fragment>
            <span className="usm-university-individual-page-text16">
              Plan Your Studies
            </span>
          </Fragment>
        }
        login1={
          <Fragment>
            <span className="usm-university-individual-page-text17">Login</span>
          </Fragment>
        }
        text12={
          <Fragment>
            <span className="usm-university-individual-page-text18">About</span>
          </Fragment>
        }
        text13={
          <Fragment>
            <span className="usm-university-individual-page-text19">
              Features
            </span>
          </Fragment>
        }
        text14={
          <Fragment>
            <span className="usm-university-individual-page-text20">
              Pricing
            </span>
          </Fragment>
        }
        text15={
          <Fragment>
            <span className="usm-university-individual-page-text21">Team</span>
          </Fragment>
        }
        text16={
          <Fragment>
            <span className="usm-university-individual-page-text22">Blog</span>
          </Fragment>
        }
        register={
          <Fragment>
            <span className="usm-university-individual-page-text23">
              Register
            </span>
          </Fragment>
        }
        register1={
          <Fragment>
            <span className="usm-university-individual-page-text24">
              Register
            </span>
          </Fragment>
        }
        rootClassName="navbarroot-class-name6"
      ></Navbar>
      <USMHeroUniversityIndividualPage
        content1={
          <Fragment>
            <span className="usm-university-individual-page-text25">
              Moldova State University (USM) is the oldest and one of the most
              prestigious higher education institutions in Moldova. Founded on
              October 1, 1946, it started with 320 students and 35 teachers
              across five faculties. Today, it has grown to over 20,500 students
              and 1,145 academic staff, offering programs in 11 faculties. USM
              is a plenipotentiary member of the International Association of
              Universities and has signed over 60 cooperation agreements with
              institutions from 25 countries. Recognized in the QS Emerging
              Europe and Central Asia University Rankings (301–350 in 2022), USM
              continues to be a key center for research, academic excellence,
              and international collaboration.
            </span>
          </Fragment>
        }
        heading1={
          <Fragment>
            <span className="usm-university-individual-page-text26">
              Welcome to State University of Moldova
            </span>
          </Fragment>
        }
      ></USMHeroUniversityIndividualPage>
      <AvailableProgramesTable
        feature1Title={
          <Fragment>
            <span className="usm-university-individual-page-text27">
              Discover the available programs
            </span>
          </Fragment>
        }
        feature5Title411={
          <Fragment>
            <span className="usm-university-individual-page-text28">
              Credits
            </span>
          </Fragment>
        }
        feature5Title412={
          <Fragment>
            <span className="usm-university-individual-page-text29">
              Degree
            </span>
          </Fragment>
        }
        feature5Title413={
          <Fragment>
            <span className="usm-university-individual-page-text30">Name</span>
          </Fragment>
        }
        feature5Title4111={
          <Fragment>
            <span className="usm-university-individual-page-text31">
              Languages
            </span>
          </Fragment>
        }
        feature5Title4131={
          <Fragment>
            <span className="usm-university-individual-page-text32">
              Faculty
            </span>
          </Fragment>
        }
      ></AvailableProgramesTable>
      <FeatureStudyCycles
        sectionTitle={
          <Fragment>
            <span className="usm-university-individual-page-text33">
              Discover each Study Program at USM
            </span>
          </Fragment>
        }
        feature1Title={
          <Fragment>
            <span className="usm-university-individual-page-text34">
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
            <span className="usm-university-individual-page-text35">
              <span className="usm-university-individual-page-text36">
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
            <span className="usm-university-individual-page-text38">
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
            <span className="usm-university-individual-page-text39">
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
            <span className="usm-university-individual-page-text40">
              <span className="usm-university-individual-page-text41">
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
            <span className="usm-university-individual-page-text43">
              <span className="usm-university-individual-page-text44">
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
            <span className="usm-university-individual-page-text46">
              The Republic of Moldova has been part of the Bologna Process since
              2005, when it joined the European Higher Education Area (EHEA).
              Since then, the country has reformed its higher education system
              to align with the three-cycle structure
            </span>
          </Fragment>
        }
        feature1Description={
          <Fragment>
            <span className="usm-university-individual-page-text47">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse varius enim in eros elementum tristique. Duis cursus,
              mi quis viverra ornare, eros dolor interdum nulla.
            </span>
          </Fragment>
        }
        feature2Description={
          <Fragment>
            <span className="usm-university-individual-page-text48">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse varius enim in eros elementum tristique. Duis cursus,
              mi quis viverra ornare, eros dolor interdum nulla.
            </span>
          </Fragment>
        }
        feature3Description={
          <Fragment>
            <span className="usm-university-individual-page-text49">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse varius enim in eros elementum tristique. Duis cursus,
              mi quis viverra ornare, eros dolor interdum nulla.
            </span>
          </Fragment>
        }
      ></FeatureStudyCycles>
      <UniHeroVideo
        content1={
          <Fragment>
            <span className="usm-university-individual-page-text50">
              <br></br>
              <span>
                Ranked among the top three universities in Moldova by
                Webometrics 2024, the State University of Moldova (USM) stands
                out for its academic excellence, cutting-edge research, and
                strong international partnerships.
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
            <span className="usm-university-individual-page-text53">
              A Hub of Excellence and Innovation 
            </span>
          </Fragment>
        }
      ></UniHeroVideo>
    </div>
  )
}

export default USMUniversityIndividualPage

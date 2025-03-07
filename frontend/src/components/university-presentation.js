import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'

import PropTypes from 'prop-types'

import Footer from './footer'
import './university-presentation.css'

const UniversityPresentation = (props) => {
  return (
    <div
      className={`university-presentation-layout216 thq-section-padding ${props.rootClassName} `}
    >
      <div className="university-presentation-university-container thq-flex-row thq-section-max-width">
        <div className="university-presentation-university-image-container thq-flex-column">
          <img
            alt="PlaceholderImage1314"
            src={props.universityImage}
            loading="eager"
            id="Prop Content"
            className="thq-img-ratio-4-3 university-presentation-image1"
          />
          <Footer
            link5={
              <Fragment>
                <span className="university-presentation-text10">Link 5</span>
              </Fragment>
            }
            action1={
              <Fragment>
                <span className="university-presentation-text11">
                  Subscribe
                </span>
              </Fragment>
            }
            content1={
              <Fragment>
                <span className="university-presentation-text12">
                  Subscribe
                </span>
              </Fragment>
            }
            content3={
              <Fragment>
                <span className="university-presentation-text13">
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
                <span className="university-presentation-text14">Link 1</span>
              </Fragment>
            }
            privacyLink={
              <Fragment>
                <span className="university-presentation-text15">
                  Privacy Policy
                </span>
              </Fragment>
            }
            cookiesLink={
              <Fragment>
                <span className="university-presentation-text16">
                  Cookies Settings
                </span>
              </Fragment>
            }
            link3={
              <Fragment>
                <span className="university-presentation-text17">Link 3</span>
              </Fragment>
            }
            link4={
              <Fragment>
                <span className="university-presentation-text18">Link 4</span>
              </Fragment>
            }
            link2={
              <Fragment>
                <span className="university-presentation-text19">Link 2</span>
              </Fragment>
            }
            termsLink={
              <Fragment>
                <span className="university-presentation-text20">
                  Terms of Service
                </span>
              </Fragment>
            }
            content2={
              <Fragment>
                <span className="university-presentation-text21">
                  By subscribing you agree to with our Privacy Policy and
                  provide consent to receive updates from our company.
                </span>
              </Fragment>
            }
          ></Footer>
          <Footer
            link5={
              <Fragment>
                <span className="university-presentation-text22">Link 5</span>
              </Fragment>
            }
            action1={
              <Fragment>
                <span className="university-presentation-text23">
                  Subscribe
                </span>
              </Fragment>
            }
            content1={
              <Fragment>
                <span className="university-presentation-text24">
                  Subscribe
                </span>
              </Fragment>
            }
            content3={
              <Fragment>
                <span className="university-presentation-text25">
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
                <span className="university-presentation-text26">Link 1</span>
              </Fragment>
            }
            privacyLink={
              <Fragment>
                <span className="university-presentation-text27">
                  Privacy Policy
                </span>
              </Fragment>
            }
            cookiesLink={
              <Fragment>
                <span className="university-presentation-text28">
                  Cookies Settings
                </span>
              </Fragment>
            }
            link3={
              <Fragment>
                <span className="university-presentation-text29">Link 3</span>
              </Fragment>
            }
            link4={
              <Fragment>
                <span className="university-presentation-text30">Link 4</span>
              </Fragment>
            }
            link2={
              <Fragment>
                <span className="university-presentation-text31">Link 2</span>
              </Fragment>
            }
            termsLink={
              <Fragment>
                <span className="university-presentation-text32">
                  Terms of Service
                </span>
              </Fragment>
            }
            content2={
              <Fragment>
                <span className="university-presentation-text33">
                  By subscribing you agree to with our Privacy Policy and
                  provide consent to receive updates from our company.
                </span>
              </Fragment>
            }
          ></Footer>
        </div>
        <div className="university-presentation-university-content thq-flex-column">
          <div className="university-presentation-university-component1 thq-flex-column">
            <div className="university-presentation-university-title">
              <span className="thq-body-small">
                {props.universityState ?? (
                  <Fragment>
                    <span className="university-presentation-text41">
                      Public University 
                    </span>
                  </Fragment>
                )}
              </span>
              <h2 id={props.universityNameId} className="thq-heading-2">
                {props.universityName}
              </h2>
            </div>
            <p className="thq-body-large">
              {props.universityDescription ?? (
                <Fragment>
                  <span className="university-presentation-text40">
                    Moldova State University (USM) is the leading public
                    university in Moldova, located in the capital, Chișinău.
                    Offers a wide range of programs across various faculties,
                    including law, economics, international relations, and
                    engineering. With a strong reputation in education and
                    research, USM has partnerships with universities worldwide
                    and welcomes students from over 80 countries. It provides
                    modern facilities, experienced faculty, and a dynamic
                    academic environment, making it an excellent choice for
                    international students seeking quality education in Moldova.
                  </span>
                </Fragment>
              )}
            </p>
            <p id="universityLink" className="thq-body-large">
              {props.universityLink}
            </p>
          </div>
          <div className="university-presentation-university-component2 thq-flex-row">
            <div
              id={props.universityRanking}
              className="university-presentation-list-item1 thq-flex-column"
            >
              <h3 className="thq-heading-3">University rankings</h3>
              <span className="thq-body-small">
                {props.universityRankingText}
              </span>
            </div>
            <div
              id="TuitionFees"
              className="university-presentation-list-item2 thq-flex-column"
            >
              <h3 className="thq-heading-3 university-presentation-text36">
                {props.tuitionFees}
              </h3>
              <span className="university-presentation-text37 thq-body-small">
                {props.tuitionFeesBachelor}
              </span>
              <span className="university-presentation-text38 thq-body-small">
                {props.tuitionFeesMaster}
              </span>
              <span className="university-presentation-text39 thq-body-small">
                {props.tuitionFeesPHD}
              </span>
            </div>
          </div>
          <div
            id="UniversityCTAButtons"
            className="university-presentation-university-action-buttons thq-flex-row"
          >
            <Link
              to="/universities/usm"
              className="university-presentation-university-see-more-button thq-button-filled"
            >
              <span className="thq-body-small">
                {props.seeMoreButton ?? (
                  <Fragment>
                    <span className="university-presentation-text42">
                      See More
                    </span>
                  </Fragment>
                )}
              </span>
            </Link>
            <a
              href={props.universityContactUniversityButtonUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="university-presentation-university-contact-university-button thq-button-outline"
            >
              <span className="thq-body-small">Contact University</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

UniversityPresentation.defaultProps = {
  tuitionFeesBachelor: 'Bachelor',
  tuitionFees: 'Tuition Fees (2023)',
  universityNameId: 'universityNameId',
  universityDescription: undefined,
  rootClassName: '',
  universityName: 'University Name',
  universityImage: 'PlaceholderImage1314',
  universityState: undefined,
  universityContactUniversityButtonUrl: '',
  tuitionFeesMaster: 'Master',
  seeMoreButton: undefined,
  tuitionFeesPHD: 'PHP',
  universityRanking: 'UniversityRankings',
  universityRankingText: 'QS Emerging Europe and Central Asia 301–350 (2022)',
  universityLink: 'https://international.usm.md/',
}

UniversityPresentation.propTypes = {
  tuitionFeesBachelor: PropTypes.string,
  tuitionFees: PropTypes.string,
  universityNameId: PropTypes.string,
  universityDescription: PropTypes.element,
  rootClassName: PropTypes.string,
  universityName: PropTypes.string,
  universityImage: PropTypes.string,
  universityState: PropTypes.element,
  universityContactUniversityButtonUrl: PropTypes.string,
  tuitionFeesMaster: PropTypes.string,
  seeMoreButton: PropTypes.element,
  tuitionFeesPHD: PropTypes.string,
  universityRanking: PropTypes.string,
  universityRankingText: PropTypes.string,
  universityLink: PropTypes.string,
}

export default UniversityPresentation

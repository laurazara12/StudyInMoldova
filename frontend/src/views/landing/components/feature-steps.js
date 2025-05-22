import React, { Fragment } from 'react'

import PropTypes from 'prop-types'

import './feature-steps.css'

const FeatureSteps = (props) => {
  return (
    <div className="feature-steps-container1 thq-section-padding">
      <div className="feature-steps-max-width thq-section-max-width">
        <div className="feature-steps-container2 thq-grid-2">
          <div className="feature-steps-section-header">
            <h2 className="thq-heading-2">
              Make the best out of your study years !
            </h2>
            <p className="feature-steps-text11 thq-body-large">
              Moldova offers a unique blend of quality education, affordable
              tuition, and a vibrant multicultural environment. With
              internationally recognized universities, modern research
              opportunities, and a welcoming community, studying in Moldova
              opens doors to global career prospects. Whether you&apos;re
              pursuing medicine, business, or technology, Moldova provides the
              perfect setting for academic excellence and personal growth.
            </p>
            <div className="feature-steps-actions">
              <button className="thq-button-filled thq-button-animated feature-steps-button">
                <span className="thq-body-small">See programs</span>
              </button>
            </div>
          </div>
          <div className="feature-steps-container3">
            <div className="feature-steps-container4 thq-card">
              <h2 className="thq-heading-2">
                {props.step1Title ?? (
                  <Fragment>
                    <span className="feature-steps-text31">
                      Research Programs
                    </span>
                  </Fragment>
                )}
              </h2>
              <span className="feature-steps-text14 thq-body-small">
                {props.step1Description ?? (
                  <Fragment>
                    <span className="feature-steps-text28">
                      Explore the different study programs available in Moldova
                      to find the one that best fits your academic goals and
                      interests.
                    </span>
                  </Fragment>
                )}
              </span>
              <label className="feature-steps-text15 thq-heading-3">01</label>
            </div>
            <div className="feature-steps-container5 thq-card">
              <h2 className="thq-heading-2">
                {props.step2Title ?? (
                  <Fragment>
                    <span className="feature-steps-text25">
                      Choose a University
                    </span>
                  </Fragment>
                )}
              </h2>
              <span className="feature-steps-text17 thq-body-small">
                {props.step2Description ?? (
                  <Fragment>
                    <span className="feature-steps-text27">
                      Select a university in Moldova that offers your desired
                      program and has a strong reputation for academic
                      excellence.
                    </span>
                  </Fragment>
                )}
              </span>
              <label className="feature-steps-text18 thq-heading-3">02</label>
            </div>
            <div className="feature-steps-container6 thq-card">
              <h2 className="thq-heading-2">
                {props.step3Title ?? (
                  <Fragment>
                    <span className="feature-steps-text29">
                      Arrange Living Accommodations
                    </span>
                  </Fragment>
                )}
              </h2>
              <span className="feature-steps-text20 thq-body-small">
                {props.step3Description ?? (
                  <Fragment>
                    <span className="feature-steps-text26">
                      Secure suitable living arrangements, whether on-campus or
                      off-campus, to ensure a comfortable stay during your
                      studies.
                    </span>
                  </Fragment>
                )}
              </span>
              <label className="feature-steps-text21 thq-heading-3">03</label>
            </div>
            <div className="feature-steps-container7 thq-card">
              <h2 className="thq-heading-2">
                {props.step4Title ?? (
                  <Fragment>
                    <span className="feature-steps-text30">
                      Prepare Necessary Documents
                    </span>
                  </Fragment>
                )}
              </h2>
              <span className="feature-steps-text23 thq-body-small">
                {props.step4Description ?? (
                  <Fragment>
                    <span className="feature-steps-text32">
                      Gather all required documents for studying in Moldova,
                      including academic transcripts, identification papers, and
                      visa paperwork.
                    </span>
                  </Fragment>
                )}
              </span>
              <label className="feature-steps-text24 thq-heading-3">04</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

FeatureSteps.defaultProps = {
  step2Title: undefined,
  step3Description: undefined,
  step2Description: undefined,
  step1Description: undefined,
  step3Title: undefined,
  step4Title: undefined,
  step1Title: undefined,
  step4Description: undefined,
}

FeatureSteps.propTypes = {
  step2Title: PropTypes.element,
  step3Description: PropTypes.element,
  step2Description: PropTypes.element,
  step1Description: PropTypes.element,
  step3Title: PropTypes.element,
  step4Title: PropTypes.element,
  step1Title: PropTypes.element,
  step4Description: PropTypes.element,
}

export default FeatureSteps

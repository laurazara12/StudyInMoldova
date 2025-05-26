import React, { Fragment } from 'react'

import PropTypes from 'prop-types'

import './feature-steps.css'

const FeatureSteps = (props) => {
  return (
    <div className="feature-steps-container1 thq-section-padding">
      <div className="feature-steps-max-width thq-section-max-width">
        <div className="feature-steps-container2">
          <div className="feature-steps-section-header">
            <h2 className="thq-heading-2">
              Steps to Study in Moldova
            </h2>
            <p className="feature-steps-text11 thq-body-large">
              Follow these simple steps to begin your academic journey in Moldova. 
              Our platform guides you through each stage, from creating your account 
              to applying to your desired program.
            </p>
            <div className="feature-steps-actions">
              <button className="thq-button-filled thq-button-animated feature-steps-button">
                <span className="thq-body-small">View Programs</span>
              </button>
            </div>
          </div>
          <div className="feature-steps-container3">
            <div className="feature-steps-container4 thq-card">
              <h2 className="thq-heading-2">
                {props.step1Title ?? (
                  <Fragment>
                    <span className="feature-steps-text">Create Account</span>
                  </Fragment>
                )}
              </h2>
              <span className="feature-steps-text thq-body-small">
                {props.step1Description ?? (
                  <Fragment>
                    <span className="feature-steps-text">
                      Start by creating your personal account. Quick and easy registration process.
                    </span>
                  </Fragment>
                )}
              </span>
            </div>
            <div className="feature-steps-container5 thq-card">
              <h2 className="thq-heading-2">
                {props.step2Title ?? (
                  <Fragment>
                    <span className="feature-steps-text">Browse & Save Programs</span>
                  </Fragment>
                )}
              </h2>
              <span className="feature-steps-text thq-body-small">
                {props.step2Description ?? (
                  <Fragment>
                    <span className="feature-steps-text">
                      Explore programs on our platform and save your favorites in the Programs section.
                    </span>
                  </Fragment>
                )}
              </span>
            </div>
            <div className="feature-steps-container6 thq-card">
              <h2 className="thq-heading-2">
                {props.step3Title ?? (
                  <Fragment>
                    <span className="feature-steps-text">Research Universities</span>
                  </Fragment>
                )}
              </h2>
              <span className="feature-steps-text thq-body-small">
                {props.step3Description ?? (
                  <Fragment>
                    <span className="feature-steps-text">
                      Read detailed information about universities and programs to make an informed decision.
                    </span>
                  </Fragment>
                )}
              </span>
            </div>
            <div className="feature-steps-container7 thq-card">
              <h2 className="thq-heading-2">
                {props.step4Title ?? (
                  <Fragment>
                    <span className="feature-steps-text">Upload Documents</span>
                  </Fragment>
                )}
              </h2>
              <span className="feature-steps-text thq-body-small">
                {props.step4Description ?? (
                  <Fragment>
                    <span className="feature-steps-text">
                      Upload all required documents in your personal profile page.
                    </span>
                  </Fragment>
                )}
              </span>
            </div>
            <div className="feature-steps-container8 thq-card">
              <h2 className="thq-heading-2">
                {props.step5Title ?? (
                  <Fragment>
                    <span className="feature-steps-text">Submit Application</span>
                  </Fragment>
                )}
              </h2>
              <span className="feature-steps-text thq-body-small">
                {props.step5Description ?? (
                  <Fragment>
                    <span className="feature-steps-text">
                      Create and submit applications for your saved programs when you're ready.
                    </span>
                  </Fragment>
                )}
              </span>
            </div>
            <div className="feature-steps-container9 thq-card">
              <h2 className="thq-heading-2">
                {props.step6Title ?? (
                  <Fragment>
                    <span className="feature-steps-text">Track Progress</span>
                  </Fragment>
                )}
              </h2>
              <span className="feature-steps-text thq-body-small">
                {props.step6Description ?? (
                  <Fragment>
                    <span className="feature-steps-text">
                      Wait for feedback and track your application status in real-time.
                    </span>
                  </Fragment>
                )}
              </span>
            </div>
            <div className="feature-steps-container10 thq-card">
              <h2 className="thq-heading-2">
                {props.step7Title ?? (
                  <Fragment>
                    <span className="feature-steps-text">Get Support</span>
                  </Fragment>
                )}
              </h2>
              <span className="feature-steps-text thq-body-small">
                {props.step7Description ?? (
                  <Fragment>
                    <span className="feature-steps-text">
                      Contact us anytime for questions or support throughout your journey.
                    </span>
                  </Fragment>
                )}
              </span>
            </div>
            <div className="feature-steps-container11 thq-card">
              <h2 className="thq-heading-2">
                {props.step8Title ?? (
                  <Fragment>
                    <span className="feature-steps-text">Continue Exploring</span>
                  </Fragment>
                )}
              </h2>
              <span className="feature-steps-text thq-body-small">
                {props.step8Description ?? (
                  <Fragment>
                    <span className="feature-steps-text">
                      Keep exploring our platform to discover more opportunities and resources for your academic journey.
                    </span>
                  </Fragment>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

FeatureSteps.defaultProps = {
  step1Title: undefined,
  step1Description: undefined,
  step2Title: undefined,
  step2Description: undefined,
  step3Title: undefined,
  step3Description: undefined,
  step4Title: undefined,
  step4Description: undefined,
  step5Title: undefined,
  step5Description: undefined,
  step6Title: undefined,
  step6Description: undefined,
  step7Title: undefined,
  step7Description: undefined,
  step8Title: undefined,
  step8Description: undefined,
}

FeatureSteps.propTypes = {
  step1Title: PropTypes.element,
  step1Description: PropTypes.element,
  step2Title: PropTypes.element,
  step2Description: PropTypes.element,
  step3Title: PropTypes.element,
  step3Description: PropTypes.element,
  step4Title: PropTypes.element,
  step4Description: PropTypes.element,
  step5Title: PropTypes.element,
  step5Description: PropTypes.element,
  step6Title: PropTypes.element,
  step6Description: PropTypes.element,
  step7Title: PropTypes.element,
  step7Description: PropTypes.element,
  step8Title: PropTypes.element,
  step8Description: PropTypes.element,
}

export default FeatureSteps

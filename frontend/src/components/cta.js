import React, { Fragment } from 'react'

import PropTypes from 'prop-types'

import './cta.css'

const CTA = (props) => {
  return (
    <div className="thq-section-padding">
      <div className="thq-section-max-width">
        <div className="cta-accent2-bg">
          <div className="cta-accent1-bg">
            <div className="cta-container2">
              <div className="cta-content">
                <span className="thq-heading-2">
                  {props.heading1 ?? (
                    <Fragment>
                      <span className="cta-text4">
                        Start Your Journey to Studying in Moldova Today!
                      </span>
                    </Fragment>
                  )}
                </span>
                <p className="thq-body-large">
                  {props.content1 ?? (
                    <Fragment>
                      <span className="cta-text5">
                        Explore the opportunities for high-quality education in
                        Moldova and take the first step towards a successful
                        academic career.
                      </span>
                    </Fragment>
                  )}
                </p>
              </div>
              <div className="cta-actions">
                <button type="button" className="thq-button-filled cta-button">
                  <span>
                    {props.action1 ?? (
                      <Fragment>
                        <span className="cta-text6">Apply Now</span>
                      </Fragment>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

CTA.defaultProps = {
  heading1: undefined,
  content1: undefined,
  action1: undefined,
}

CTA.propTypes = {
  heading1: PropTypes.element,
  content1: PropTypes.element,
  action1: PropTypes.element,
}

export default CTA

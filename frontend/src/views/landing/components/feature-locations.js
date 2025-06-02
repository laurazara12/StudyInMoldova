import React, { Fragment } from 'react'

import PropTypes from 'prop-types'

import './feature-locations.css'

const FeatureLocations = (props) => {
  return (
    <div className="feature-locations-container1 thq-section-padding">
      <div className="feature-locations-max-width thq-section-max-width">
        <div className="feature-locations-content1 thq-flex-row">
          <div className="feature-locations-content2">
            <h2 className="thq-heading-2">
              {props.heading1 ?? (
                <Fragment>
                  <span className="feature-locations-text22">
                    In which cities can you study ?
                  </span>
                </Fragment>
              )}
            </h2>
            <p className="thq-body-large">
              {props.content1 ?? (
                <Fragment>
                  <span className="feature-locations-text20">
                    Moldova is not a big country, and while there are
                    universities in other cities, most opportunities for higher
                    education can be found in the capital city, Chisinau.
                  </span>
                </Fragment>
              )}
            </p>
          </div>
        </div>
        <div className="feature-locations-content3 thq-flex-row">
          <div className="feature-locations-container2">
            <img
              alt={props.location1ImageAlt}
              src="https://res.cloudinary.com/dlbu43xwt/image/upload/v1747599121/pexels-anaghan-km-177642992-11351622-1400w_cwfhbp.jpg"
              className="feature-locations-image1 thq-img-ratio-16-9"
            />
            <h3 className="feature-locations-text12 thq-heading-3">
              {props.location1 ?? (
                <Fragment>
                  <span className="feature-locations-text21">Chisinau</span>
                </Fragment>
              )}
            </h3>
            <p className="thq-body-large">
              {props.location1Description ?? (
                <Fragment>
                  <span className="feature-locations-text23">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse varius enim in ero.
                  </span>
                </Fragment>
              )}
            </p>
            <div className="feature-locations-container3">
              <a
                href="https://g.co/kgs/2ho8iqN"
                target="_blank"
                rel="noreferrer noopener"
                className="btn2"
              >
                <span>Get directions</span>
              </a>
            </div>
          </div>
          <div className="feature-locations-container4">
            <img
              alt={props.location2ImageAlt}
              src="https://res.cloudinary.com/dlbu43xwt/image/upload/v1747599120/balti_town_hall-1400w_ywraqr.jpg"
              className="feature-locations-image2 thq-img-ratio-16-9"
            />
            <h3 className="feature-locations-text14 thq-heading-3">
              {props.location2 ?? (
                <Fragment>
                  <span className="feature-locations-text18">Other cities</span>
                </Fragment>
              )}
            </h3>
            <p className="thq-body-large">
              {props.location2Description ?? (
                <Fragment>
                  <span className="feature-locations-text19">
                    If Chisinau is not your cup of tea, for sure there are a
                    couple other options that you might find interesting.
                  </span>
                </Fragment>
              )}
            </p>
            <div className="feature-locations-container5">
              <a
                href="https://g.co/kgs/RkN4Zp2"
                target="_blank"
                rel="noreferrer noopener"
                className="btn2"
              >
                <span>Get directions</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

FeatureLocations.defaultProps = {
  location2: undefined,
  location2Description: undefined,
  content1: undefined,
  location2ImageAlt: 'image2Alt',
  location1: undefined,
  location1ImageAlt: 'image1Alt',
  heading1: undefined,
  location1Description: undefined,
}

FeatureLocations.propTypes = {
  location2: PropTypes.element,
  location2Description: PropTypes.element,
  content1: PropTypes.element,
  location2ImageAlt: PropTypes.string,
  location1: PropTypes.element,
  location1ImageAlt: PropTypes.string,
  heading1: PropTypes.element,
  location1Description: PropTypes.element,
}

export default FeatureLocations

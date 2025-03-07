import React, { Fragment } from 'react'

import PropTypes from 'prop-types'

import './usm-hero-university-individual-page.css'

const USMHeroUniversityIndividualPage = (props) => {
  return (
    <div className="usm-hero-university-individual-page-header19 thq-section-padding">
      <div className="usm-hero-university-individual-page-university-container thq-flex-row thq-section-max-width">
        <div className="usm-hero-university-individual-page-university-hero-content1">
          <div className="usm-hero-university-individual-page-university-hero-content2">
            <h1 className="usm-hero-university-individual-page-university-hero-heading thq-heading-1">
              {props.heading1 ?? (
                <Fragment>
                  <span className="usm-hero-university-individual-page-text1">
                    Catchy and engaging hero headline here
                  </span>
                </Fragment>
              )}
            </h1>
            <p className="usm-hero-university-individual-page-text-university-hero-text thq-body-large">
              {props.content1 ?? (
                <Fragment>
                  <span className="usm-hero-university-individual-page-text2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse varius enim in eros elementum tristique. Duis
                    cursus, mi quis viverra ornare, eros dolor interdum nulla,
                    ut commodo diam libero vitae erat.
                  </span>
                </Fragment>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

USMHeroUniversityIndividualPage.defaultProps = {
  heading1: undefined,
  content1: undefined,
}

USMHeroUniversityIndividualPage.propTypes = {
  heading1: PropTypes.element,
  content1: PropTypes.element,
}

export default USMHeroUniversityIndividualPage

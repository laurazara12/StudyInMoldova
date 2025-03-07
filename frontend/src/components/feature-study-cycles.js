import React, { Fragment } from 'react'

import PropTypes from 'prop-types'

import './feature-study-cycles.css'

const FeatureStudyCycles = (props) => {
  return (
    <div className="feature-study-cycles-layout300 thq-section-padding">
      <div className="feature-study-cycles-max-width thq-section-max-width thq-flex-column">
        <div className="feature-study-cycles-section-title thq-flex-column">
          <h2 className="thq-heading-2 feature-study-cycles-text10">
            {props.sectionTitle ?? (
              <Fragment>
                <span className="feature-study-cycles-text16">
                  Discover each Study Cycle
                </span>
              </Fragment>
            )}
          </h2>
          <p className="feature-study-cycles-text11 thq-body-large">
            {props.sectionDescription ?? (
              <Fragment>
                <span className="feature-study-cycles-text12">
                  The Republic of Moldova has been part of the Bologna Process
                  since 2005, when it joined the European Higher Education Area
                  (EHEA). Since then, the country has reformed its higher
                  education system to align with the three-cycle structure
                </span>
              </Fragment>
            )}
          </p>
        </div>
        <div className="feature-study-cycles-content thq-grid-auto-300">
          <div className="feature-study-cycles-study-cicle1 thq-flex-column">
            <div className="feature-study-cycles-study-cycle1-title">
              <h3 className="feature-study-cycles-feature1-title1 thq-heading-3">
                {props.feature1Title ?? (
                  <Fragment>
                    <span className="feature-study-cycles-text27">
                      Bachelor&apos;s degree
                      <span
                        dangerouslySetInnerHTML={{
                          __html: ' ',
                        }}
                      />
                    </span>
                  </Fragment>
                )}
              </h3>
              <h3 className="feature-study-cycles-feature1-title2 thq-heading-3">
                {props.feature1Title1 ?? (
                  <Fragment>
                    <span className="feature-study-cycles-text17">
                      <span className="feature-study-cycles-text18">
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
                )}
              </h3>
            </div>
            <span className="thq-body-small">
              {props.feature1Description ?? (
                <Fragment>
                  <span className="feature-study-cycles-text24">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse varius enim in eros elementum tristique. Duis
                    cursus, mi quis viverra ornare, eros dolor interdum nulla.
                  </span>
                </Fragment>
              )}
            </span>
          </div>
          <div className="feature-study-cycles-study-cycle2 thq-flex-column">
            <div className="feature-study-cycles-study-cycle2-title">
              <h3 className="feature-study-cycles-feature1-title3 thq-heading-3">
                {props.feature1Title2 ?? (
                  <Fragment>
                    <span className="feature-study-cycles-text26">
                      Master&apos;s degree
                      <span
                        dangerouslySetInnerHTML={{
                          __html: ' ',
                        }}
                      />
                    </span>
                  </Fragment>
                )}
              </h3>
              <h3 className="feature-study-cycles-feature1-title4 thq-heading-3">
                {props.feature1Title11 ?? (
                  <Fragment>
                    <span className="feature-study-cycles-text13">
                      <span className="feature-study-cycles-text14">
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
                )}
              </h3>
            </div>
            <span className="thq-body-small">
              {props.feature2Description ?? (
                <Fragment>
                  <span className="feature-study-cycles-text20">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse varius enim in eros elementum tristique. Duis
                    cursus, mi quis viverra ornare, eros dolor interdum nulla.
                  </span>
                </Fragment>
              )}
            </span>
          </div>
          <div className="feature-study-cycles-study-cycle3 thq-flex-column">
            <div className="feature-study-cycles-study-cycle3-title">
              <h3 className="feature-study-cycles-feature1-title5 thq-heading-3">
                {props.feature1Title3 ?? (
                  <Fragment>
                    <span className="feature-study-cycles-text28">
                      Doctoral studies/PhD
                      <span
                        dangerouslySetInnerHTML={{
                          __html: ' ',
                        }}
                      />
                    </span>
                  </Fragment>
                )}
              </h3>
              <h3 className="feature-study-cycles-feature1-title6 thq-heading-3">
                {props.feature1Title12 ?? (
                  <Fragment>
                    <span className="feature-study-cycles-text21">
                      <span className="feature-study-cycles-text22">
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
                )}
              </h3>
            </div>
            <span className="thq-body-small">
              {props.feature3Description ?? (
                <Fragment>
                  <span className="feature-study-cycles-text25">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse varius enim in eros elementum tristique. Duis
                    cursus, mi quis viverra ornare, eros dolor interdum nulla.
                  </span>
                </Fragment>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

FeatureStudyCycles.defaultProps = {
  sectionDescription: undefined,
  feature1Title11: undefined,
  sectionTitle: undefined,
  feature1Title1: undefined,
  feature2Description: undefined,
  feature1Title12: undefined,
  feature1Description: undefined,
  feature3Description: undefined,
  feature1Title2: undefined,
  feature1Title: undefined,
  feature1Title3: undefined,
}

FeatureStudyCycles.propTypes = {
  sectionDescription: PropTypes.element,
  feature1Title11: PropTypes.element,
  sectionTitle: PropTypes.element,
  feature1Title1: PropTypes.element,
  feature2Description: PropTypes.element,
  feature1Title12: PropTypes.element,
  feature1Description: PropTypes.element,
  feature3Description: PropTypes.element,
  feature1Title2: PropTypes.element,
  feature1Title: PropTypes.element,
  feature1Title3: PropTypes.element,
}

export default FeatureStudyCycles

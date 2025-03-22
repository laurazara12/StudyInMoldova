import React, { useState, Fragment } from 'react'

import PropTypes from 'prop-types'

import './features-why-study-in-moldova1.css'

const FeaturesWhyStudyInMoldova1 = (props) => {
  const [activeTab, setActiveTab] = useState(0)
  return (
    <div className="thq-section-padding">
      <div className="features-why-study-in-moldova1-container2 thq-section-max-width">
        <div className="features-why-study-in-moldova1-image-container">
          {activeTab === 0 && (
            <img
              alt={props.feature1ImgAlt}
              src="https://raw.githubusercontent.com/laurazara12/Study-in-Moldova/refs/heads/main/images/WhatsApp%20Image%202024-11-15%20at%2014.32.59%20(8).jpeg"
              className="features-why-study-in-moldova1-image1 thq-img-ratio-16-9"
            />
          )}
          {activeTab === 1 && (
            <img
              alt={props.feature2ImgAlt}
              src="/images/pexels-anaghan-km-177642992-11351622-1400w.jpg"
              className="features-why-study-in-moldova1-image2 thq-img-ratio-16-9"
            />
          )}
          {activeTab === 2 && (
            <img
              alt={props.feature3ImgAlt}
              src="/images/moldavskaya-ekonomicheskaya-akademiya-asem_thumb-1400w.jpg"
              className="features-why-study-in-moldova1-image3 thq-img-ratio-16-9"
            />
          )}
        </div>
        <div className="features-why-study-in-moldova1-tabs-menu">
          <div
            onClick={() => setActiveTab(0)}
            className={`features-why-study-in-moldova1-tab-horizontal1 ${activeTab === 0 ? 'active' : ''}`}
          >
            <div className="features-why-study-in-moldova1-divider-container1">
              {activeTab === 0 && (
                <div className="features-why-study-in-moldova1-container3"></div>
              )}
            </div>
            <div className="features-why-study-in-moldova1-content1">
              <h2 className="thq-heading-2">
                {props.feature1Title ?? (
                  <Fragment>
                    <span className="features-why-study-in-moldova1-text1">
                      Why Study in Moldova?
                    </span>
                  </Fragment>
                )}
              </h2>
              <p className="thq-body-small">
                {props.feature1Description ?? (
                  <Fragment>
                    <span className="features-why-study-in-moldova1-text6">
                      Moldova boasts one of the highest literacy rates in the
                      world, providing a conducive environment for quality
                      education.
                    </span>
                  </Fragment>
                )}
              </p>
            </div>
          </div>
          <div
            onClick={() => setActiveTab(1)}
            className={`features-why-study-in-moldova1-tab-horizontal2 ${activeTab === 1 ? 'active' : ''}`}
          >
            <div className="features-why-study-in-moldova1-divider-container2">
              {activeTab === 1 && (
                <div className="features-why-study-in-moldova1-container4"></div>
              )}
            </div>
            <div className="features-why-study-in-moldova1-content2">
              <h2 className="thq-heading-2">
                {props.feature2Title ?? (
                  <Fragment>
                    <span className="features-why-study-in-moldova1-text4">
                      Affordable Education
                    </span>
                  </Fragment>
                )}
              </h2>
              <p className="features-why-study-in-moldova1-feature2-description1 thq-body-small">
                {props.feature2Description ?? (
                  <Fragment>
                    <span className="features-why-study-in-moldova1-text2">
                      Studying in Moldova is cost-effective compared to many
                      other European countries, making it an attractive option
                      for international students.
                    </span>
                  </Fragment>
                )}
              </p>
            </div>
          </div>
          <div
            onClick={() => setActiveTab(2)}
            className={`features-why-study-in-moldova1-tab-horizontal3 ${activeTab === 2 ? 'active' : ''}`}
          >
            <div className="features-why-study-in-moldova1-divider-container3">
              {activeTab === 2 && (
                <div className="features-why-study-in-moldova1-container5"></div>
              )}
            </div>
            <div className="features-why-study-in-moldova1-content3">
              <h2 className="features-why-study-in-moldova1-feature3-title thq-heading-2">
                {props.feature3Title ?? (
                  <Fragment>
                    <span className="features-why-study-in-moldova1-text5">
                      Education on the Rise
                    </span>
                  </Fragment>
                )}
              </h2>
              <p className="features-why-study-in-moldova1-feature2-description2 thq-body-small">
                {props.feature2Description1 ?? (
                  <Fragment>
                    <span className="features-why-study-in-moldova1-text3">
                      Moldova's students show steady improvement in global
                      assessments, reflecting quality-driven reforms.
                    </span>
                  </Fragment>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

FeaturesWhyStudyInMoldova1.defaultProps = {
  feature1Title: undefined,
  feature2ImgAlt: 'Affordable Education Image',
  feature3ImgAlt: 'image',
  feature2Description: undefined,
  feature2Description1: undefined,
  feature2Title: undefined,
  feature1ImgAlt: 'High Literacy Rates Image',
  feature3Title: undefined,
  feature1Description: undefined,
}

FeaturesWhyStudyInMoldova1.propTypes = {
  feature1Title: PropTypes.element,
  feature2ImgAlt: PropTypes.string,
  feature3ImgAlt: PropTypes.string,
  feature2Description: PropTypes.element,
  feature2Description1: PropTypes.element,
  feature2Title: PropTypes.element,
  feature1ImgAlt: PropTypes.string,
  feature3Title: PropTypes.element,
  feature1Description: PropTypes.element,
}

export default FeaturesWhyStudyInMoldova1

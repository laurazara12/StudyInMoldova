import React, { useState, Fragment } from 'react'

import PropTypes from 'prop-types'

import { getCloudinaryImageUrl } from '../../../config/cloudinary'
import './features-why-study-in-moldova2.css'

const FeaturesWhyStudyInMoldova2 = (props) => {
  const [activeTab, setActiveTab] = useState(0)
  return (
    <div className="thq-section-padding">
      <div className="features-why-study-in-moldova2-container2 thq-section-max-width">
        <div className="features-why-study-in-moldova2-tabs-menu">
          <div
            onClick={() => setActiveTab(0)}
            className={`features-why-study-in-moldova2-tab-horizontal1 ${activeTab === 0 ? 'active' : ''}`}
          >
            <div className="features-why-study-in-moldova2-divider-container1">
              <div className="features-why-study-in-moldova2-container3"></div>
            </div>
            <div className="features-why-study-in-moldova2-content1">
              <h2 className="thq-heading-2">
                {props.feature1Title ?? (
                  <Fragment>
                    <span className="features-why-study-in-moldova2-text5">
                      High Literacy Rates
                    </span>
                  </Fragment>
                )}
              </h2>
              <span className="thq-body-small">
                {props.feature1Description ?? (
                  <Fragment>
                    <span className="features-why-study-in-moldova2-text2">
                      With a 99.6% literacy rate, Moldova provides a strong
                      academic foundation for international students.
                    </span>
                  </Fragment>
                )}
              </span>
            </div>
          </div>
          <div
            onClick={() => setActiveTab(1)}
            className={`features-why-study-in-moldova2-tab-horizontal2 ${activeTab === 1 ? 'active' : ''}`}
          >
            <div className="features-why-study-in-moldova2-divider-container2">
              <div className="features-why-study-in-moldova2-container4"></div>
            </div>
            <div className="features-why-study-in-moldova2-content2">
              <h2 className="thq-heading-2">
                {props.feature2Title ?? (
                  <Fragment>
                    <span className="features-why-study-in-moldova2-text3">
                      Affordable Education
                    </span>
                  </Fragment>
                )}
              </h2>
              <span className="thq-body-small">
                {props.feature2Description ?? (
                  <Fragment>
                    <span className="features-why-study-in-moldova2-text4">
                      Studying in Moldova is cost-effective compared to many
                      other European countries, making it an attractive option
                      for international students.
                    </span>
                  </Fragment>
                )}
              </span>
            </div>
          </div>
          <div
            onClick={() => setActiveTab(2)}
            className={`features-why-study-in-moldova2-tab-horizontal3 ${activeTab === 2 ? 'active' : ''}`}
          >
            <div className="features-why-study-in-moldova2-divider-container3">
              <div className="features-why-study-in-moldova2-container5"></div>
            </div>
            <div className="features-why-study-in-moldova2-content3">
              <h2 className="thq-heading-2">
                {props.feature3Title ?? (
                  <Fragment>
                    <span className="features-why-study-in-moldova2-text1">
                      Diverse Programs and Universities
                    </span>
                  </Fragment>
                )}
              </h2>
              <span className="thq-body-small">
                {props.feature3Description ?? (
                  <Fragment>
                    <span className="features-why-study-in-moldova2-text6">
                      As Moldova progresses toward EU membership, its education
                      system is aligning with European standards, offering
                      students internationally recognized degrees and new
                      opportunities in an evolving academic landscape!
                    </span>
                  </Fragment>
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="features-why-study-in-moldova2-image-container">
          {activeTab === 0 && (
            <img
              alt={props.feature1ImgAlt}
              src={getCloudinaryImageUrl('dorin-seremet-_atwwma7pyw-unsplash-1400w_w6dekv', { 
                width: 800, 
                height: 450, 
                crop: 'fill', 
                quality: 'auto:good',
                lazy: false
              })}
              className="features-why-study-in-moldova2-image1 thq-img-ratio-16-9"
            />
          )}
          {activeTab === 1 && (
            <img
              alt={props.feature2ImgAlt}
              src={getCloudinaryImageUrl('young-people-dancing-folk-low-angle_p9pe0a', { 
                width: 800, 
                height: 450, 
                crop: 'fill', 
                quality: 'auto:good',
                lazy: false
              })}
              className="features-why-study-in-moldova2-image2 thq-img-ratio-16-9"
            />
          )}
          {activeTab === 2 && (
            <img
              alt={props.feature3ImgAlt}
              src={getCloudinaryImageUrl('WhatsApp_Image_2024-11-15_at_14.33.02_3_rthlii', { 
                width: 800, 
                height: 450, 
                crop: 'fill', 
                quality: 'auto:good',
                lazy: false
              })}
              className="features-why-study-in-moldova2-image3 thq-img-ratio-16-9"
            />
          )}
        </div>
      </div>
    </div>
  )
}

FeaturesWhyStudyInMoldova2.defaultProps = {
  feature1ImgAlt: 'Feature 4 Image',
  feature2ImgAlt: 'Feature 5 Image',
  feature3ImgAlt: 'Feature 6 Image',
  feature1Description: undefined,
  feature1Title: undefined,
  feature2Title: undefined,
  feature2Description: undefined,
  feature3Title: undefined,
  feature3Description: undefined,
}

FeaturesWhyStudyInMoldova2.propTypes = {
  feature1ImgAlt: PropTypes.string,
  feature2ImgAlt: PropTypes.string,
  feature3ImgAlt: PropTypes.string,
  feature1Description: PropTypes.element,
  feature1Title: PropTypes.element,
  feature2Title: PropTypes.element,
  feature2Description: PropTypes.element,
  feature3Title: PropTypes.element,
  feature3Description: PropTypes.element,
}

export default FeaturesWhyStudyInMoldova2

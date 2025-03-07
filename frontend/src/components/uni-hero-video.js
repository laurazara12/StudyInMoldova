import React, { Fragment } from 'react'

import PropTypes from 'prop-types'

import './uni-hero-video.css'

const UniHeroVideo = (props) => {
  return (
    <div className="uni-hero-video-container thq-section-padding">
      <div className="uni-hero-video-max-width thq-section-max-width">
        <div className="uni-hero-video-column">
          <div className="uni-hero-video-content">
            <h1 className="uni-hero-video-text1 thq-heading-1">
              {props.heading1 ?? (
                <Fragment>
                  <span className="uni-hero-video-text3">
                    Catchy and engaging hero headline here
                  </span>
                </Fragment>
              )}
            </h1>
            <p className="uni-hero-video-text2 thq-body-large">
              {props.content1 ?? (
                <Fragment>
                  <span className="uni-hero-video-text4">
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
        <video
          src="..."
          loop
          poster="..."
          preload="auto"
          autoPlay="true"
          controls
          playsInline
          className="uni-hero-video-video thq-img-ratio-4-3"
        ></video>
      </div>
    </div>
  )
}

UniHeroVideo.defaultProps = {
  heading1: undefined,
  content1: undefined,
}

UniHeroVideo.propTypes = {
  heading1: PropTypes.element,
  content1: PropTypes.element,
}

export default UniHeroVideo

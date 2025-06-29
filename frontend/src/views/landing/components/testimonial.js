import React, { Fragment } from 'react'

import PropTypes from 'prop-types'

import './testimonial.css'

const Testimonial = (props) => {
  return (
    <div className="thq-section-padding">
      <div className="testimonial-background">
      <div className="testimonial-max-width thq-section-max-width">
        <div className="testimonial-container10">
          <h2 className="thq-heading-2">
            {props.heading1}
          </h2>
        </div>
        <div className="thq-grid-2">
          <div className="thq-animated-card-bg-2">
            <div className="thq-animated-card-bg-1">
              <div data-animated="true" className="thq-card testimonial-card1">
                <div className="testimonial-container12">
                  <img
                    alt={props.author1Alt}
                    src={props.author1Src}
                    className="testimonial-image1"
                  />
                  <div className="testimonial-container13">
                    <strong className="thq-body-large">
                      {props.author1Name}
                    </strong>
                    <span className="thq-body-small">
                      {props.author1Position}
                    </span>
                  </div>
                </div>
                <span className="testimonial-text14 thq-body-small">
                  {props.review1}
                </span>
              </div>
            </div>
          </div>
          <div className="thq-animated-card-bg-2">
            <div className="thq-animated-card-bg-1">
              <div data-animated="true" className="thq-card testimonial-card2">
                <div className="testimonial-container14">
                  <img
                    alt={props.author2Alt}
                    src={props.author2Src}
                    className="testimonial-image2"
                  />
                  <div className="testimonial-container15">
                    <strong className="thq-body-large">
                      {props.author2Name}
                    </strong>
                    <span className="thq-body-small">
                      {props.author2Position}
                    </span>
                  </div>
                </div>
                <span className="testimonial-text17 thq-body-small">
                  {props.review2}
                </span>
              </div>
            </div>
          </div>
          <div className="thq-animated-card-bg-2">
            <div className="thq-animated-card-bg-1">
              <div data-animated="true" className="thq-card testimonial-card3">
                <div className="testimonial-container16">
                  <img
                    alt={props.author3Alt}
                    src={props.author3Src}
                    className="testimonial-image3"
                  />
                  <div className="testimonial-container17">
                    <strong className="thq-body-large">
                      {props.author3Name}
                    </strong>
                    <span className="thq-body-small">
                      {props.author3Position}
                    </span>
                  </div>
                </div>
                <span className="testimonial-text20 thq-body-small">
                  {props.review3}
                </span>
              </div>
            </div>
          </div>
          <div className="thq-animated-card-bg-2">
            <div className="thq-animated-card-bg-1">
              <div data-animated="true" className="thq-card testimonial-card4">
                <div className="testimonial-container18">
                  <img
                    alt={props.author4Alt}
                    src={props.author4Src}
                    className="testimonial-image4"
                  />
                  <div className="testimonial-container19">
                    <strong className="thq-body-large">
                      {props.author4Name}
                    </strong>
                    <span className="thq-body-small">
                      {props.author4Position}
                    </span>
                  </div>
                </div>
                <span className="testimonial-text23 thq-body-small">
                  {props.review4}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

Testimonial.defaultProps = {
  review1: undefined,
  review4: undefined,
  author4Alt: 'Image of David Lee',
  author2Alt: 'Image of Ahmed Khan',
  author3Alt: 'Image of Elena Petrova',
  author3Position: undefined,
  content1: undefined,
  author4Src:
    'https://images.unsplash.com/photo-1567499611771-9e8e96a98e98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTMyMXwwfDF8cmFuZG9tfHx8fHx8fHx8MTczNDEwOTYzM3w&ixlib=rb-4.0.3&q=80&w=1080',
  author1Src:
    'https://images.unsplash.com/photo-1525219884637-43180fbb6455?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTMyMXwwfDF8cmFuZG9tfHx8fHx8fHx8MTczNDEwOTYzM3w&ixlib=rb-4.0.3&q=80&w=1080',
  author2Name: undefined,
  author1Alt: '',
  author3Src:
    'https://images.unsplash.com/photo-1499229694635-fc626e0d9c01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTMyMXwwfDF8cmFuZG9tfHx8fHx8fHx8MTczNDEwOTYzNHw&ixlib=rb-4.0.3&q=80&w=1080',
  author2Src:
    'https://images.unsplash.com/photo-1474533410427-a23da4fd49d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTMyMXwwfDF8cmFuZG9tfHx8fHx8fHx8MTczNDEwOTYzM3w&ixlib=rb-4.0.3&q=80&w=1080',
  author3Name: undefined,
  author1Name: undefined,
  author4Name: undefined,
  review2: undefined,
  author2Position: undefined,
  review3: undefined,
  author1Position: undefined,
  heading1: undefined,
  author4Position: undefined,
}

Testimonial.propTypes = {
  review1: PropTypes.element,
  review4: PropTypes.element,
  author4Alt: PropTypes.string,
  author2Alt: PropTypes.string,
  author3Alt: PropTypes.string,
  author3Position: PropTypes.element,
  content1: PropTypes.element,
  author4Src: PropTypes.string,
  author1Src: PropTypes.string,
  author2Name: PropTypes.element,
  author1Alt: PropTypes.string,
  author3Src: PropTypes.string,
  author2Src: PropTypes.string,
  author3Name: PropTypes.element,
  author1Name: PropTypes.element,
  author4Name: PropTypes.element,
  review2: PropTypes.element,
  author2Position: PropTypes.element,
  review3: PropTypes.element,
  author1Position: PropTypes.element,
  heading1: PropTypes.element,
  author4Position: PropTypes.element,
}

export default Testimonial

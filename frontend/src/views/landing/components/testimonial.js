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
            {props.heading1 ?? (
              <Fragment>
                <span className="testimonial-text36">Student Testimonials</span>
              </Fragment>
            )}
          </h2>
          <span className="testimonial-text11 thq-body-small">
            {props.content1 ?? (
              <Fragment>
                <span className="testimonial-text27">
                  Studying in Moldova has been a life-changing experience for
                  many students. The quality of education and the welcoming
                  environment at the university made them feel at home. They
                  say...
                </span>
              </Fragment>
            )}
          </span>
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
                      {props.author1Name ?? (
                        <Fragment>
                          <span className="testimonial-text30">
                            Jessica Smith
                          </span>
                        </Fragment>
                      )}
                    </strong>
                    <span className="thq-body-small">
                      {props.author1Position ?? (
                        <Fragment>
                          <span className="testimonial-text35">
                            Bachelor&apos;s Student
                          </span>
                        </Fragment>
                      )}
                    </span>
                  </div>
                </div>
                <span className="testimonial-text14 thq-body-small">
                  {props.review1 ?? (
                    <Fragment>
                      <span className="testimonial-text24">
                        I highly recommend considering Moldova for your studies!
                      </span>
                    </Fragment>
                  )}
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
                      {props.author2Name ?? (
                        <Fragment>
                          <span className="testimonial-text28">Ahmed Khan</span>
                        </Fragment>
                      )}
                    </strong>
                    <span className="thq-body-small">
                      {props.author2Position ?? (
                        <Fragment>
                          <span className="testimonial-text33">
                            Master&apos;s Student
                          </span>
                        </Fragment>
                      )}
                    </span>
                  </div>
                </div>
                <span className="testimonial-text17 thq-body-small">
                  {props.review2 ?? (
                    <Fragment>
                      <span className="testimonial-text32">
                        Moldova is a hidden gem for international students
                        seeking quality education without breaking the bank.
                      </span>
                    </Fragment>
                  )}
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
                      {props.author3Name ?? (
                        <Fragment>
                          <span className="testimonial-text29">
                            Elena Petrova
                          </span>
                        </Fragment>
                      )}
                    </strong>
                    <span className="thq-body-small">
                      {props.author3Position ?? (
                        <Fragment>
                          <span className="testimonial-text26">
                            Ph.D. Candidate
                          </span>
                        </Fragment>
                      )}
                    </span>
                  </div>
                </div>
                <span className="testimonial-text20 thq-body-small">
                  {props.review3 ?? (
                    <Fragment>
                      <span className="testimonial-text34">
                        Choosing Moldova for my Ph.D. studies was one of the
                        best decisions I&apos;ve made in my academic career.
                      </span>
                    </Fragment>
                  )}
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
                      {props.author4Name ?? (
                        <Fragment>
                          <span className="testimonial-text31">David Lee</span>
                        </Fragment>
                      )}
                    </strong>
                    <span className="thq-body-small">
                      {props.author4Position ?? (
                        <Fragment>
                          <span className="testimonial-text37">
                            Exchange Student
                          </span>
                        </Fragment>
                      )}
                    </span>
                  </div>
                </div>
                <span className="testimonial-text23 thq-body-small">
                  {props.review4 ?? (
                    <Fragment>
                      <span className="testimonial-text25">
                        My time in Moldova has broadened my horizons and left me
                        with unforgettable memories.
                      </span>
                    </Fragment>
                  )}
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
  author1Alt: 'Image of Jessica Smith',
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

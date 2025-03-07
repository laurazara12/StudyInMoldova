import React, { Fragment } from 'react'

import Script from 'dangerous-html/react'
import PropTypes from 'prop-types'

import './hero-landing-page.css'

const HeroLandingPage = (props) => {
  return (
    <div className="hero-landing-page-header78">
      <div className="hero-landing-page-column thq-section-padding thq-section-max-width">
        <div className="hero-landing-page-content1">
          <h1 className="hero-landing-page-text1 thq-heading-1">
            {props.heading1 ?? (
              <Fragment>
                <span className="hero-landing-page-text7">
                  Study in Moldova
                </span>
              </Fragment>
            )}
          </h1>
          <p className="hero-landing-page-text2 thq-body-large">
            {props.content1 ?? (
              <Fragment>
                <span className="hero-landing-page-text8">
                  Discover high-quality education in Moldova with affordable
                  tuition fees and a rich cultural experience. Explore various
                  programs and universities tailored to international
                  students&apos; needs.
                </span>
              </Fragment>
            )}
          </p>
        </div>
        <div className="hero-landing-page-actions">
          <button className="thq-button-filled hero-landing-page-button1">
            <span className="thq-body-small">
              {props.action1 ?? (
                <Fragment>
                  <span className="hero-landing-page-text6">
                    Explore Programs
                  </span>
                </Fragment>
              )}
            </span>
          </button>
          <button className="thq-button-outline hero-landing-page-button2">
            <span className="thq-body-small">
              {props.action2 ?? (
                <Fragment>
                  <span className="hero-landing-page-text5">Contact Us</span>
                </Fragment>
              )}
            </span>
          </button>
        </div>
      </div>
      <div className="hero-landing-page-content2">
        <div className="hero-landing-page-row-container1 thq-mask-image-horizontal thq-animated-group-container-horizontal">
          <div className="thq-animated-group-horizontal">
            <img
              alt={props.image1Alt}
              src="https://raw.githubusercontent.com/laurazara12/Study-in-Moldova/refs/heads/main/images/alex-kalinin-8bs-Kz8ACdM-unsplash.jpg"
              className="hero-landing-page-placeholder-image10 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt={props.image2Alt}
              src="https://raw.githubusercontent.com/laurazara12/Study-in-Moldova/refs/heads/main/images/calin-stan-0Jxgsidj3aA-unsplash.jpg"
              className="hero-landing-page-placeholder-image11 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt={props.image3Alt}
              src="https://raw.githubusercontent.com/laurazara12/Study-in-Moldova/refs/heads/main/images/dorin-seremet-Qhy0SX5vv8w-unsplash.jpg"
              className="hero-landing-page-placeholder-image12 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt={props.image4Alt}
              src="https://raw.githubusercontent.com/laurazara12/Study-in-Moldova/refs/heads/main/images/ivan-borinschi-RSkaD6YJ7t8-unsplash.jpg"
              className="hero-landing-page-placeholder-image13 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt={props.image5Alt}
              src={props.image5Src}
              className="hero-landing-page-placeholder-image14 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt={props.image6Alt}
              src={props.image6Src}
              className="hero-landing-page-placeholder-image15 thq-img-scale thq-img-ratio-1-1"
            />
          </div>
          <div className="thq-animated-group-horizontal">
            <img
              alt={props.image1Alt}
              src={props.image1Src}
              className="hero-landing-page-placeholder-image16 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt={props.image2Alt}
              src={props.image2Src}
              className="hero-landing-page-placeholder-image17 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt={props.image3Alt}
              src={props.image3Src}
              className="hero-landing-page-placeholder-image18 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt={props.image4Alt}
              src={props.image4Src}
              className="hero-landing-page-placeholder-image19 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt={props.image5Alt}
              src={props.image5Src}
              className="hero-landing-page-placeholder-image20 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt="Hero Image"
              src="https://images.unsplash.com/photo-1534312527009-56c7016453e6?ixid=M3w5MTMyMXwwfDF8c2VhcmNofDIxfHxhYnN0cmFjdHxlbnwwfHx8fDE3MTA4NzA5MzB8MA&amp;ixlib=rb-4.0.3&amp;w=1500"
              className="hero-landing-page-placeholder-image21 thq-img-scale thq-img-ratio-1-1"
            />
          </div>
        </div>
        <div className="hero-landing-page-row-container2 thq-mask-image-horizontal thq-animated-group-container-horizontal">
          <div className="thq-animated-group-horizontal-reverse">
            <img
              alt={props.image7Alt}
              src="https://raw.githubusercontent.com/laurazara12/Study-in-Moldova/refs/heads/main/images/sasha-pleshco-LI5MSjGm6sQ-unsplash.jpg"
              className="hero-landing-page-placeholder-image22 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt={props.image8Alt}
              src="https://raw.githubusercontent.com/laurazara12/Study-in-Moldova/refs/heads/main/images/pexels-radubradu-395822838-15511258.jpg"
              className="hero-landing-page-placeholder-image23 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt={props.image9Alt}
              src="https://raw.githubusercontent.com/laurazara12/Study-in-Moldova/refs/heads/main/images/pexels-roman-muntean-369190311-17067159.jpg"
              className="hero-landing-page-placeholder-image24 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt={props.image10Alt}
              src="https://raw.githubusercontent.com/laurazara12/Study-in-Moldova/refs/heads/main/images/vitalie-sitnic-Kn5QME2SDzo-unsplash.jpg"
              className="hero-landing-page-placeholder-image25 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt={props.image11Alt}
              src={props.image11Src}
              className="hero-landing-page-placeholder-image26 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt={props.image12Alt}
              src={props.image12Src}
              className="hero-landing-page-placeholder-image27 thq-img-scale thq-img-ratio-1-1"
            />
          </div>
          <div className="thq-animated-group-horizontal-reverse">
            <img
              alt={props.image7Alt}
              src={props.image7Src}
              className="hero-landing-page-placeholder-image28 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt={props.image8Alt}
              src={props.image8Src}
              className="hero-landing-page-placeholder-image29 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt={props.image9Alt}
              src={props.image9Src}
              className="hero-landing-page-placeholder-image30 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt={props.image10Alt}
              src={props.image10Src}
              className="hero-landing-page-placeholder-image31 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt={props.image11Alt}
              src={props.image11Src}
              className="hero-landing-page-placeholder-image32 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt="Hero Image"
              src="https://images.unsplash.com/photo-1568214379698-8aeb8c6c6ac8?ixid=M3w5MTMyMXwwfDF8c2VhcmNofDEyfHxncmFmaWN8ZW58MHx8fHwxNzE1Nzk0OTk5fDA&amp;ixlib=rb-4.0.3&amp;w=1500"
              className="hero-landing-page-placeholder-image33 thq-img-scale thq-img-ratio-1-1"
            />
          </div>
        </div>
      </div>
      <div>
        <div className="hero-landing-page-container2">
          <Script
            html={`<style>
  @keyframes scroll-x {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(calc(-100% - 16px));
    }
  }

  @keyframes scroll-y {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(calc(-100% - 16px));
    }
  }
</style>
`}
          ></Script>
        </div>
      </div>
    </div>
  )
}

HeroLandingPage.defaultProps = {
  image8Src:
    'https://images.unsplash.com/photo-1527767845446-673dae8f2368?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTMyMXwwfDF8cmFuZG9tfHx8fHx8fHx8MTczNDEwOTYzNXw&ixlib=rb-4.0.3&q=80&w=1500',
  image7Alt: 'Map of Moldova highlighting educational opportunities',
  image6Src:
    'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTMyMXwwfDF8cmFuZG9tfHx8fHx8fHx8MTczNDEwOTYzNHw&ixlib=rb-4.0.3&q=80&w=1500',
  image8Alt: 'Diverse group of students in Moldova',
  image9Src:
    'https://images.unsplash.com/photo-1461632830798-3adb3034e4c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTMyMXwwfDF8cmFuZG9tfHx8fHx8fHx8MTczNDEwOTYzNHw&ixlib=rb-4.0.3&q=80&w=1500',
  image4Src:
    'https://images.unsplash.com/photo-1637148778990-621fbe8a8358?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTMyMXwwfDF8cmFuZG9tfHx8fHx8fHx8MTczNDEwOTYzNXw&ixlib=rb-4.0.3&q=80&w=1500',
  image7Src:
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTMyMXwwfDF8cmFuZG9tfHx8fHx8fHx8MTczNDEwOTYzNHw&ixlib=rb-4.0.3&q=80&w=1500',
  image11Alt: 'Moldovan currency representing affordable education',
  image1Src:
    'https://images.unsplash.com/photo-1544260307-084b1ff75f94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTMyMXwwfDF8cmFuZG9tfHx8fHx8fHx8MTczNDEwOTYzN3w&ixlib=rb-4.0.3&q=80&w=1500',
  image2Alt: 'Moldovan flag waving',
  image12Src:
    'https://images.unsplash.com/photo-1677195449096-c24df89dd624?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTMyMXwwfDF8cmFuZG9tfHx8fHx8fHx8MTczNDEwOTYzNHw&ixlib=rb-4.0.3&q=80&w=1500',
  action2: undefined,
  action1: undefined,
  image10Src:
    'https://images.unsplash.com/photo-1600494448850-6013c64ba722?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTMyMXwwfDF8cmFuZG9tfHx8fHx8fHx8MTczNDEwOTYzNnw&ixlib=rb-4.0.3&q=80&w=1500',
  heading1: undefined,
  image9Alt: 'Moldovan countryside landscape',
  image3Alt: 'University campus in Moldova',
  image1Alt: 'Students studying in Moldova',
  image10Alt: 'Student accommodation in Moldova',
  image4Alt: 'Group of international students in Moldova',
  image5Src:
    'https://images.unsplash.com/photo-1690016793986-c6e9bf12da5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTMyMXwwfDF8cmFuZG9tfHx8fHx8fHx8MTczNDEwOTYzNXw&ixlib=rb-4.0.3&q=80&w=1500',
  image6Alt: 'Books and graduation cap symbolizing education in Moldova',
  image2Src:
    'https://images.unsplash.com/photo-1507537509458-b8312d35a233?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTMyMXwwfDF8cmFuZG9tfHx8fHx8fHx8MTczNDEwOTYzM3w&ixlib=rb-4.0.3&q=80&w=1500',
  image3Src:
    'https://images.unsplash.com/photo-1592324529648-14316c68ab03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTMyMXwwfDF8cmFuZG9tfHx8fHx8fHx8MTczNDEwOTYzM3w&ixlib=rb-4.0.3&q=80&w=1500',
  image12Alt: 'International students exploring Moldova',
  image11Src:
    'https://images.unsplash.com/photo-1690553761499-c5a698836c00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTMyMXwwfDF8cmFuZG9tfHx8fHx8fHx8MTczNDEwOTYzNHw&ixlib=rb-4.0.3&q=80&w=1500',
  image5Alt: 'Moldovan traditional architecture',
  content1: undefined,
}

HeroLandingPage.propTypes = {
  image8Src: PropTypes.string,
  image7Alt: PropTypes.string,
  image6Src: PropTypes.string,
  image8Alt: PropTypes.string,
  image9Src: PropTypes.string,
  image4Src: PropTypes.string,
  image7Src: PropTypes.string,
  image11Alt: PropTypes.string,
  image1Src: PropTypes.string,
  image2Alt: PropTypes.string,
  image12Src: PropTypes.string,
  action2: PropTypes.element,
  action1: PropTypes.element,
  image10Src: PropTypes.string,
  heading1: PropTypes.element,
  image9Alt: PropTypes.string,
  image3Alt: PropTypes.string,
  image1Alt: PropTypes.string,
  image10Alt: PropTypes.string,
  image4Alt: PropTypes.string,
  image5Src: PropTypes.string,
  image6Alt: PropTypes.string,
  image2Src: PropTypes.string,
  image3Src: PropTypes.string,
  image12Alt: PropTypes.string,
  image11Src: PropTypes.string,
  image5Alt: PropTypes.string,
  content1: PropTypes.element,
}

export default HeroLandingPage

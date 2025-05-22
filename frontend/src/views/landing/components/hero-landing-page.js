import React, { Fragment, useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Script from 'dangerous-html/react'
import PropTypes from 'prop-types'
import { getCloudinaryImageUrl } from '../../../config/cloudinary'

import './hero-landing-page.css'

const rotativeImages = [
  getCloudinaryImageUrl('calin-stan-0Jxgsidj3aA-unsplash_wmvper', { width: 300, height: 300, crop: 'fill', quality: 'auto:good' }),
  getCloudinaryImageUrl('a4f9df0e701eaba63ae56f77f19cf6d1_xzvloq', { width: 300, height: 300, crop: 'fill', quality: 'auto:good' }),
  getCloudinaryImageUrl('dorin-seremet-Qhy0SX5vv8w-unsplash_s2g5nh', { width: 300, height: 300, crop: 'fill', quality: 'auto:good' }),
  getCloudinaryImageUrl('alex-kalinin-8bs-Kz8ACdM-unsplash_thbirt', { width: 300, height: 300, crop: 'fill', quality: 'auto:good' }),
  getCloudinaryImageUrl('sasha-pleshco-JUekx3CODgM-unsplash_uglgqx', { width: 300, height: 300, crop: 'fill', quality: 'auto:good' }),
  getCloudinaryImageUrl('sasha-pleshco-LI5MSjGm6sQ-unsplash_qquwmh', { width: 300, height: 300, crop: 'fill', quality: 'auto:good' }),
  getCloudinaryImageUrl('sasha-pleshco-0iVvzptzjBA-unsplash_a80uzk', { width: 300, height: 300, crop: 'fill', quality: 'auto:good' }),
  getCloudinaryImageUrl('pexels-vadim-burdujan-207144379-18877978_akmeg5', { width: 300, height: 300, crop: 'fill', quality: 'auto:good' }),
  getCloudinaryImageUrl('pexels-roman-muntean-369190311-17067159_bmxk67', { width: 300, height: 300, crop: 'fill', quality: 'auto:good' })
];

const HeroLandingPage = (props) => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(Array(rotativeImages.length).fill(false));
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  const handleImageLoad = (idx) => {
    setLoaded((prev) => {
      const copy = [...prev];
      copy[idx] = true;
      return copy;
    });
  };

  const allLoaded = loaded.every(Boolean);

  // Calculăm câte imagini sunt necesare pentru a umple containerul
  const imageWidth = 300; // lățimea unei imagini
  const gap = 16; // spațiul dintre imagini
  const imagesNeeded = Math.ceil((containerWidth + gap) / (imageWidth + gap)) * 2; // Înmulțim cu 2 pentru a avea suficientă suprapunere

  // Generăm array-ul de imagini pentru animație
  const displayImages = useMemo(() => {
    if (!allLoaded || imagesNeeded <= 0) return rotativeImages;
    
    const result = [];
    for (let i = 0; i < imagesNeeded; i++) {
      result.push(rotativeImages[i % rotativeImages.length]);
    }
    
    return result;
  }, [allLoaded, imagesNeeded]);

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
          <button 
            className="thq-button-outline hero-landing-page-button2"
            onClick={() => navigate('/contact')}
          >
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
              alt="Students studying in Moldova"
              src={getCloudinaryImageUrl('pexels-anaghan-km-177642992-11351622-1400w_cwfhbp', { width: 300, height: 300, crop: 'fill', quality: 'auto:good' })}
              loading="lazy"
              className="hero-landing-page-placeholder-image10 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt="Moldovan university campus"
              src={getCloudinaryImageUrl('moldavskaya-ekonomicheskaya-akademiya-asem_thumb-1400w_q98ahh', { width: 300, height: 300, crop: 'fill', quality: 'auto:good' })}
              loading="lazy"
              className="hero-landing-page-placeholder-image11 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt="University library"
              src={getCloudinaryImageUrl('dsc_5137-1000w_bmf680', { width: 300, height: 300, crop: 'fill', quality: 'auto:good' })}
              loading="lazy"
              className="hero-landing-page-placeholder-image12 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt="Student life in Moldova"
              src={getCloudinaryImageUrl('dorin-seremet-_atwwma7pyw-unsplash-1400w_w6dekv', { width: 300, height: 300, crop: 'fill', quality: 'auto:good' })}
              loading="lazy"
              className="hero-landing-page-placeholder-image13 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt="Cultural activities"
              src={getCloudinaryImageUrl('young-people-dancing-folk-low-angle_p9pe0a', { width: 300, height: 300, crop: 'fill', quality: 'auto:good' })}
              loading="lazy"
              className="hero-landing-page-placeholder-image14 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt="Student events"
              src={getCloudinaryImageUrl('WhatsApp_Image_2024-11-15_at_14.33.02_3_rthlii', { width: 300, height: 300, crop: 'fill', quality: 'auto:good' })}
              loading="lazy"
              className="hero-landing-page-placeholder-image15 thq-img-scale thq-img-ratio-1-1"
            />
          </div>
          <div className="thq-animated-group-horizontal">
            <img
              alt="Campus activities"
              src={getCloudinaryImageUrl('WhatsApp_Image_2024-11-15_at_14.32.59_10_nvuklt', { width: 300, height: 300, crop: 'fill', quality: 'auto:good' })}
              loading="lazy"
              className="hero-landing-page-placeholder-image16 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt="Student life"
              src={getCloudinaryImageUrl('WhatsApp_Image_2024-11-15_at_14.32.59_4_eyimc2', { width: 300, height: 300, crop: 'fill', quality: 'auto:good' })}
              loading="lazy"
              className="hero-landing-page-placeholder-image17 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt="University events"
              src={getCloudinaryImageUrl('WhatsApp_Image_2024-11-15_at_14.32.59_8_kj92qd', { width: 300, height: 300, crop: 'fill', quality: 'auto:good' })}
              loading="lazy"
              className="hero-landing-page-placeholder-image18 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt="City life"
              src={getCloudinaryImageUrl('Prima%CC%86ria_Ba%CC%86lt%CC%A6i_2_wh1rul', { width: 300, height: 300, crop: 'fill', quality: 'auto:good' })}
              loading="lazy"
              className="hero-landing-page-placeholder-image19 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt="Moldovan architecture"
              src={getCloudinaryImageUrl('pexels-nicolae-casir-56591-205076_1_utlpjy', { width: 300, height: 300, crop: 'fill', quality: 'auto:good' })}
              loading="lazy"
              className="hero-landing-page-placeholder-image20 thq-img-scale thq-img-ratio-1-1"
            />
            <img
              alt="City view"
              src={getCloudinaryImageUrl('pexels-vadim-burdujan-207144379-18404492_jejema', { width: 300, height: 300, crop: 'fill', quality: 'auto:good' })}
              loading="lazy"
              className="hero-landing-page-placeholder-image21 thq-img-scale thq-img-ratio-1-1"
            />
          </div>
        </div>
        <div className="hero-landing-page-row-container2 thq-mask-image-horizontal thq-animated-group-container-horizontal" ref={containerRef}>
          <div className={`thq-animated-group-horizontal-reverse${allLoaded ? ' animate' : ''}`}>
            {displayImages.map((src, idx) => (
              <img
                key={`${src}-${idx}`}
                src={src}
                alt=""
                onLoad={() => handleImageLoad(idx % rotativeImages.length)}
                style={{ opacity: allLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
                className="hero-landing-page-placeholder-image22 thq-img-scale thq-img-ratio-1-1"
              />
            ))}
          </div>
        </div>
      </div>
      <div>
        <div className="hero-landing-page-container2">
          <Script
            html={`<style>
  @keyframes scroll-x {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(calc(-50% - 8px));
    }
  }

  .thq-animated-group-horizontal-reverse.animate {
    animation: scroll-x 30s linear infinite;
    display: flex;
    gap: 16px;
  }

  .thq-animated-group-horizontal-reverse.animate:hover {
    animation-play-state: paused;
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
  image8Src: '',
  image7Alt: 'Map of Moldova highlighting educational opportunities',
  image6Src: '',
  image8Alt: 'Diverse group of students in Moldova',
  image9Src: '',
  image4Src: '',
  image7Src: '',
  image11Alt: 'Moldovan currency representing affordable education',
  image1Src: '',
  image2Alt: 'Moldovan flag waving',
  image12Src: '',
  action2: undefined,
  action1: undefined,
  image10Src: '',
  heading1: undefined,
  image9Alt: 'Moldovan countryside landscape',
  image3Alt: 'University campus in Moldova',
  image1Alt: 'Students studying in Moldova',
  image10Alt: 'Student accommodation in Moldova',
  image4Alt: 'Group of international students in Moldova',
  image5Src: '',
  image6Alt: 'Books and graduation cap symbolizing education in Moldova',
  image2Src: '',
  image3Src: '',
  image12Alt: 'International students exploring Moldova',
  image11Src: '',
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

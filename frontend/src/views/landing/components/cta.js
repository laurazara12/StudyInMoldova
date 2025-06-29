import React from 'react'
import PropTypes from 'prop-types'
import './cta.css'
import { useTranslation } from 'react-i18next';

const CTA = (props) => {
  const { t } = useTranslation('cta');

  return (
    <div className="thq-section-padding">
      <div className="thq-section-max-width">
        <div className="cta-accent2-bg">
          <div className="cta-accent1-bg">
            <div className="cta-container2">
              <div className="cta-content">
                <span className="thq-heading-2">
                  {props.heading1 ?? <span className="cta-text4">{t('heading1')}</span>}
                </span>
                <p className="thq-body-large">
                  {props.content1 ?? <span className="cta-text5">{t('content1')}</span>}
                </p>
              </div>
              <div className="cta-actions">
                <button type="button" className="thq-button-filled cta-button">
                  <span>
                    {props.action1 ?? <span className="cta-text6">{t('action1')}</span>}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

CTA.defaultProps = {
  heading1: undefined,
  content1: undefined,
  action1: undefined,
}

CTA.propTypes = {
  heading1: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  content1: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  action1: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
}

export default CTA

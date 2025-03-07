import React, { Fragment } from 'react'

import PropTypes from 'prop-types'

import './footer.css'

const Footer = (props) => {
  return (
    <footer
      className={`footer-footer8 thq-section-padding ${props.rootClassName} `}
    >
      <div className="footer-max-width thq-section-max-width">
        <div className="footer-content">
          <div className="footer-column">
            <div className="footer-logo">
              <div className="footer-links">
                <a
                  href="https://example.com"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="thq-body-small"
                >
                  {props.link1 ?? (
                    <Fragment>
                      <span className="footer-text14">Link 1</span>
                    </Fragment>
                  )}
                </a>
                <a
                  href="https://example.com"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="thq-body-small"
                >
                  {props.link2 ?? (
                    <Fragment>
                      <span className="footer-text19">Link 2</span>
                    </Fragment>
                  )}
                </a>
                <a
                  href="https://example.com"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="thq-body-small"
                >
                  {props.link3 ?? (
                    <Fragment>
                      <span className="footer-text17">Link 3</span>
                    </Fragment>
                  )}
                </a>
                <a
                  href="https://example.com"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="thq-body-small"
                >
                  {props.link4 ?? (
                    <Fragment>
                      <span className="footer-text18">Link 4</span>
                    </Fragment>
                  )}
                </a>
                <a
                  href="https://example.com"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="thq-body-small"
                >
                  {props.link5 ?? (
                    <Fragment>
                      <span className="footer-text10">Link 5</span>
                    </Fragment>
                  )}
                </a>
              </div>
            </div>
          </div>
          <div className="footer-actions1">
            <span className="thq-body-small">
              {props.content1 ?? (
                <Fragment>
                  <span className="footer-text12">Subscribe</span>
                </Fragment>
              )}
            </span>
            <div className="footer-actions2">
              <div className="footer-form">
                <div className="footer-container">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="footer-text-input thq-input"
                  />
                </div>
                <button className="thq-button-outline footer-button">
                  <span className="thq-body-small">
                    {props.action1 ?? (
                      <Fragment>
                        <span className="footer-text11">Subscribe</span>
                      </Fragment>
                    )}
                  </span>
                </button>
              </div>
              <span className="thq-body-small">
                {props.content2 ?? (
                  <Fragment>
                    <span className="footer-text21">
                      By subscribing you agree to with our Privacy Policy and
                      provide consent to receive updates from our company.
                    </span>
                  </Fragment>
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="footer-credits">
          <div className="thq-divider-horizontal"></div>
          <div className="footer-row">
            <div className="footer-footer-links">
              <span className="thq-body-small">
                {props.privacyLink ?? (
                  <Fragment>
                    <span className="footer-text15">Privacy Policy</span>
                  </Fragment>
                )}
              </span>
              <span className="thq-body-small">
                {props.termsLink ?? (
                  <Fragment>
                    <span className="footer-text20">Terms of Service</span>
                  </Fragment>
                )}
              </span>
              <span className="thq-body-small">
                {props.cookiesLink ?? (
                  <Fragment>
                    <span className="footer-text16">Cookies Settings</span>
                  </Fragment>
                )}
              </span>
            </div>
            <span className="thq-body-small">
              {props.content3 ?? (
                <Fragment>
                  <span className="footer-text13">
                    © 2024
                    <span
                      dangerouslySetInnerHTML={{
                        __html: ' ',
                      }}
                    />
                  </span>
                </Fragment>
              )}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

Footer.defaultProps = {
  link5: undefined,
  action1: undefined,
  content1: undefined,
  content3: undefined,
  link1: undefined,
  privacyLink: undefined,
  cookiesLink: undefined,
  link3: undefined,
  link4: undefined,
  link2: undefined,
  termsLink: undefined,
  content2: undefined,
  rootClassName: '',
}

Footer.propTypes = {
  link5: PropTypes.element,
  action1: PropTypes.element,
  content1: PropTypes.element,
  content3: PropTypes.element,
  link1: PropTypes.element,
  privacyLink: PropTypes.element,
  cookiesLink: PropTypes.element,
  link3: PropTypes.element,
  link4: PropTypes.element,
  link2: PropTypes.element,
  termsLink: PropTypes.element,
  content2: PropTypes.element,
  rootClassName: PropTypes.string,
}

export default Footer

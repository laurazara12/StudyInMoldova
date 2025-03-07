import React, { Fragment } from 'react'

import PropTypes from 'prop-types'

import './error404.css'

const Error404 = (props) => {
  return (
    <div className="error404-container1 thq-section-padding">
      <div className="error404-max-width thq-section-max-width">
        <div className="error404-container2">
          <div className="error404-container3">
            <h2 className="error404-text1 thq-heading-2">Oooops!</h2>
            <p className="error404-text2 thq-body-large">
              {props.content1 ?? (
                <Fragment>
                  <span className="error404-text5">
                    We can&apos;t seem to find the page you are looking for.
                  </span>
                </Fragment>
              )}
            </p>
            <button className="thq-button-filled">
              <span className="thq-body-small">
                {props.action1 ?? (
                  <Fragment>
                    <span className="error404-text4">Back to homepage</span>
                  </Fragment>
                )}
              </span>
            </button>
          </div>
        </div>
        <div className="error404-container4">
          <h1 className="error404-text3 thq-heading-1">404</h1>
        </div>
      </div>
    </div>
  )
}

Error404.defaultProps = {
  action1: undefined,
  content1: undefined,
}

Error404.propTypes = {
  action1: PropTypes.element,
  content1: PropTypes.element,
}

export default Error404

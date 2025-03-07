import React, { Fragment } from 'react'

import PropTypes from 'prop-types'

import './option-row.css'

const OptionRow = (props) => {
  return (
    <div className={`option-row-option-row ${props.rootClassName} `}>
      <div className="option-row-option-name">
        <p className="option-row-text10 px24">
          {props.feature5Title ?? (
            <Fragment>
              <span className="option-row-text16">Feature #5</span>
            </Fragment>
          )}
        </p>
      </div>
      <div className="option-row-option-faculty">
        <p className="option-row-text11 px24">
          {props.feature5Title1 ?? (
            <Fragment>
              <span className="option-row-text18">Feature #5</span>
            </Fragment>
          )}
        </p>
      </div>
      <div className="option-row-option-degree">
        <p className="option-row-text12 px24">
          {props.feature5Title11 ?? (
            <Fragment>
              <span className="option-row-text19">Feature #5</span>
            </Fragment>
          )}
        </p>
      </div>
      <div className="option-row-option-credits">
        <p className="option-row-text13 px24">
          {props.feature5Title111 ?? (
            <Fragment>
              <span className="option-row-text17">Feature #5</span>
            </Fragment>
          )}
        </p>
      </div>
      <div className="option-row-option-languages">
        <p className="option-row-text14 px24">
          {props.feature5Title1111 ?? (
            <Fragment>
              <span className="option-row-text15">Feature #5</span>
            </Fragment>
          )}
        </p>
      </div>
    </div>
  )
}

OptionRow.defaultProps = {
  feature5Title1111: undefined,
  rootClassName: '',
  feature5Title: undefined,
  feature5Title111: undefined,
  feature5Title1: undefined,
  feature5Title11: undefined,
}

OptionRow.propTypes = {
  feature5Title1111: PropTypes.element,
  rootClassName: PropTypes.string,
  feature5Title: PropTypes.element,
  feature5Title111: PropTypes.element,
  feature5Title1: PropTypes.element,
  feature5Title11: PropTypes.element,
}

export default OptionRow

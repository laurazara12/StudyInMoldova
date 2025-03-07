import React, { Fragment } from 'react'

import PropTypes from 'prop-types'

import './search-bar.css'

const SearchBar = (props) => {
  return (
    <div className="search-bar-container1">
      <div className="search-bar-container2">
        <div className="search-bar-container3">
          <label className="search-bar-text1">
            {props.text1 ?? (
              <Fragment>
                <span className="search-bar-text3">
                  Looking for a university ?
                </span>
              </Fragment>
            )}
          </label>
          <input type="text" placeholder="University Name" className="input" />
          <button type="button" className="button search-bar-button">
            <span>
              {props.button ?? (
                <Fragment>
                  <span className="search-bar-text4">Submit</span>
                </Fragment>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

SearchBar.defaultProps = {
  text1: undefined,
  button: undefined,
}

SearchBar.propTypes = {
  text1: PropTypes.element,
  button: PropTypes.element,
}

export default SearchBar

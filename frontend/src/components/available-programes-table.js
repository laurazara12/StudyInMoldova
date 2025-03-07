import React, { Fragment } from 'react'

import PropTypes from 'prop-types'

import OptionRow from './option-row'
import './available-programes-table.css'

const AvailableProgramesTable = (props) => {
  return (
    <div className="available-programes-table-layout349 thq-section-padding">
      <div className="available-programes-table-container thq-grid-auto-300">
        <div className="available-programes-table-title thq-card thq-flex-column">
          <h2 className="thq-heading-2">
            {props.feature1Title ?? (
              <Fragment>
                <span className="available-programes-table-text26">
                  Discover the available programs
                </span>
              </Fragment>
            )}
          </h2>
        </div>
        <ul className="available-programes-table-option-list list">
          <li className="available-programes-table-option-list-i-header list-item">
            <div
              id={props.optionRowHeaderId}
              className="available-programes-table-option-row-header"
            >
              <div className="available-programes-table-option-title">
                <p className="available-programes-table-text11 thq-heading-2 px24">
                  {props.feature5Title413 ?? (
                    <Fragment>
                      <span className="available-programes-table-text27">
                        Name
                      </span>
                    </Fragment>
                  )}
                </p>
              </div>
              <div className="available-programes-table-option-faculty">
                <p className="available-programes-table-text12 thq-heading-2 px24">
                  {props.feature5Title4131 ?? (
                    <Fragment>
                      <span className="available-programes-table-text29">
                        Faculty
                      </span>
                    </Fragment>
                  )}
                </p>
              </div>
              <div className="available-programes-table-option-degree">
                <p className="available-programes-table-text13 thq-heading-2 px24">
                  {props.feature5Title412 ?? (
                    <Fragment>
                      <span className="available-programes-table-text30">
                        Degree
                      </span>
                    </Fragment>
                  )}
                </p>
              </div>
              <div className="available-programes-table-option-credits">
                <p className="available-programes-table-text14 thq-heading-2 px24">
                  {props.feature5Title411 ?? (
                    <Fragment>
                      <span className="available-programes-table-text31">
                        Credits
                      </span>
                    </Fragment>
                  )}
                </p>
              </div>
              <div className="available-programes-table-option-languages">
                <p className="available-programes-table-text15 thq-heading-2 px24">
                  {props.feature5Title4111 ?? (
                    <Fragment>
                      <span className="available-programes-table-text28">
                        Languages
                      </span>
                    </Fragment>
                  )}
                </p>
              </div>
            </div>
          </li>
          <li
            id={props.optionListItemId1}
            className="available-programes-table-option-list-item1 list-item"
          >
            <a
              href="https://usm.md/?page_id=515&amp;lang=en"
              target="_blank"
              rel="noreferrer noopener"
            >
              <OptionRow
                feature5Title={
                  <Fragment>
                    <span className="available-programes-table-text16">
                      Game Design
                    </span>
                  </Fragment>
                }
                rootClassName="option-rowroot-class-name2"
                feature5Title1={
                  <Fragment>
                    <span className="available-programes-table-text17">
                      The Faculty of Mathematics and Computer Science
                    </span>
                  </Fragment>
                }
                feature5Title11={
                  <Fragment>
                    <span className="available-programes-table-text18">
                      Bachelor
                    </span>
                  </Fragment>
                }
                feature5Title111={
                  <Fragment>
                    <span className="available-programes-table-text19">
                      180 ECTS 
                    </span>
                  </Fragment>
                }
                feature5Title1111={
                  <Fragment>
                    <span className="available-programes-table-text20">
                      Romanian, Russian, English
                    </span>
                  </Fragment>
                }
                className="available-programes-table-option-row1"
              ></OptionRow>
            </a>
          </li>
          <li
            id={props.optionListItemId2}
            className="available-programes-table-option-list-item2 list-item"
          >
            <OptionRow
              feature5Title={
                <Fragment>
                  <span className="available-programes-table-text21">
                    Feature #5
                  </span>
                </Fragment>
              }
              rootClassName="option-rowroot-class-name4"
              feature5Title1={
                <Fragment>
                  <span className="available-programes-table-text22">
                    Feature #5
                  </span>
                </Fragment>
              }
              feature5Title11={
                <Fragment>
                  <span className="available-programes-table-text23">
                    Feature #5
                  </span>
                </Fragment>
              }
              feature5Title111={
                <Fragment>
                  <span className="available-programes-table-text24">
                    Feature #5
                  </span>
                </Fragment>
              }
              feature5Title1111={
                <Fragment>
                  <span className="available-programes-table-text25">
                    Feature #5
                  </span>
                </Fragment>
              }
            ></OptionRow>
          </li>
        </ul>
      </div>
    </div>
  )
}

AvailableProgramesTable.defaultProps = {
  feature1Title: undefined,
  optionListItemId1: '',
  feature5Title413: undefined,
  feature5Title4111: undefined,
  feature5Title4131: undefined,
  optionRowHeaderId: '',
  optionListItemId2: '',
  feature5Title412: undefined,
  feature5Title411: undefined,
}

AvailableProgramesTable.propTypes = {
  feature1Title: PropTypes.element,
  optionListItemId1: PropTypes.string,
  feature5Title413: PropTypes.element,
  feature5Title4111: PropTypes.element,
  feature5Title4131: PropTypes.element,
  optionRowHeaderId: PropTypes.string,
  optionListItemId2: PropTypes.string,
  feature5Title412: PropTypes.element,
  feature5Title411: PropTypes.element,
}

export default AvailableProgramesTable

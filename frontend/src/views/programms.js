import React, { Fragment } from 'react'

import { Helmet } from 'react-helmet'

import Navbar from '../components/navbar'
import './programms.css'

const Programms = (props) => {
  return (
    <div className="programms-container">
      <Helmet>
        <title>Programms - exported project</title>
        <meta property="og:title" content="Programms - exported project" />
      </Helmet>
      <Navbar
        text={
          <Fragment>
            <span className="programms-text10">Study In Moldova</span>
          </Fragment>
        }
        login={
          <Fragment>
            <span className="programms-text11">Login</span>
          </Fragment>
        }
        text2={
          <Fragment>
            <span className="programms-text12">Living In Moldova</span>
          </Fragment>
        }
        text3={
          <Fragment>
            <span className="programms-text13">Programmes</span>
          </Fragment>
        }
        text4={
          <Fragment>
            <span className="programms-text14">Help You Choose</span>
          </Fragment>
        }
        text5={
          <Fragment>
            <span className="programms-text15">Universities</span>
          </Fragment>
        }
        text6={
          <Fragment>
            <span className="programms-text16">Plan Your Studies</span>
          </Fragment>
        }
        login1={
          <Fragment>
            <span className="programms-text17">Login</span>
          </Fragment>
        }
        text12={
          <Fragment>
            <span className="programms-text18">About</span>
          </Fragment>
        }
        text13={
          <Fragment>
            <span className="programms-text19">Features</span>
          </Fragment>
        }
        text14={
          <Fragment>
            <span className="programms-text20">Pricing</span>
          </Fragment>
        }
        text15={
          <Fragment>
            <span className="programms-text21">Team</span>
          </Fragment>
        }
        text16={
          <Fragment>
            <span className="programms-text22">Blog</span>
          </Fragment>
        }
        register={
          <Fragment>
            <span className="programms-text23">Register</span>
          </Fragment>
        }
        register1={
          <Fragment>
            <span className="programms-text24">Register</span>
          </Fragment>
        }
        rootClassName="navbarroot-class-name2"
      ></Navbar>
    </div>
  )
}

export default Programms

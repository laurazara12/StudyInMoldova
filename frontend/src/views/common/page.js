import React, { Fragment } from 'react'
import { Helmet } from 'react-helmet-async'

import Navbar from '../../components/navbar'
import SignUpComponent from '../../components/sign-up'
import './styles.css'

const Page = (props) => {
  return (
    <div className="page-container">
      <Helmet>
        <title>Page - exported project</title>
        <meta property="og:title" content="Page - exported project" />
      </Helmet>
      <Navbar
        text={
          <Fragment>
            <span className="page-text10">Study In Moldova</span>
          </Fragment>
        }
        login={
          <Fragment>
            <span className="page-text11">Login</span>
          </Fragment>
        }
        text2={
          <Fragment>
            <span className="page-text12">Living In Moldova</span>
          </Fragment>
        }
        text3={
          <Fragment>
            <span className="page-text13">Programmes</span>
          </Fragment>
        }
        text4={
          <Fragment>
            <span className="page-text14">Help You Choose</span>
          </Fragment>
        }
        text5={
          <Fragment>
            <span className="page-text15">Universities</span>
          </Fragment>
        }
        text6={
          <Fragment>
            <span className="page-text16">Plan Your Studies</span>
          </Fragment>
        }
        login1={
          <Fragment>
            <span className="page-text17">Login</span>
          </Fragment>
        }
        text12={
          <Fragment>
            <span className="page-text18">About</span>
          </Fragment>
        }
        text13={
          <Fragment>
            <span className="page-text19">Features</span>
          </Fragment>
        }
        text14={
          <Fragment>
            <span className="page-text20">Pricing</span>
          </Fragment>
        }
        text15={
          <Fragment>
            <span className="page-text21">Team</span>
          </Fragment>
        }
        text16={
          <Fragment>
            <span className="page-text22">Blog</span>
          </Fragment>
        }
        register={
          <Fragment>
            <span className="page-text23">Register</span>
          </Fragment>
        }
        register1={
          <Fragment>
            <span className="page-text24">Register</span>
          </Fragment>
        }
        rootClassName="navbarroot-class-name1"
      ></Navbar>
      <SignUpComponent
        action1={
          <Fragment>
            <span className="page-text25">Continue with email</span>
          </Fragment>
        }
        action3={
          <Fragment>
            <span className="page-text26">Continue with Google</span>
          </Fragment>
        }
        content1={
          <Fragment>
            <span className="page-text27">Sign up to see details</span>
          </Fragment>
        }
        heading1={
          <Fragment>
            <span className="page-text28">Create an account</span>
          </Fragment>
        }
      ></SignUpComponent>
    </div>
  )
}

export default Page

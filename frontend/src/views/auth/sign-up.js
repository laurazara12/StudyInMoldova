import React, { Fragment } from 'react'
import { Helmet } from 'react-helmet-async'

import Navbar from '../../components/navbar'
import SignUpComponent from '../../components/sign-up'
import './sign-up.css'

const SignUpPage = (props) => {
  return (
    <div className="sign-up-container">
      <Helmet>
        <title>Sign Up - Study In Moldova</title>
        <meta property="og:title" content="Sign Up - Study In Moldova" />
      </Helmet>
      <Navbar rootClassName="navbar-root-class-name"></Navbar>
      <SignUpComponent
        action1={
          <Fragment>
            <span className="sign-up-text25">Submit</span>
          </Fragment>
        }
        action3={
          <Fragment>
            <span className="sign-up-text26">Continue with Google</span>
          </Fragment>
        }
        content1={
          <Fragment>
            <span className="sign-up-text27">Sign up to see details</span>
          </Fragment>
        }
        heading1={
          <Fragment>
            <span className="sign-up-text28">Create an account</span>
          </Fragment>
        }
      ></SignUpComponent>
    </div>
  )
}

export default SignUpPage

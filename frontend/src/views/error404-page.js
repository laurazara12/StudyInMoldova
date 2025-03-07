import React, { Fragment } from 'react'

import { Helmet } from 'react-helmet'

import Navbar from '../components/navbar'
import Error404 from '../components/error404'
import Footer from '../components/footer'
import './error404-page.css'

const Error404Page = (props) => {
  return (
    <div className="error404-page-container">
      <Helmet>
        <title>Error404Page - exported project</title>
        <meta property="og:title" content="Error404Page - exported project" />
      </Helmet>
      <Navbar
        text6={
          <Fragment>
            <span className="error404-page-text10">Plan Your Studies</span>
          </Fragment>
        }
        text16={
          <Fragment>
            <span className="error404-page-text11">Blog</span>
          </Fragment>
        }
        text={
          <Fragment>
            <span className="error404-page-text12">Study In Moldova</span>
          </Fragment>
        }
        text13={
          <Fragment>
            <span className="error404-page-text13">Features</span>
          </Fragment>
        }
        text15={
          <Fragment>
            <span className="error404-page-text14">Team</span>
          </Fragment>
        }
        text14={
          <Fragment>
            <span className="error404-page-text15">Pricing</span>
          </Fragment>
        }
        text3={
          <Fragment>
            <span className="error404-page-text16">Programmes</span>
          </Fragment>
        }
        text4={
          <Fragment>
            <span className="error404-page-text17">Help You Choose</span>
          </Fragment>
        }
        register1={
          <Fragment>
            <span className="error404-page-text18">Register</span>
          </Fragment>
        }
        text5={
          <Fragment>
            <span className="error404-page-text19">Universities</span>
          </Fragment>
        }
        register={
          <Fragment>
            <span className="error404-page-text20">Register</span>
          </Fragment>
        }
        login1={
          <Fragment>
            <span className="error404-page-text21">Login</span>
          </Fragment>
        }
        text2={
          <Fragment>
            <span className="error404-page-text22">Living In Moldova</span>
          </Fragment>
        }
        text12={
          <Fragment>
            <span className="error404-page-text23">About</span>
          </Fragment>
        }
        login={
          <Fragment>
            <span className="error404-page-text24">Login</span>
          </Fragment>
        }
      ></Navbar>
      <Error404
        action1={
          <Fragment>
            <span className="error404-page-text25">Back to homepage</span>
          </Fragment>
        }
        content1={
          <Fragment>
            <span className="error404-page-text26">
              We can&apos;t seem to find the page you are looking for.
            </span>
          </Fragment>
        }
      ></Error404>
      <Footer
        link5={
          <Fragment>
            <span className="error404-page-text27">Link 5</span>
          </Fragment>
        }
        action1={
          <Fragment>
            <span className="error404-page-text28">Subscribe</span>
          </Fragment>
        }
        content1={
          <Fragment>
            <span className="error404-page-text29">Subscribe</span>
          </Fragment>
        }
        content3={
          <Fragment>
            <span className="error404-page-text30">
              © 2024
              <span
                dangerouslySetInnerHTML={{
                  __html: ' ',
                }}
              />
            </span>
          </Fragment>
        }
        link1={
          <Fragment>
            <span className="error404-page-text31">Link 1</span>
          </Fragment>
        }
        privacyLink={
          <Fragment>
            <span className="error404-page-text32">Privacy Policy</span>
          </Fragment>
        }
        cookiesLink={
          <Fragment>
            <span className="error404-page-text33">Cookies Settings</span>
          </Fragment>
        }
        link3={
          <Fragment>
            <span className="error404-page-text34">Link 3</span>
          </Fragment>
        }
        link4={
          <Fragment>
            <span className="error404-page-text35">Link 4</span>
          </Fragment>
        }
        link2={
          <Fragment>
            <span className="error404-page-text36">Link 2</span>
          </Fragment>
        }
        termsLink={
          <Fragment>
            <span className="error404-page-text37">Terms of Service</span>
          </Fragment>
        }
        content2={
          <Fragment>
            <span className="error404-page-text38">
              By subscribing you agree to with our Privacy Policy and provide
              consent to receive updates from our company.
            </span>
          </Fragment>
        }
      ></Footer>
    </div>
  )
}

export default Error404Page

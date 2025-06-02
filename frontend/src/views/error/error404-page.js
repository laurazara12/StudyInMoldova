import React from 'react'
import { Helmet } from 'react-helmet-async'
import Navbar from '../../components/navbar'
import Error404 from './error404'
import Footer from '../../components/footer'
import './error404-page.css'

const Error404Page = () => {
  return (
    <div className="error404-page-container">
      <Helmet>
        <title>Page Not Found - Study in Moldova</title>
        <meta name="description" content="The page you are looking for could not be found. Return to the Study in Moldova homepage." />
        <meta property="og:title" content="Page Not Found - Study in Moldova" />
        <meta property="og:description" content="The page you are looking for could not be found. Return to the Study in Moldova homepage." />
      </Helmet>
      <Navbar />
      <Error404
        action1="Back to homepage"
        content1="We can't seem to find the page you are looking for."
      />
      <Footer />
    </div>
  )
}

export default Error404Page

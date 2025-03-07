import React, { Fragment, useState } from 'react'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import Navbar from '../components/navbar'
import SignIn from '../components/sign-in'
import './sign-in.css'

const SignInPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const history = useHistory()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      })

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      history.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la autentificare')
    }
  }

  return (
    <div className="sign-in-container">
      <Helmet>
        <title>Sign-In - exported project</title>
        <meta property="og:title" content="Sign-In - exported project" />
      </Helmet>
      <Navbar
        text={
          <Fragment>
            <span className="sign-in-text10">Study In Moldova</span>
          </Fragment>
        }
        login={
          <Fragment>
            <span className="sign-in-text11">Login</span>
          </Fragment>
        }
        text2={
          <Fragment>
            <span className="sign-in-text12">Living In Moldova</span>
          </Fragment>
        }
        text3={
          <Fragment>
            <span className="sign-in-text13">Programmes</span>
          </Fragment>
        }
        text4={
          <Fragment>
            <span className="sign-in-text14">Help You Choose</span>
          </Fragment>
        }
        text5={
          <Fragment>
            <span className="sign-in-text15">Universities</span>
          </Fragment>
        }
        text6={
          <Fragment>
            <span className="sign-in-text16">Plan Your Studies</span>
          </Fragment>
        }
        login1={
          <Fragment>
            <span className="sign-in-text17">Login</span>
          </Fragment>
        }
        text12={
          <Fragment>
            <span className="sign-in-text18">About</span>
          </Fragment>
        }
        text13={
          <Fragment>
            <span className="sign-in-text19">Features</span>
          </Fragment>
        }
        text14={
          <Fragment>
            <span className="sign-in-text20">Pricing</span>
          </Fragment>
        }
        text15={
          <Fragment>
            <span className="sign-in-text21">Team</span>
          </Fragment>
        }
        text16={
          <Fragment>
            <span className="sign-in-text22">Blog</span>
          </Fragment>
        }
        register={
          <Fragment>
            <span className="sign-in-text23">Register</span>
          </Fragment>
        }
        register1={
          <Fragment>
            <span className="sign-in-text24">Register</span>
          </Fragment>
        }
        rootClassName="navbarroot-class-name3"
      ></Navbar>
      <SignIn
        action1={
          <Fragment>
            <span className="sign-in-text25">Sign In</span>
          </Fragment>
        }
        heading11={
          <Fragment>
            <span className="sign-in-text26">Sign In to Study in Moldova</span>
          </Fragment>
        }
        rootClassName="sign-inroot-class-name"
      ></SignIn>
    </div>
  )
}

export default SignInPage

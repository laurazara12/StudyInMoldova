import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../../components/navbar';
import SignIn from './components/sign-in';
import './sign-in.css';
import '../../style.css';

const SignInPage = () => {
  return (
    <div className="sign-in-container">
      <Helmet>
        <title>Login - Study In Moldova</title>
        <meta property="og:title" content="Login - Study In Moldova" />
      </Helmet>
      <Navbar rootClassName="navbar-root-class-name" />
      <SignIn
        action1={
          <span className="btn2 btn-create-account">Login</span>
        }
        heading11={
          <span className="sign-in-text26">Login in Study in Moldova</span>
        }
        rootClassName="sign-inroot-class-name"
      />
    </div>
  );
};

export default SignInPage; 
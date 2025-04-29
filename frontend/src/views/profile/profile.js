import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import Navbar from '../../components/navbar';
import ProfileComponent from '../../components/profile-component';
import Footer from '../../components/footer';
import Notifications from '../../components/notifications';
import './styles.css';

const Profile = () => {
  return (
    <div className="profile-page">
      <Helmet>
        <title>Profile - Study In Moldova</title>
        <meta property="og:title" content="Profile - Study In Moldova" />
      </Helmet>
      <Navbar rootClassName="navbar-root-class-name" />
      <div className="profile-container">
        <div className="profile-content">
          <div className="profile-header">
            <h1 className="profile-heading">User Profile</h1>
            <Notifications />
          </div>
          <div className="profile-main">
            <ProfileComponent />
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Profile;
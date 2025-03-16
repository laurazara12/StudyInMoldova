import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '../components/navbar';
import ProfileComponent from '../components/profile-component';
import './profile.css';

const Profile = () => {
  return (
    <div className="profile-container">
      <Helmet>
        <title>Profile - Study In Moldova</title>
        <meta property="og:title" content="Profile - Study In Moldova" />
      </Helmet>
      <Navbar rootClassName="navbar-root-class-name" />
      <ProfileComponent />
    </div>
  );
};

export default Profile;
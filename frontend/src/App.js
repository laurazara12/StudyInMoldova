import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/navbar';
import ScrollToTop from './components/ScrollToTop';

import './style.css';
import Home from './views/landing/landing';
import SignIn from './views/auth/sign-in';
import SignUp from './views/auth/sign-up';
import Profile from './views/profile/profile';
import Universities from './views/universities/universities';
import Programs from './views/programs/programs';
import LivingInMoldova from './views/living/overview';
import PlanYourStudies from './views/planning/plan';
import Blog from './views/blog/blog';
import BlogPost from './views/blog/BlogPost';
import NotFound from './views/error/not-found';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './views/admin/dashboard';
import TransportationGuide from './views/living/transportation-guide';
import ProfileAdmin from './views/admin/profile-admin';
import Error404Page from './views/error/error404-page';
import UniversityTemplate from './views/universities/university-template';
import Contact from './views/contact/contact';
import About from './views/about/about';
import HelpYouChoose from './views/help-you-choose-AI/help-you-choose-AI';
import Privacy from './views/privacy/privacy';
import Terms from './views/terms/terms';
import Cookies from './views/cookies/cookies';
import FAQ from './views/faq/faq';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: getAuthHeaders()
        });

        if (response.data && response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <HelmetProvider>
      <AuthProvider>
        <div className="App">
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/universities" element={<Universities />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/living-in-moldova" element={<LivingInMoldova />} />
            <Route path="/plan-your-studies" element={<PlanYourStudies />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/help-you-choose-AI" element={<HelpYouChoose />} />
            <Route path="/universities/:slug" element={<UniversityTemplate />} />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/admin-profile" element={
              <PrivateRoute requiredRole="admin">
                <ProfileAdmin />
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute requiredRole="admin">
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/living-in-moldova/transportation-guide" element={<TransportationGuide />} />
            <Route path="/error404-page" element={<Error404Page />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
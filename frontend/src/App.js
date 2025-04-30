import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/navbar';

import './style.css';
import Home from './views/landing';
import SignIn from './views/auth/sign-in';
import SignUp from './views/auth/sign-up';
import Profile from './views/profile';
import Universities from './views/universities';
import Programms from './views/programms';
import LivingInMoldova from './views/living-in-moldova';
import PlanYourStudies from './views/planning/plan';
import NotFound from './views/not-found';
import USMUniversityIndividualPage from './views/universities/usm-university-individual-page';
import UTMUniversityIndividualPage from './views/universities/utm-university-individual-page';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './views/admin/dashboard';
import TransportationGuide from './views/living-in-moldova/transportation-guide';
import ProfileAdmin from './views/admin/profile-admin';

const App = () => {
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
        console.error('Eroare la verificarea autentificării:', error);
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
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/universities" element={<Universities />} />
          <Route path="/programms" element={<Programms />} />
          <Route path="/living-in-moldova" element={<LivingInMoldova />} />
          <Route path="/plan-your-studies" element={<PlanYourStudies />} />
          <Route path="/universities/usm-university-individual-page" element={<USMUniversityIndividualPage />} />
          <Route path="/universities/utm-university-individual-page" element={<UTMUniversityIndividualPage />} />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
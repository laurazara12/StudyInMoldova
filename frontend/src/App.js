import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import './style.css';
import Home from './views/landing';
import SignInPage from './views/sign-in';
import SignUpPage from './views/sign-up';
import Profile from './views/profile';
import Universities from './views/universities';
import Programms from './views/programms';
import LivingInMoldova from './views/living-in-moldova';
import PlanYourStudies from './views/plan-your-studies';
import NotFound from './views/not-found';
import USMUniversityIndividualPage from './views/universities/usm-university-individual-page';
import UTMUniversityIndividualPage from './views/universities/utm-university-individual-page';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './views/admin/dashboard';
import TransportationGuide from './views/living-in-moldova/transportation-guide';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/universities" element={<Universities />} />
        <Route path="/programms" element={<Programms />} />
        <Route path="/living-in-moldova" element={<LivingInMoldova />} />
        <Route path="/plan-your-studies" element={<PlanYourStudies />} />
        <Route path="/universities/usm-university-individual-page" element={<USMUniversityIndividualPage />} />
        <Route path="/universities/utm-university-individual-page" element={<UTMUniversityIndividualPage />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute requiredRole="admin"><Dashboard /></PrivateRoute>} />
        <Route path="/living-in-moldova/transportation-guide" element={<TransportationGuide />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
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
import NotFound from './views/not-found';
import USMUniversityIndividualPage from './views/universities/usm-university-individual-page';
import UTMUniversityIndividualPage from './views/universities/utm-university-individual-page';
import PrivateRoute from './components/PrivateRoute';
import ComponentName from './views/component-name';

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
        <Route path="/universities/usm-university-individual-page" element={<USMUniversityIndividualPage />} />
        <Route path="/universities/utm-university-individual-page" element={<UTMUniversityIndividualPage />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/example" element={<ExampleComponent />} />
        <Route path="/old-path" element={<Navigate to="/new-path" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
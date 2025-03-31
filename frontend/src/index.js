import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'

import './style.css'
import Page from './views/page'
import Landing from './views/landing'
import Programms from './views/programms'
import SignIn from './views/sign-in'
import UTMUniversityIndividualPage from './views/universities/utm-university-individual-page'
import Universities from './views/universities'
import USMUniversityIndividualPage from './views/universities/usm-university-individual-page'
import SignUp from './views/sign-up'
import LivingInMoldova from './views/living-in-moldova'
import PlanYourStudies from './views/plan-your-studies'
import Error404Page from './views/error404-page'
import NotFound from './views/not-found'
import Profile from './views/profile'
import Dashboard from './views/admin/dashboard'
import PrivateRoute from './components/PrivateRoute'
import TransportationGuide from './views/living-in-moldova/transportation-guide'

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/page" element={<Page />} />
          <Route path="/" element={<Landing />} />
          <Route path="/programms" element={<Programms />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/universities/usm1" element={<UTMUniversityIndividualPage />} />
          <Route path="/universities" element={<Universities />} />
          <Route path="/universities/usm" element={<USMUniversityIndividualPage />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/living-in-moldova" element={<LivingInMoldova />} />
          <Route path="/living-in-moldova/transportation-guide" element={<TransportationGuide />} />
          <Route path="/plan-your-studies" element={<PlanYourStudies />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<PrivateRoute requiredRole="admin"><Dashboard /></PrivateRoute>} />
          <Route path="/error404-page" element={<Error404Page />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

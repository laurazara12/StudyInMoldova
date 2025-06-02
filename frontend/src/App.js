import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { useNavigation } from './contexts/NavigationContext';
import { setNavigationCallback } from './config/api.config';
import Navbar from './components/navbar';
import ScrollToTop from './components/ScrollToTop';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedAuthRoute from './components/auth/ProtectedAuthRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PrivateRoute from './components/PrivateRoute';

import './style.css';
import Home from './views/landing/landing';
import SignIn from './views/auth/sign-in';
import SignUp from './views/auth/sign-up';
import Profile from './views/profile/profile';
import Universities from './views/universities/universities';
import Programs from './views/programs/programs';
import LivingInMoldova from './views/living-in-moldova/living-in-moldova';
import Blog from './views/blog/blog';
import BlogPost from './views/blog/BlogPost';
import Dashboard from './views/admin/dashboard';
import TransportationGuide from './views/living/transportation-guide';
import Error404Page from './views/error/error404-page';
import UniversityTemplate from './views/universities/university-template';
import Contact from './views/contact/contact';
import About from './views/about/about';
import HelpYouChoose from './views/help-you-choose-AI/help-you-choose-AI';
import Privacy from './views/privacy/privacy';
import Terms from './views/terms/terms';
import Cookies from './views/cookies/cookies';
import FAQ from './views/faq/faq';
import Success from './views/payment/Success';
import Cancel from './views/payment/Cancel';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <NavigationProvider>
          <div className="App">
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/sign-in" 
                element={
                  <ProtectedAuthRoute>
                    <SignIn />
                  </ProtectedAuthRoute>
                } 
              />
              <Route 
                path="/sign-up" 
                element={
                  <ProtectedAuthRoute>
                    <SignUp />
                  </ProtectedAuthRoute>
                } 
              />
              <Route path="/universities" element={<Universities />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/living-in-moldova" element={<LivingInMoldova />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/help-you-choose-AI" element={<HelpYouChoose />} />
              <Route path="/universities/:slug" element={<UniversityTemplate />} />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute requiredRole="user">
                    <Profile />
                  </PrivateRoute>
                } 
              />
              <Route path="/dashboard" element={<PrivateRoute requiredRole="admin"><Dashboard /></PrivateRoute>} />
              <Route path="/admin/*" element={<PrivateRoute requiredRole="admin"><Dashboard /></PrivateRoute>} />
              <Route path="/living-in-moldova/transportation-guide" element={<TransportationGuide />} />
              <Route path="/error404-page" element={<Error404Page />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/payment/success" element={<Success />} />
              <Route path="/payment/cancel" element={<Cancel />} />
              <Route path="*" element={<Error404Page />} />
            </Routes>
          </div>
        </NavigationProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
import React from 'react';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import './contact.css';

const Contact = () => {
  return (
    <div className="contact-page">
      <Navbar />
      <div className="contact-container">
        <div className="contact-info">
        <h1>Contact Us</h1>
          <div className="contact-card">
            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <div className="contact-details">
                <h3>Address</h3>
                <p>1 Student Street, Chisinau, Moldova</p>
              </div>
            </div>
            
            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <div className="contact-details">
                <h3>Phone</h3>
                <p>+373 22 123456</p>
              </div>
            </div>
            
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <div className="contact-details">
                <h3>Email</h3>
                <p>contact@studyinmoldova.md</p>
              </div>
            </div>
            
            <div className="contact-item">
              <i className="fas fa-clock"></i>
              <div className="contact-details">
                <h3>Working Hours</h3>
                <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
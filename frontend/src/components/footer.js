import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import './footer.css'

const Footer = () => {
  return (
    <footer className="footer-footer8 thq-section-padding">
      <div className="footer-max-width thq-section-max-width">
        <div className="footer-content">
          <div className="footer-column">
            <div className="footer-logo">
              <div className="footer-logo-container">
                <img src="/LogoStudyInMoldova.png" alt="Study In Moldova Logo" className="footer-logo-img" />
                <h2 className="footer-title">StudyInMoldova</h2>
              </div>
              <p className="footer-description">
                Your platform for university studies in the Republic of Moldova
              </p>
            </div>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noreferrer noopener" className="social-link">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer noopener" className="social-link">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer noopener" className="social-link">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>

          <div className="footer-links-section">
            <div className="footer-links-column">
              <h3>University</h3>
              <Link to="/universities" className="footer-link">Universities</Link>
              <Link to="/programs" className="footer-link">Study Programs</Link>
            </div>

            <div className="footer-links-column">
              <h3>Resources</h3>
              <Link to="/blog" className="footer-link">Blog</Link>
              <Link to="/faq" className="footer-link">FAQ</Link>
              <Link to="/documents" className="footer-link">Required Documents</Link>
              <Link to="/contact" className="footer-link">Contact</Link>
              <Link to="/about" className="footer-link">About Us</Link>
            </div>
          </div>

          <div className="footer-newsletter">
            <h3>Subscribe to our newsletter</h3>
            <p>Get the latest news about study programs and opportunities</p>
            <div className="footer-form">
              <input
                type="email"
                placeholder="Your email address"
                className="footer-text-input thq-input"
              />
              <button className="thq-button-filled footer-button">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="footer-credits">
          <div className="footer-row">
            <div className="footer-footer-links">
              <Link to="/privacy" className="footer-link">Privacy Policy</Link>
              <Link to="/terms" className="footer-link">Terms and Conditions</Link>
              <Link to="/cookies" className="footer-link">Cookie Policy</Link>
            </div>
            <span className="copyright">
              © {new Date().getFullYear()} StudyInMoldova. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

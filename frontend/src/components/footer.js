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
              <h2 className="footer-title">StudyInMoldova</h2>
              <p className="footer-description">
                Platforma ta pentru studii universitare în Republica Moldova
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
              <h3>Universitatea</h3>
              <Link to="/universities" className="footer-link">Universități</Link>
              <Link to="/programs" className="footer-link">Programe de studii</Link>
            </div>

            <div className="footer-links-column">
              <h3>Resurse</h3>
              <Link to="/blog" className="footer-link">Blog</Link>
              <Link to="/faq" className="footer-link">Întrebări frecvente</Link>
              <Link to="/documents" className="footer-link">Documente necesare</Link>
              <Link to="/contact" className="footer-link">Contact</Link>
            </div>
          </div>

          <div className="footer-newsletter">
            <h3>Abonează-te la newsletter</h3>
            <p>Primește ultimele noutăți despre programele de studii și oportunități</p>
            <div className="footer-form">
              <input
                type="email"
                placeholder="Adresa ta de email"
                className="footer-text-input thq-input"
              />
              <button className="thq-button-filled footer-button">
                Abonează-te
              </button>
            </div>
          </div>
        </div>

        <div className="footer-credits">
          <div className="thq-divider-horizontal"></div>
          <div className="footer-row">
            <div className="footer-footer-links">
              <Link to="/privacy" className="footer-link">Politica de confidențialitate</Link>
              <Link to="/terms" className="footer-link">Termeni și condiții</Link>
              <Link to="/cookies" className="footer-link">Politica de cookie-uri</Link>
            </div>
            <span className="copyright">
              © {new Date().getFullYear()} StudyInMoldova. Toate drepturile rezervate.
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

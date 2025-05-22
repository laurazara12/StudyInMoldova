import React from 'react'
import Navbar from '../../components/navbar'
import Footer from '../../components/footer'
import './privacy.css'

const Privacy = () => {
  return (
    <>
      <Navbar />
      <div className="privacy-container">
        <div className="privacy-content">
          <h1>Privacy Policy</h1>
          
          <section>
            <h2>1. General Information</h2>
            <p>
              StudyInMoldova ("we", "our", or "us") is committed to protecting the privacy of our platform users. 
              This privacy policy explains how we collect, use, and protect the personal information you provide to us.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul>
              <li>Personal identification information (name, email address, phone number)</li>
              <li>Education and study information</li>
              <li>Academic preferences and interests</li>
              <li>Platform usage data</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Information</h2>
            <p>We use the collected information for:</p>
            <ul>
              <li>Providing our educational services</li>
              <li>Personalizing user experience</li>
              <li>Communicating about relevant educational opportunities</li>
              <li>Improving our platform</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2>4. Data Protection</h2>
            <p>
              We implement technical and organizational security measures to protect your personal information against 
              unauthorized access, modification, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete personal data</li>
              <li>Restrict processing</li>
              <li>Data portability</li>
              <li>Object to processing</li>
            </ul>
          </section>

          <section>
            <h2>6. Cookies and Similar Technologies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience on our platform. 
              You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2>7. Privacy Policy Changes</h2>
            <p>
              We reserve the right to update this privacy policy periodically. We will notify you of any significant changes 
              through the platform or via email.
            </p>
          </section>

          <section>
            <h2>8. Contact</h2>
            <p>
              For questions or requests regarding this privacy policy, please contact us at:
              <br />
              Email: privacy@studyinmoldova.md
              <br />
              Phone: +373 XX XXX XXX
            </p>
          </section>

          <section className="last-updated">
            <p>Last updated: 05/21/2025</p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Privacy 
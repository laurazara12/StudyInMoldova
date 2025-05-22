import React from 'react'
import Navbar from '../../components/navbar'
import Footer from '../../components/footer'
import './terms.css'

const Terms = () => {
  return (
    <>
      <Navbar />
      <div className="terms-container">
        <div className="terms-content">
          <h1>Terms and Conditions</h1>
          
          <section>
            <h2>1. Accepting the Terms</h2>
            <p>
              By accessing and using the StudyInMoldova platform, you agree to be bound by these terms and conditions. 
              If you do not agree with any of these terms, please do not use our platform.
            </p>
          </section>

          <section>
            <h2>2. Service Description</h2>
            <p>
              StudyInMoldova provides an educational platform that facilitates the enrollment process and information about 
              study opportunities in the Republic of Moldova. Our services include:
            </p>
            <ul>
              <li>Information about universities and study programs</li>
              <li>Enrollment process assistance</li>
              <li>Educational resources and guides</li>
              <li>Community for students and applicants</li>
            </ul>
          </section>

          <section>
            <h2>3. User Obligations</h2>
            <p>As a user of the platform, you agree to:</p>
            <ul>
              <li>Provide accurate and complete information</li>
              <li>Maintain the confidentiality of your account</li>
              <li>Not use the platform for illegal or unauthorized purposes</li>
              <li>Not attempt to access restricted areas of the platform</li>
              <li>Not use the platform in a way that could damage our services</li>
            </ul>
          </section>

          <section>
            <h2>4. Intellectual Property</h2>
            <p>
              All materials, content, and design of the StudyInMoldova platform are protected by copyright laws and are 
              our property or that of our license providers. You do not have the right to:
            </p>
            <ul>
              <li>Reproduce, distribute, or modify the platform's content</li>
              <li>Use the StudyInMoldova brand without our written permission</li>
              <li>Remove or modify any copyright notices</li>
            </ul>
          </section>

          <section>
            <h2>5. Limitation of Liability</h2>
            <p>
              StudyInMoldova cannot be held liable for:
            </p>
            <ul>
              <li>The accuracy of information provided by universities or other third-party sources</li>
              <li>Admission decisions of educational institutions</li>
              <li>Any interruptions or errors in platform operation</li>
              <li>Losses or damages resulting from platform use</li>
            </ul>
          </section>

          <section>
            <h2>6. Terms Modifications</h2>
            <p>
              We reserve the right to modify these terms and conditions at any time. Changes will take effect 
              immediately after their publication on the platform. Continued use of the platform after changes 
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2>7. Applicable Law</h2>
            <p>
              These terms and conditions are governed and interpreted in accordance with the laws of the Republic of Moldova. 
              Any dispute will be subject to the exclusive jurisdiction of the courts of the Republic of Moldova.
            </p>
          </section>

          <section>
            <h2>8. Contact</h2>
            <p>
              For questions or clarifications regarding these terms and conditions, please contact us at:
              <br />
              Email: terms@studyinmoldova.md
              <br />
              Phone: +373 XX XXX XXX
            </p>
          </section>

          <section className="last-updated">
            <p>Last updated: {new Date().toLocaleDateString('en-US')}</p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Terms 
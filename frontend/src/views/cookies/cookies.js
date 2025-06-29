import React from 'react'
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import './cookies.css';

const Cookies = () => {
  return (
    <>
      <Navbar />
      <div className="cookies-container">
        <div className="cookies-content">
          <h1>Cookie Policy</h1>
          <section>
            <h2>What are cookies?</h2>
            <p>Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites functional or more efficient, as well as to provide information to website owners.</p>
          </section>

          <section>
            <h2>Types of cookies we use</h2>
            <h3>Essential cookies</h3>
            <p>These are necessary for the website to function and cannot be disabled in our systems. They are usually only set in response to actions you take that constitute a request for services, such as setting privacy preferences, logging in, or filling out forms.</p>

            <h3>Performance cookies</h3>
            <p>These allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular and see how visitors move around the site.</p>

            <h3>Functionality cookies</h3>
            <p>These enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.</p>

            <h3>Advertising cookies</h3>
            <p>These may be set through our site by our advertising partners. These companies may use them to build a profile of your interests and show you relevant advertisements on other sites.</p>
          </section>

          <section>
            <h2>How you can control cookies</h2>
            <p>You can set your browser to refuse cookies or to alert you when a site attempts to place a cookie on your device. However, if you choose to refuse cookies, you may not be able to use all the interactive features of our website.</p>
            <p>To manage your cookie preferences, please refer to your browser settings.</p>
          </section>

          <section>
            <h2>Cookie policy updates</h2>
            <p>We reserve the right to make changes to this cookie policy at any time. Any changes will be posted on this page, and if the changes are significant, we will provide you with a more prominent notice.</p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>If you have questions about the use of cookies on our website, please contact us at:</p>
            <ul>
              <li>Email: contact@studyinmoldova.md</li>
              <li>Phone: +373 22 123 456</li>
            </ul>
          </section>

          <div className="last-updated">
            Last updated: 05/21/2025
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cookies; 
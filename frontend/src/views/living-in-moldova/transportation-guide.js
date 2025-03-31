import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import './transportation-guide.css';

const TransportationGuide = () => {
  const headerStyle = {
    backgroundImage: `url('/images/Kišiněv,_letiště,_AKSM-321_(2019-03-17;_02).jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="transportation-guide-container">
      <Helmet>
        <title>Transportation Guide - Study In Moldova</title>
        <meta property="og:title" content="Transportation Guide - Study In Moldova" />
        <meta name="description" content="Complete guide to public transportation in Chișinău, Moldova. Learn about RTEC services, routes, fares, and tips for students." />
      </Helmet>
      <Navbar rootClassName="navbar-root-class-name" />
      <div className="transportation-guide-content">
        <div className="transportation-header" style={headerStyle}>
          <h1>Public Transportation Guide</h1>
          <p>Everything you need to know about getting around in Chișinău</p>
        </div>

        <div className="transportation-sections">
          <section className="transportation-section">
            <h2>RTEC (Regia Transport Electric Chișinău)</h2>
            <div className="section-content">
              <div className="info-card">
                <h3>Types of Transport</h3>
                <ul>
                  <li><strong>Trolleybuses (Troleibuze)</strong> - Electric-powered buses connected to overhead wires</li>
                  <li><strong>Buses (Autobuze)</strong> - Regular diesel-powered buses</li>
                  <li><strong>Minibuses (Rutiera)</strong> - Private minibuses operating on fixed routes</li>
                </ul>
                <div className="card-tip">
                  <span className="tip-icon">💡</span>
                  <p>Minibuses are the most flexible but can be crowded during peak hours</p>
                </div>
              </div>

              <div className="info-card">
                <h3>Payment Methods</h3>
                <ul>
                  <li><strong>Contactless Card</strong> - Tap your card on the validator</li>
                  <li><strong>Mobile App</strong> - Scan QR code or use NFC</li>
                  <li><strong>Cash</strong> - Available on all types of transport (exact change recommended)</li>
                </ul>
                <div className="card-tip">
                  <span className="tip-icon">💳</span>
                  <p>Get your contactless card at any RTEC office or authorized vendor for easier payments</p>
                </div>
              </div>

              <div className="info-card">
                <h3>Fares</h3>
                <ul>
                  <li><strong>Regular fare:</strong> 6 MDL</li>
                  <li><strong>Student fare:</strong> 3 MDL (with valid student ID)</li>
                  <li><strong>Monthly pass:</strong> Check current rates on <a href="https://www.rtec.md" target="_blank" rel="noopener noreferrer">RTEC website</a></li>
                </ul>
                <div className="card-tip">
                  <span className="tip-icon">🎓</span>
                  <p>Always carry your student ID to get the discounted fare</p>
                </div>
              </div>

              <div className="info-card">
                <h3>Intercity Transport</h3>
                <ul>
                  <li><strong>Bus Stations:</strong> Purchase tickets at the bus station</li>
                  <li><strong>Routes:</strong> Available to major cities like Bălți, Cahul, and Comrat</li>
                  <li><strong>Schedule:</strong> Check timetables at the bus station</li>
                  <li><strong>Fares:</strong> Vary by destination, check at the station</li>
                </ul>
                <div className="card-tip">
                  <span className="tip-icon">🚌</span>
                  <p>For intercity travel, arrive early to secure your ticket</p>
                </div>
              </div>
            </div>
          </section>

          <section className="transportation-section">
            <h2>How to Use Public Transport</h2>
            <div className="section-content">
              <div className="info-card">
                <h3>Getting Started</h3>
                <ol>
                  <li>Download the RTEC mobile app from App Store or Google Play</li>
                  <li>Register your contactless card in the app</li>
                  <li>Check routes and schedules using the app's map feature</li>
                  <li>Purchase tickets or monthly pass through the app</li>
                </ol>
                <div className="card-tip">
                  <span className="tip-icon">📱</span>
                  <p>The RTEC app is available in Romanian, Russian, and English</p>
                </div>
              </div>

              <div className="info-card">
                <h3>Using the App</h3>
                <ul>
                  <li><strong>Real-time Tracking:</strong> See bus locations and estimated arrival times</li>
                  <li><strong>Route Planning:</strong> Enter your destination for suggested routes</li>
                  <li><strong>Ticket Purchase:</strong> Buy tickets directly from your phone</li>
                  <li><strong>Balance Check:</strong> Monitor your card balance and transaction history</li>
                  <li><strong>Notifications:</strong> Get alerts for nearby buses and route changes</li>
                </ul>
              </div>

              <div className="info-card">
                <h3>Tips for Students</h3>
                <ul>
                  <li>Always validate your ticket when boarding</li>
                  <li>Keep your student ID ready for inspection</li>
                  <li>Plan your route in advance using the app</li>
                  <li>Check schedules for early morning/late night trips</li>
                  <li>Consider getting a monthly pass for regular travel</li>
                  <li>Be aware of peak hours (7:00-9:00 and 17:00-19:00)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="transportation-section">
            <h2>Popular Routes</h2>
            <div className="section-content">
              <div className="info-card">
                <h3>University Routes</h3>
                <ul>
                  <li><strong>USM (State University):</strong>
                    <ul>
                      <li>Trolleybus 17 (from Central Market)</li>
                      <li>Bus 5 (from Railway Station)</li>
                      <li>Minibus 165 (from Botanica)</li>
                    </ul>
                  </li>
                  <li><strong>UTM (Technical University):</strong>
                    <ul>
                      <li>Trolleybus 3 (from Center)</li>
                      <li>Bus 30 (from Railway Station)</li>
                      <li>Minibus 173 (from Râșcani)</li>
                    </ul>
                  </li>
                  <li><strong>ULIM (Free International University):</strong>
                    <ul>
                      <li>Trolleybus 8 (from Center)</li>
                      <li>Bus 22 (from Railway Station)</li>
                      <li>Minibus 191 (from Botanica)</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div className="info-card">
                <h3>City Center Routes</h3>
                <ul>
                  <li><strong>MallDova:</strong>
                    <ul>
                      <li>Trolleybus 1, 2, 3</li>
                      <li>Bus 1, 2, 5</li>
                      <li>Minibus 165, 173, 191</li>
                    </ul>
                  </li>
                  <li><strong>Central Market:</strong>
                    <ul>
                      <li>Trolleybus 2, 17</li>
                      <li>Bus 2, 5</li>
                      <li>Minibus 165, 173</li>
                    </ul>
                  </li>
                  <li><strong>Railway Station:</strong>
                    <ul>
                      <li>Trolleybus 5, 8</li>
                      <li>Bus 5, 22, 30</li>
                      <li>Minibus 165, 173, 191</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="transportation-section">
            <h2>Useful Information</h2>
            <div className="section-content">
              <div className="info-card">
                <h3>Operating Hours</h3>
                <ul>
                  <li><strong>Regular service:</strong> 5:30 - 23:00</li>
                  <li><strong>Weekend schedule:</strong> Slightly reduced frequency</li>
                  <li><strong>Holidays:</strong> Special schedule (check app for updates)</li>
                  <li><strong>Night service:</strong> No public transportation available after 23:00</li>
                </ul>
                <div className="card-tip">
                  <span className="tip-icon">🌙</span>
                  <p>Plan your late-night trips in advance as there is no public transportation after 23:00</p>
                </div>
              </div>

              <div className="info-card">
                <h3>Contact Information</h3>
                <ul>
                  <li><strong>RTEC Call Center:</strong> +373 22 22 22 22</li>
                  <li><strong>Emergency:</strong> +373 22 22 22 23</li>
                  <li><strong>Website:</strong> <a href="https://www.rtec.md" target="_blank" rel="noopener noreferrer">www.rtec.md</a></li>
                  <li><strong>Email:</strong> info@rtec.md</li>
                </ul>
                <div className="card-tip">
                  <span className="tip-icon">📞</span>
                  <p>Call center is available 24/7 for assistance</p>
                </div>
              </div>

              <div className="info-card">
                <h3>Important Tips</h3>
                <ul>
                  <li>Keep your ticket until you exit the vehicle</li>
                  <li>Be prepared to show your student ID to inspectors</li>
                  <li>Check the app for real-time updates and delays</li>
                  <li>Consider alternative routes during peak hours</li>
                  <li>Report any issues through the app or call center</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="transportation-actions">
          <Link to="/living-in-moldova" className="back-button">
            Back to Living in Moldova
          </Link>
          <a href="https://www.rtec.md" target="_blank" rel="noopener noreferrer" className="rtec-button">
            Visit RTEC Website
          </a>
        </div>
      </div>
      <Footer rootClassName="footer-root-class-name" />
    </div>
  );
};

export default TransportationGuide; 
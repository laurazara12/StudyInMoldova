import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import './overview.css';

const LivingInMoldova = () => {
  return (
    <div className="living-in-moldova-container">
      <Helmet>
        <title>Living in Moldova - Study In Moldova</title>
        <meta property="og:title" content="Living in Moldova - Study In Moldova" />
      </Helmet>
      <Navbar rootClassName="navbar-root-class-name" />
      <div className="living-in-moldova-header">
        <div className="living-in-moldova-header-content">
          <h1>Living in Moldova</h1>
          <p>Discover the charm of student life in Moldova - from affordable living to rich cultural experiences</p>
        </div>
      </div>
      <div className="living-in-moldova-content">
        <div className="living-in-moldova-grid">
          <div className="living-in-moldova-card">
            <h2 className="living-in-moldova-card-title">Currency & Cost of Living</h2>
            <div className="living-in-moldova-card-content">
              <span>About Moldovan Currency:</span>
              <span>• Official currency: Moldovan Leu (MDL)</span>
              <span>• Current exchange rates (approximate):</span>
              <span>  - 1 EUR ≈ 19.5 MDL</span>
              <span>  - 1 USD ≈ 17.8 MDL</span>
              <span>  - 1 GBP ≈ 22.5 MDL</span>
              <span>Monthly Budget Breakdown (in EUR):</span>
              <span>• A place to stay: around €150-€300</span>
              <span>• Food and groceries: about €200-€300</span>
              <span>• Getting around: roughly €20-€30</span>
              <span>• Utilities (water, electricity): around €50-€80</span>
              <span>• Fun and entertainment: about €50-€100</span>
              <div className="living-in-moldova-tip">
                💡 Total monthly budget: approximately €500-€800 (this is just a guide - your actual costs may vary)
              </div>
              <div className="living-in-moldova-links">
                <Link to="/universities" className="living-in-moldova-link">Check University Costs →</Link>
                <Link to="/programs" className="living-in-moldova-link">Explore Program Fees →</Link>
              </div>
            </div>
          </div>

          <div className="living-in-moldova-card">
            <h2 className="living-in-moldova-card-title">Accommodation</h2>
            <div className="living-in-moldova-card-content">
              <span>You have several options for where to live:</span>
              <span>• Student dorms: around €50-€100/month (most budget-friendly)</span>
              <span>• Private apartments: about €200-€400/month (more privacy)</span>
              <span>• Shared apartments: roughly €150-€250/month (good balance)</span>
              <span>Popular areas for students:</span>
              <span>• Centru (city center) - Close to everything, including universities</span>
              <span>• Botanica - Quiet and peaceful, great for studying</span>
              <span>• Râșcani - Budget-friendly and well-connected by public transport</span>
              <div className="living-in-moldova-tip">
                🏠 Pro tip: Start with university accommodation - it's easier to find private housing once you're here and know the city better
              </div>
              <div className="living-in-moldova-links">
                <Link to="/universities/usm-university-individual-page" className="living-in-moldova-link">USM Student Housing Info →</Link>
                <Link to="/universities/utm-university-individual-page" className="living-in-moldova-link">UTM Student Housing Info →</Link>
              </div>
            </div>
          </div>

          <div className="living-in-moldova-card">
            <h2 className="living-in-moldova-card-title">Transportation</h2>
            <div className="living-in-moldova-card-content">
              <span>Getting around is easy and affordable:</span>
              <span>• Bus rides: about €0.30 each</span>
              <span>• Trolleybus: around €0.30 per ride</span>
              <span>• Monthly pass: roughly €10-€15 (best value)</span>
              <span>• Taxi rides: starting from €1.50</span>
              <span>Handy apps to download:</span>
              <span>• Yandex.Taxi - The most popular taxi app here</span>
              <span>• Uber - Also available in Chișinău</span>
              <span>• Google Maps - Great for planning your routes</span>
              <div className="living-in-moldova-tip">
                🚌 Good news: Students get special discounts on monthly passes!
              </div>
              <div className="living-in-moldova-links">
                <Link to="/living-in-moldova/transportation-guide" className="living-in-moldova-link">Chișinău Transport Guide →</Link>
              </div>
            </div>
          </div>

          <div className="living-in-moldova-card">
            <h2 className="living-in-moldova-card-title">Food & Dining</h2>
            <div className="living-in-moldova-card-content">
              <span>Try these local favorites:</span>
              <span>• Mămăligă (cornmeal porridge) - A traditional staple</span>
              <span>• Plăcinte (savory pastries) - Perfect for quick meals</span>
              <span>• Sarmale (stuffed cabbage rolls) - A must-try!</span>
              <span>• Zeamă (chicken soup) - Great for cold days</span>
              <span>Budget-friendly options:</span>
              <span>• Student cafeterias: around €2-€4 per meal</span>
              <span>• Local restaurants: about €5-€10 per meal</span>
              <span>• Weekly groceries: roughly €30-€50</span>
              <div className="living-in-moldova-tip">
                🛒 Shopping tip: Look for student discounts at supermarkets like Linella, Nr. 1, and Kaufland
              </div>
              <div className="living-in-moldova-links">
                <a href="https://www.moldova.travel/en/things-to-do/food-and-drink" target="_blank" rel="noopener noreferrer" className="living-in-moldova-link">Discover Moldovan Cuisine →</a>
              </div>
            </div>
          </div>

          <div className="living-in-moldova-card">
            <h2 className="living-in-moldova-card-title">Healthcare & Insurance</h2>
            <div className="living-in-moldova-card-content">
              <span>Important things to know:</span>
              <span>• Health insurance is required for all students</span>
              <span>• Insurance costs: around €50-€150 per year</span>
              <span>• Most medical services are covered</span>
              <span>Where to get help:</span>
              <span>• Your university's medical center</span>
              <span>• Public hospitals in the city</span>
              <span>• Private clinics (if needed)</span>
              <div className="living-in-moldova-tip">
                🏥 Remember: Always keep your insurance card with you - you never know when you might need it
              </div>
              <div className="living-in-moldova-links">
                <Link to="/contact" className="living-in-moldova-link">Get Help with Insurance →</Link>
              </div>
            </div>
          </div>

          <div className="living-in-moldova-card">
            <h2 className="living-in-moldova-card-title">Culture & Language</h2>
            <div className="living-in-moldova-card-content">
              <span>Languages you'll hear:</span>
              <span>• Romanian is the official language</span>
              <span>• Russian is widely spoken</span>
              <span>• English is common in academic settings</span>
              <span>Fun cultural experiences:</span>
              <span>• Wine festivals (especially in September)</span>
              <span>• Traditional music events</span>
              <span>• Local markets - great for fresh produce</span>
              <div className="living-in-moldova-tip">
                🌍 Pro tip: Learning a few basic Romanian phrases will make your daily life much easier!
              </div>
              <div className="living-in-moldova-links">
                <Link to="/programs" className="living-in-moldova-link">Find Language Courses →</Link>
                <a href="https://www.moldova.travel/en/things-to-do/culture" target="_blank" rel="noopener noreferrer" className="living-in-moldova-link">Explore Cultural Events →</a>
              </div>
            </div>
          </div>
        </div>

        <div className="living-in-moldova-contact">
          <h2 className="living-in-moldova-contact-title">Need More Information?</h2>
          <p className="living-in-moldova-contact-text">
            Have questions about life in Moldova? We're here to help! Whether you need advice about accommodation, transportation, or daily life, our team is ready to assist you. We can also help with university applications and visa requirements.
          </p>
          <div className="living-in-moldova-contact-links">
            <Link to="/contact" className="living-in-moldova-contact-button">
              Get in Touch
            </Link>
            <Link to="/about" className="living-in-moldova-contact-button">
              Plan Your Studies
            </Link>
          </div>
        </div>
      </div>
      <Footer rootClassName="footer-root-class-name" />
    </div>
  );
};

export default LivingInMoldova;

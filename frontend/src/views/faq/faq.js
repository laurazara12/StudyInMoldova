import React, { useState } from 'react';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import './faq.css';

const FAQ = () => {
  const [openQuestions, setOpenQuestions] = useState({});

  const toggleQuestion = (index) => {
    setOpenQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <>
      <Navbar />
      <div className="faq-container">
        <div className="faq-content">
          <h1>Frequently Asked Questions</h1>

          <section>
            <h2>About Studying in Moldova</h2>
            
            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('studies1')}
              >
                <h3>What are the advantages of studying in the Republic of Moldova?</h3>
                <span className={`faq-icon ${openQuestions['studies1'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['studies1'] ? 'open' : ''}`}>
                <p>Studying in Moldova offers several advantages:</p>
                <ul>
                  <li>High-quality education at affordable costs</li>
                  <li>Recognized international study programs</li>
                  <li>Multicultural and friendly environment</li>
                  <li>Lower living costs compared to most European countries</li>
                  <li>Personal and professional development opportunities</li>
                </ul>
              </div>
            </div>

            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('studies2')}
              >
                <h3>What are the teaching languages in Moldovan universities?</h3>
                <span className={`faq-icon ${openQuestions['studies2'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['studies2'] ? 'open' : ''}`}>
                <p>Most programs are taught in Romanian, but there are also programs in Russian and English. For programs in Romanian, international students can benefit from a preparatory language year.</p>
              </div>
            </div>

            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('studies3')}
              >
                <h3>How much does it cost to study in Moldova?</h3>
                <span className={`faq-icon ${openQuestions['studies3'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['studies3'] ? 'open' : ''}`}>
                <p>Tuition fees vary depending on the university and program, but they are generally more affordable than in most European countries. Average costs are between 2000-4000 EUR per year for bachelor's programs.</p>
              </div>
            </div>
          </section>

          <section>
            <h2>Enrollment Process</h2>

            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('enrollment1')}
              >
                <h3>What documents are required for enrollment?</h3>
                <span className={`faq-icon ${openQuestions['enrollment1'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['enrollment1'] ? 'open' : ''}`}>
                <p>Required documents include:</p>
                <ul>
                  <li>High school diploma (or equivalent)</li>
                  <li>Academic transcript</li>
                  <li>Valid ID</li>
                  <li>Nationality certificate</li>
                  <li>Photographs</li>
                  <li>Completed application form</li>
                </ul>
              </div>
            </div>

            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('enrollment2')}
              >
                <h3>When does the enrollment period begin?</h3>
                <span className={`faq-icon ${openQuestions['enrollment2'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['enrollment2'] ? 'open' : ''}`}>
                <p>The enrollment period for the academic year usually starts in July and ends at the end of August. For programs starting in the spring semester, enrollments are open in January-February.</p>
              </div>
            </div>

            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('enrollment3')}
              >
                <h3>Are there entrance exams?</h3>
                <span className={`faq-icon ${openQuestions['enrollment3'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['enrollment3'] ? 'open' : ''}`}>
                <p>Most programs do not require entrance exams, but some faculties may organize tests or interviews for specific programs. Check the specific requirements for your desired program.</p>
              </div>
            </div>
          </section>

          <section>
            <h2>Student Life</h2>

            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('life1')}
              >
                <h3>Is there student accommodation available?</h3>
                <span className={`faq-icon ${openQuestions['life1'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['life1'] ? 'open' : ''}`}>
                <p>Yes, most universities offer accommodation in student dormitories. Costs range from 30-50 EUR per month. There are also options for private apartments or homestays.</p>
              </div>
            </div>

            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('life2')}
              >
                <h3>Can I work while studying?</h3>
                <span className={`faq-icon ${openQuestions['life2'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['life2'] ? 'open' : ''}`}>
                <p>Yes, international students can work while studying, but they must comply with visa and work permit regulations. It is recommended to focus on studies during the first year.</p>
              </div>
            </div>

            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('life3')}
              >
                <h3>Are there exchange programs or scholarships available?</h3>
                <span className={`faq-icon ${openQuestions['life3'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['life3'] ? 'open' : ''}`}>
                <p>Yes, there are several exchange programs and scholarships available for international students, including Erasmus+ programs and scholarships offered by the Moldovan government.</p>
              </div>
            </div>
          </section>

          <section>
            <h2>Visas and Permits</h2>

            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('visa1')}
              >
                <h3>What type of visa do I need to study in Moldova?</h3>
                <span className={`faq-icon ${openQuestions['visa1'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['visa1'] ? 'open' : ''}`}>
                <p>Students from non-EU countries require a study visa (type D). The visa application process begins after receiving the acceptance letter from the university.</p>
              </div>
            </div>

            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('visa2')}
              >
                <h3>How long does the visa process take?</h3>
                <span className={`faq-icon ${openQuestions['visa2'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['visa2'] ? 'open' : ''}`}>
                <p>The study visa application process usually takes 2-4 weeks. It is recommended to start the process at least 2-3 months before the beginning of the academic year.</p>
              </div>
            </div>
          </section>

          <div className="last-updated">
            Last updated: 21.05.2025
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FAQ; 
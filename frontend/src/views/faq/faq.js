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
          <h1>Întrebări Frecvente</h1>

          <section>
            <h2>Despre Studii în Moldova</h2>
            
            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('studies1')}
              >
                <h3>Care sunt avantajele studiilor în Republica Moldova?</h3>
                <span className={`faq-icon ${openQuestions['studies1'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['studies1'] ? 'open' : ''}`}>
                <p>Studiile în Moldova oferă mai multe avantaje:</p>
                <ul>
                  <li>Educație de calitate la costuri accesibile</li>
                  <li>Programe de studii recunoscute internațional</li>
                  <li>Mediu multicultural și prietenos</li>
                  <li>Costuri de trai reduse comparativ cu alte țări europene</li>
                  <li>Oportunități de dezvoltare personală și profesională</li>
                </ul>
              </div>
            </div>

            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('studies2')}
              >
                <h3>Care sunt limbile de predare în universitățile din Moldova?</h3>
                <span className={`faq-icon ${openQuestions['studies2'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['studies2'] ? 'open' : ''}`}>
                <p>Majoritatea programelor sunt predate în limba română, dar există și programe în limba rusă și engleză. Pentru programele în limba română, studenții străini pot beneficia de un an pregătitor de limbă.</p>
              </div>
            </div>

            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('studies3')}
              >
                <h3>Cât costă studiile în Moldova?</h3>
                <span className={`faq-icon ${openQuestions['studies3'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['studies3'] ? 'open' : ''}`}>
                <p>Taxele de studii variază în funcție de universitate și program, dar în general sunt mai accesibile decât în majoritatea țărilor europene. Costurile medii sunt între 2000-4000 EUR pe an pentru programele de licență.</p>
              </div>
            </div>
          </section>

          <section>
            <h2>Procesul de Înscriere</h2>

            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('enrollment1')}
              >
                <h3>Ce documente sunt necesare pentru înscriere?</h3>
                <span className={`faq-icon ${openQuestions['enrollment1'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['enrollment1'] ? 'open' : ''}`}>
                <p>Documentele necesare includ:</p>
                <ul>
                  <li>Diploma de bacalaureat (sau echivalent)</li>
                  <li>Certificatul de studii</li>
                  <li>Act de identitate valabil</li>
                  <li>Certificat de naționalitate</li>
                  <li>Fotografii</li>
                  <li>Formular de cerere completat</li>
                </ul>
              </div>
            </div>

            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('enrollment2')}
              >
                <h3>Când începe perioada de înscriere?</h3>
                <span className={`faq-icon ${openQuestions['enrollment2'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['enrollment2'] ? 'open' : ''}`}>
                <p>Perioada de înscriere pentru anul universitar începe de obicei în luna iulie și se termină la sfârșitul lunii august. Pentru programele cu începere în semestrul de primăvară, înscrierile sunt deschise în ianuarie-februarie.</p>
              </div>
            </div>

            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('enrollment3')}
              >
                <h3>Există examene de admitere?</h3>
                <span className={`faq-icon ${openQuestions['enrollment3'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['enrollment3'] ? 'open' : ''}`}>
                <p>Majoritatea programelor nu necesită examene de admitere, dar unele facultăți pot organiza teste sau interviuri pentru programele specifice. Verificați cerințele specifice pentru programul dorit.</p>
              </div>
            </div>
          </section>

          <section>
            <h2>Viața de Student</h2>

            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('life1')}
              >
                <h3>Există cazare pentru studenți?</h3>
                <span className={`faq-icon ${openQuestions['life1'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['life1'] ? 'open' : ''}`}>
                <p>Da, majoritatea universităților oferă cazare în căminele studențești. Costurile variază între 30-50 EUR pe lună. Există și opțiuni de cazare în apartamente private sau în familie.</p>
              </div>
            </div>

            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('life2')}
              >
                <h3>Pot lucra în timpul studiilor?</h3>
                <span className={`faq-icon ${openQuestions['life2'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['life2'] ? 'open' : ''}`}>
                <p>Da, studenții străini pot lucra în timpul studiilor, dar trebuie să respecte regulile legate de vize și permise de muncă. Este recomandat să se concentreze pe studii în primul an.</p>
              </div>
            </div>

            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('life3')}
              >
                <h3>Există programe de schimb sau burse?</h3>
                <span className={`faq-icon ${openQuestions['life3'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['life3'] ? 'open' : ''}`}>
                <p>Da, există mai multe programe de schimb și burse disponibile pentru studenții internaționali, inclusiv programele Erasmus+ și burse oferite de guvernul moldovean.</p>
              </div>
            </div>
          </section>

          <section>
            <h2>Vize și Permise</h2>

            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('visa1')}
              >
                <h3>Ce tip de viză am nevoie pentru studii în Moldova?</h3>
                <span className={`faq-icon ${openQuestions['visa1'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['visa1'] ? 'open' : ''}`}>
                <p>Studenții din țările non-UE necesită o viză de studii (tip D). Procesul de obținere a vizei începe după primirea scrisorii de acceptare de la universitate.</p>
              </div>
            </div>

            <div className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleQuestion('visa2')}
              >
                <h3>Cât durează procesul de obținere a vizei?</h3>
                <span className={`faq-icon ${openQuestions['visa2'] ? 'open' : ''}`}>+</span>
              </div>
              <div className={`faq-answer ${openQuestions['visa2'] ? 'open' : ''}`}>
                <p>Procesul de obținere a vizei de studii durează de obicei 2-4 săptămâni. Este recomandat să începeți procesul cu cel puțin 2-3 luni înainte de începerea anului universitar.</p>
              </div>
            </div>
          </section>

          <div className="last-updated">
            Ultima actualizare: 21.05.2025
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FAQ; 
import React from 'react'
import UniversityTemplate from '../university-template'
import './usm-university-individual-page.css'

const USMUniversityIndividualPage = () => {
  const customSections = [
    <div key="usm-about" className="usm-section usm-about">
      <h2>Despre Universitate</h2>
      <div className="about-content">
        <div className="about-text">
          <p>Fondată la 1 octombrie 1946, USM este prima instituție de învățământ superior cu statut de universitate din Republica Moldova. Inițial, a funcționat cu 320 de studenți și 35 de cadre didactice în 5 facultăți.</p>
          <p>În prezent, USM are aproximativ 11.000 de studenți și oferă peste 100 de programe de studii de licență și masterat, în cadrul a 11 facultăți și 4 școli doctorale.</p>
          <p>Universitatea este recunoscută pentru promovarea libertății academice, pluralismului de opinii și calității în pregătirea specialiștilor de înaltă calificare.</p>
        </div>
        <div className="about-stats">
          <div className="stat-item">
            <span className="stat-number">11.000+</span>
            <span className="stat-label">Studenți</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100+</span>
            <span className="stat-label">Programe de studii</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">11</span>
            <span className="stat-label">Facultăți</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">4</span>
            <span className="stat-label">Școli doctorale</span>
          </div>
        </div>
      </div>
    </div>,
    <div key="usm-faculties" className="usm-section usm-faculties">
      <h2>Facultăți</h2>
      <div className="faculties-grid">
        <div className="faculty-card">Facultatea de Biologie și Geoștiințe</div>
        <div className="faculty-card">Facultatea de Chimie și Tehnologie Chimică</div>
        <div className="faculty-card">Facultatea de Drept</div>
        <div className="faculty-card">Facultatea de Jurnalism și Științe ale Comunicării</div>
        <div className="faculty-card">Facultatea de Fizică și Inginerie</div>
        <div className="faculty-card">Facultatea de Istorie și Filosofie</div>
        <div className="faculty-card">Facultatea de Matematică și Informatică</div>
        <div className="faculty-card">Facultatea de Litere</div>
        <div className="faculty-card">Facultatea de Științe Economice</div>
        <div className="faculty-card">Facultatea de Psihologie, Științe ale Educației, Sociologie și Asistență Socială</div>
        <div className="faculty-card">Facultatea de Relații Internaționale, Științe Politice și Administrative</div>
      </div>
    </div>,
    <div key="usm-mission" className="usm-section usm-mission">
      <h2>Misiune și Obiective</h2>
      <div className="mission-grid">
        <div className="mission-card">
          <h3>Formarea cadrelor</h3>
          <p>Formarea cadrelor de înaltă calificare pentru economia națională, capabile să activeze în condițiile în schimbare ale vieții și economiei de piață.</p>
        </div>
        <div className="mission-card">
          <h3>Cercetare științifică</h3>
          <p>Organizarea și desfășurarea de cercetări științifice fundamentale și aplicative, orientate spre soluționarea problemelor actuale socio-economice.</p>
        </div>
        <div className="mission-card">
          <h3>Valori și dezvoltare</h3>
          <p>Promovarea valorilor generale umane și naționale, formarea profilului etic și civic al tineretului studios.</p>
        </div>
        <div className="mission-card">
          <h3>Calitate și integrare</h3>
          <p>Asigurarea calității învățământului superior și integrarea în spațiul european al învățământului superior și de cercetare.</p>
        </div>
      </div>
    </div>,
    <div key="usm-cooperation" className="usm-section usm-cooperation">
      <h2>Cooperare Internațională</h2>
      <div className="cooperation-grid">
        <div className="cooperation-card">
          <h3>Asociația Internațională a Universităților (IAU)</h3>
          <p>Membră activă din 1992</p>
        </div>
        <div className="cooperation-card">
          <h3>Agenția Universitară a Francofoniei (AUF)</h3>
          <p>Colaborare în proiecte educaționale</p>
        </div>
        <div className="cooperation-card">
          <h3>Asociația Euroasiatică a Universităților (AEU)</h3>
          <p>Schimburi academice și cercetare</p>
        </div>
        <div className="cooperation-card">
          <h3>Consorțiul CUMRU</h3>
          <p>Cooperare regională cu universități din România și Ucraina</p>
        </div>
        <div className="cooperation-card">
          <h3>Consorțiul Universitaria</h3>
          <p>Membră din 2018</p>
        </div>
      </div>
    </div>,
    <div key="usm-achievements" className="usm-section usm-achievements">
      <h2>Recunoaștere și Premii</h2>
      <div className="achievements-timeline">
        <div className="achievement-item">
          <span className="year">2001</span>
          <p>Prima instituție de învățământ superior acreditată la nivel național</p>
        </div>
        <div className="achievement-item">
          <span className="year">2011</span>
          <p>Decorată cu "Ordinul Republicii" pentru merite deosebite</p>
        </div>
        <div className="achievement-item">
          <span className="year">2013</span>
          <p>Clasare constantă pe primul loc în topul universităților din Republica Moldova</p>
        </div>
      </div>
    </div>,
    <div key="usm-facilities" className="usm-section usm-facilities">
      <h2>Facilități</h2>
      <div className="facilities-grid">
        <div className="facility-card">
          <span className="facility-icon">🏛️</span>
          <h3>6 blocuri de învățământ</h3>
        </div>
        <div className="facility-card">
          <span className="facility-icon">🏠</span>
          <h3>10 cămine studențești</h3>
        </div>
        <div className="facility-card">
          <span className="facility-icon">📚</span>
          <h3>Bibliotecă universitară</h3>
        </div>
        <div className="facility-card">
          <span className="facility-icon">🏋️</span>
          <h3>Palat al Sporturilor</h3>
        </div>
        <div className="facility-card">
          <span className="facility-icon">🎭</span>
          <h3>Casă de Cultură</h3>
        </div>
        <div className="facility-card">
          <span className="facility-icon">🍽️</span>
          <h3>Cantine</h3>
        </div>
        <div className="facility-card">
          <span className="facility-icon">🏕️</span>
          <h3>Baze de practică și agrement</h3>
        </div>
      </div>
    </div>
  ];

  return (
    <UniversityTemplate
      customSections={customSections}
      beforeHero={
        <div className="usm-contact-info">
          <div className="contact-item">
            <span className="icon">📍</span>
            <p>Str. Alexei Mateevici 60, Chișinău, MD-2009</p>
          </div>
          <div className="contact-item">
            <span className="icon">📞</span>
            <p>+373 22 244 810</p>
          </div>
          <div className="contact-item">
            <span className="icon">✉️</span>
            <a href="mailto:rector@usm.md">rector@usm.md</a>
          </div>
          <div className="contact-item">
            <span className="icon">🌐</span>
            <a href="https://usm.md" target="_blank" rel="noopener noreferrer">usm.md</a>
          </div>
          <div className="contact-item">
            <span className="icon">📱</span>
            <a href="https://facebook.com/usm.md" target="_blank" rel="noopener noreferrer">facebook.com/usm.md</a>
          </div>
        </div>
      }
      afterHero={
        <div className="usm-announcement">
          Programe de schimb internațional disponibile pentru anul academic 2024-2025
        </div>
      }
      afterPrograms={
        <div className="usm-special-programs">
          <h3>Programe speciale de studii în limba engleză</h3>
          <p>Descoperă oportunitățile de studiu în limba engleză la USM</p>
        </div>
      }
    />
  );
};

export default USMUniversityIndividualPage;

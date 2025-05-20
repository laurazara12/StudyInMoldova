import React from 'react';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import './cookies.css';

const Cookies = () => {
  return (
    <>
      <Navbar />
      <div className="cookies-container">
        <div className="cookies-content">
          <h1>Politica de Cookie-uri</h1>

          <section>
            <h2>Ce sunt cookie-urile?</h2>
            <p>Cookie-urile sunt fișiere text de mici dimensiuni care sunt stocate pe dispozitivul dumneavoastră atunci când vizitați un site web. Acestea sunt utilizate pe scară largă pentru a face site-urile funcționale sau mai eficiente, precum și pentru a furniza informații proprietarilor site-ului.</p>
          </section>

          <section>
            <h2>Tipuri de cookie-uri pe care le utilizăm</h2>
            <h3>Cookie-uri esențiale</h3>
            <p>Acestea sunt necesare pentru funcționarea site-ului și nu pot fi dezactivate în sistemele noastre. De obicei, sunt setate doar ca răspuns la acțiunile pe care le faceți care constituie o cerere de servicii, cum ar fi setarea preferințelor de confidențialitate, conectarea sau completarea formularelor.</p>

            <h3>Cookie-uri de performanță</h3>
            <p>Acestea ne permit să numărăm vizitele și sursele de trafic, astfel încât să putem măsura și îmbunătăți performanța site-ului nostru. Ne ajută să știm care pagini sunt cele mai populare și mai puțin populare și să vedem cum vizitatorii navighează pe site.</p>

            <h3>Cookie-uri de funcționalitate</h3>
            <p>Acestea permit site-ului să ofere o funcționalitate și personalizare îmbunătățită. Ele pot fi setate de noi sau de furnizorii terți ai serviciilor pe care le-am adăugat paginilor noastre.</p>

            <h3>Cookie-uri de publicitate</h3>
            <p>Acestea pot fi setate prin site-ul nostru de către partenerii noștri de publicitate. Aceste companii le pot folosi pentru a construi un profil al intereselor dumneavoastră și pentru a vă arăta reclame relevante pe alte site-uri.</p>
          </section>

          <section>
            <h2>Cum puteți controla cookie-urile</h2>
            <p>Puteți seta browserul dumneavoastră să refuze cookie-urile sau să vă avertizeze când un site încearcă să plaseze un cookie pe dispozitivul dumneavoastră. Totuși, dacă alegeți să refuzați cookie-urile, este posibil să nu puteți utiliza toate funcționalitățile interactive ale site-ului nostru.</p>
            <p>Pentru a gestiona preferințele dumneavoastră privind cookie-urile, vă rugăm să consultați setările browserului dumneavoastră.</p>
          </section>

          <section>
            <h2>Actualizări ale politicii de cookie-uri</h2>
            <p>Ne rezervăm dreptul de a face modificări la această politică de cookie-uri în orice moment. Orice modificări vor fi publicate pe această pagină și, dacă modificările sunt semnificative, vă vom oferi un aviz mai vizibil.</p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>Dacă aveți întrebări despre utilizarea cookie-urilor pe site-ul nostru, vă rugăm să ne contactați la:</p>
            <ul>
              <li>Email: contact@studyinmoldova.md</li>
              <li>Telefon: +373 22 123 456</li>
            </ul>
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

export default Cookies; 
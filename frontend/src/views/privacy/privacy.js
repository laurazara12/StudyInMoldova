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
          <h1>Politica de Confidențialitate</h1>
          
          <section>
            <h2>1. Informații Generale</h2>
            <p>
              StudyInMoldova ("noi", "nostru" sau "noi") se angajează să protejeze confidențialitatea utilizatorilor platformei noastre. 
              Această politică de confidențialitate explică cum colectăm, utilizăm și protejăm informațiile personale pe care ni le furnizați.
            </p>
          </section>

          <section>
            <h2>2. Informațiile pe care le Colectăm</h2>
            <p>Colectăm următoarele tipuri de informații:</p>
            <ul>
              <li>Informații de identificare personală (nume, adresă de email, număr de telefon)</li>
              <li>Informații despre educație și studii</li>
              <li>Preferințe și interese academice</li>
              <li>Date de utilizare a platformei</li>
            </ul>
          </section>

          <section>
            <h2>3. Cum Utilizăm Informațiile</h2>
            <p>Utilizăm informațiile colectate pentru:</p>
            <ul>
              <li>Furnizarea serviciilor noastre educaționale</li>
              <li>Personalizarea experienței utilizatorului</li>
              <li>Comunicarea despre oportunități educaționale relevante</li>
              <li>Îmbunătățirea platformei noastre</li>
              <li>Respectarea obligațiilor legale</li>
            </ul>
          </section>

          <section>
            <h2>4. Protecția Datelor</h2>
            <p>
              Implementăm măsuri de securitate tehnice și organizaționale pentru a proteja informațiile dumneavoastră personale împotriva 
              accesului neautorizat, modificării, divulgării sau distrugerii.
            </p>
          </section>

          <section>
            <h2>5. Drepturile Dumneavoastră</h2>
            <p>Aveți dreptul la:</p>
            <ul>
              <li>Accesul la datele personale</li>
              <li>Corectarea datelor inexacte</li>
              <li>Ștergerea datelor personale</li>
              <li>Restricționarea procesării</li>
              <li>Portabilitatea datelor</li>
              <li>Opoziția față de procesare</li>
            </ul>
          </section>

          <section>
            <h2>6. Cookie-uri și Tehnologii Similar</h2>
            <p>
              Utilizăm cookie-uri și tehnologii similare pentru a îmbunătăți experiența dumneavoastră pe platforma noastră. 
              Puteți controla preferințele cookie-urilor prin setările browserului dumneavoastră.
            </p>
          </section>

          <section>
            <h2>7. Modificări ale Politicii de Confidențialitate</h2>
            <p>
              Ne rezervăm dreptul de a actualiza această politică de confidențialitate periodic. Vă vom notifica despre orice modificări 
              semnificative prin intermediul platformei sau prin email.
            </p>
          </section>

          <section>
            <h2>8. Contact</h2>
            <p>
              Pentru întrebări sau solicitări legate de această politică de confidențialitate, vă rugăm să ne contactați la:
              <br />
              Email: privacy@studyinmoldova.md
              <br />
              Telefon: +373 XX XXX XXX
            </p>
          </section>

          <section className="last-updated">
            <p>Ultima actualizare: 21.05.2025</p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Privacy 
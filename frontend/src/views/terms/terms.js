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
          <h1>Termeni și Condiții</h1>
          
          <section>
            <h2>1. Acceptarea Termenilor</h2>
            <p>
              Prin accesarea și utilizarea platformei StudyInMoldova, acceptați să fiți obligat de acești termeni și condiții. 
              Dacă nu sunteți de acord cu oricare dintre acești termeni, vă rugăm să nu utilizați platforma noastră.
            </p>
          </section>

          <section>
            <h2>2. Descrierea Serviciilor</h2>
            <p>
              StudyInMoldova oferă o platformă educațională care facilitează procesul de înscriere și informare despre 
              oportunitățile de studiu în Republica Moldova. Serviciile noastre includ:
            </p>
            <ul>
              <li>Informații despre universități și programe de studii</li>
              <li>Asistență în procesul de înscriere</li>
              <li>Resurse educaționale și ghiduri</li>
              <li>Comunitate pentru studenți și candidați</li>
            </ul>
          </section>

          <section>
            <h2>3. Obligațiile Utilizatorului</h2>
            <p>Ca utilizator al platformei, sunteți de acord să:</p>
            <ul>
              <li>Furnizați informații exacte și complete</li>
              <li>Mențineți confidențialitatea contului dumneavoastră</li>
              <li>Nu utilizați platforma în scopuri ilegale sau neautorizate</li>
              <li>Nu încercați să accesați zone restrânse ale platformei</li>
              <li>Nu utilizați platforma într-un mod care ar putea deteriora serviciile noastre</li>
            </ul>
          </section>

          <section>
            <h2>4. Proprietatea Intelectuală</h2>
            <p>
              Toate materialele, conținutul și designul platformei StudyInMoldova sunt protejate de legile drepturilor de autor 
              și sunt proprietatea noastră sau a furnizorilor noștri de licențe. Nu aveți dreptul să:
            </p>
            <ul>
              <li>Reproduceți, distribuiți sau modificați conținutul platformei</li>
              <li>Utilizați marca StudyInMoldova fără permisiunea noastră scrisă</li>
              <li>Eliminați sau modificați orice notificări de drepturi de autor</li>
            </ul>
          </section>

          <section>
            <h2>5. Limitarea Răspunderii</h2>
            <p>
              StudyInMoldova nu poate fi trasă la răspundere pentru:
            </p>
            <ul>
              <li>Precizia informațiilor furnizate de universități sau alte surse terțe</li>
              <li>Deciziile de admitere ale instituțiilor educaționale</li>
              <li>Orice întreruperi sau erori în funcționarea platformei</li>
              <li>Pierderi sau daune rezultate din utilizarea platformei</li>
            </ul>
          </section>

          <section>
            <h2>6. Modificări ale Termenilor</h2>
            <p>
              Ne rezervăm dreptul de a modifica acești termeni și condiții în orice moment. Modificările vor intra în vigoare 
              imediat după publicarea lor pe platformă. Utilizarea continuă a platformei după modificări constituie acceptarea 
              noilor termeni.
            </p>
          </section>

          <section>
            <h2>7. Legea Aplicabilă</h2>
            <p>
              Acești termeni și condiții sunt guvernați și interpretați în conformitate cu legile Republicii Moldova. 
              Orice dispută va fi supusă jurisdicției exclusive a instanțelor din Republica Moldova.
            </p>
          </section>

          <section>
            <h2>8. Contact</h2>
            <p>
              Pentru întrebări sau clarificări legate de acești termeni și condiții, vă rugăm să ne contactați la:
              <br />
              Email: terms@studyinmoldova.md
              <br />
              Telefon: +373 XX XXX XXX
            </p>
          </section>

          <section className="last-updated">
            <p>Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}</p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Terms 
import React from 'react';
import UniversityTemplate from '../university-template';
import './university-individual-page.css';

const UniversityIndividualPage = () => {
  return (
    <UniversityTemplate
      customSections={[
        // Aici puteți adăuga secțiuni personalizate pentru fiecare universitate
      ]}
      beforeHero={
        // Conținut personalizat înainte de hero
        null
      }
      afterHero={
        // Conținut personalizat după hero
        null
      }
      beforePrograms={
        // Conținut personalizat înainte de programe
        null
      }
      afterPrograms={
        // Conținut personalizat după programe
        null
      }
      beforeFooter={
        // Conținut personalizat înainte de footer
        null
      }
      customFooter={
        // Footer personalizat (opțional)
        null
      }
      customStyles={{
        // Stiluri personalizate (opțional)
      }}
      customComponents={[
        // Componente personalizate (opțional)
      ]}
    />
  );
};

export default UniversityIndividualPage; 
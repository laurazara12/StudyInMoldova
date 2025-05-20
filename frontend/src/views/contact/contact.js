// ... existing code ...
import React from 'react';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';

const Contact = () => {
  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 600, margin: '2rem auto', padding: 20, background: '#fff', borderRadius: 8 }}>
        <h1>Contact</h1>
        <div style={{ marginBottom: 16 }}>
          <strong>Adresă:</strong>
          <div>Strada Studenților 1, Chișinău, Moldova</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>Telefon:</strong>
          <div>+373 22 123456</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>Email:</strong>
          <div>contact@studyinmoldova.md</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>Program:</strong>
          <div>Luni - Vineri: 9:00 - 17:00</div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
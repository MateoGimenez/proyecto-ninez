import React from 'react';

function Footer() {
  return (
    <footer style={{ padding: '20px', textAlign: 'center', backgroundColor: '#313030' }}>
      <p style={{color : 'white'}}>&copy; {new Date().getFullYear()} Derechos Reservados @Mateo Gimenez.</p>
      <nav style={{ marginTop: '10px' }}>
        <a href="/privacy" style={{ margin: '0 10px' }}>Privacy Policy</a>
        <a href="/terms" style={{ margin: '0 10px' }}>Terms of Service</a>
        <a href="/contact" style={{ margin: '0 10px' }}>Contact</a>
      </nav>
    </footer>
  );
}

export default Footer;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const hadleNavigate = ()=>{
        window.location.reload();

  }

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={hadleNavigate}>📧 Emailer</div>

      {/* Hamburger icon for mobile */}
      <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle menu">
        {menuOpen ? '✖' : '☰'}
      </button>

      <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <li>
          <Link to="/" onClick={() => {setMenuOpen(false)}}>Home</Link>
        </li>
        <li>
          <Link to="/send-email" onClick={() => setMenuOpen(false)}>Send Email</Link>
        </li>
        <li>
          <Link to="/create-template" onClick={() => setMenuOpen(false)}>Create Template</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;

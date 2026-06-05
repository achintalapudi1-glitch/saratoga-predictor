import React from 'react';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__brand">
          <span className="header__horse" aria-hidden="true">🏇</span>
          <div>
            <h1 className="header__title">Saratoga Handicapper</h1>
            <p className="header__subtitle">Saratoga Race Course • AI-Powered Analysis</p>
          </div>
        </div>
        <div className="header__meta">
          <span className="header__badge">2025 Meet</span>
          <span className="header__disclaimer">For entertainment only — wager responsibly</span>
        </div>
      </div>
    </header>
  );
}

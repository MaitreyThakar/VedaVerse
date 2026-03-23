import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useLanguage, LANGUAGES } from '../LanguageContext';
import { translations } from '../translations';
import { BookOpen, Globe, ChevronDown } from 'lucide-react';
import './Header.css';

export default function Header() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language] || translations.en;
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const currentLang = LANGUAGES.find(l => l.code === language);

  const navLinks = [
    { to: '/ask',      label: t.ask },
    { to: '/texts',    label: t.texts },
    { to: '/heritage', label: t.heritage },
    { to: '/about',    label: t.about },
  ];

  return (
    <header className="header">
      <div className="header-inner container">
        {/* Logo */}
        <Link to="/" className="logo">
          <span className="logo-icon"><BookOpen size={22} /></span>
          <span className="logo-text">
            <span className="gradient-text">Veda</span>Verse
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="nav-desktop">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Language Switcher */}
        <div className="lang-switcher" onBlur={() => setLangOpen(false)} tabIndex={0}>
          <button className="lang-btn" onClick={() => setLangOpen(!langOpen)}>
            <Globe size={14} />
            <span>{currentLang?.native}</span>
            <ChevronDown size={12} className={`chevron ${langOpen ? 'open' : ''}`} />
          </button>
          {langOpen && (
            <div className="lang-dropdown">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  className={`lang-option ${language === lang.code ? 'selected' : ''}`}
                  onMouseDown={() => { setLanguage(lang.code); setLangOpen(false); }}
                >
                  <span>{lang.flag}</span>
                  <span className="lang-native">{lang.native}</span>
                  <span className="lang-name">{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav className="nav-mobile">
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} className="nav-link" onClick={() => setMenuOpen(false)}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}

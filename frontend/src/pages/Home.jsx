import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { translations } from '../translations';
import { Sparkles, Network, BookOpen, Users, ArrowRight, Zap, Globe, Shield } from 'lucide-react';
import './Home.css';

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const STATS = [
    { value: '10,000+', label: t.statTexts },
    { value: '8', label: t.statLangs },
    { value: '500+', label: t.statConcepts },
    { value: '6', label: t.statDomains },
  ];

  const FEATURES = [
    {
      icon: <Sparkles size={24} />, title: t.f1Title,
      desc: t.f1Desc,
      to: '/ask', color: 'gold',
    },
    {
      icon: <BookOpen size={24} />, title: t.f3Title,
      desc: t.f3Desc,
      to: '/texts', color: 'teal',
    },
    {
      icon: <Users size={24} />, title: t.f4Title,
      desc: t.f4Desc,
      to: '/heritage', color: 'red',
    },
  ];

  const DOMAINS = [
    { emoji: '🌿', name: t.ayurveda, desc: t.ayurvedaDesc },
    { emoji: '🧘', name: t.yoga, desc: t.yogaDesc },
    { emoji: '📜', name: t.sanskrit, desc: t.sanskritDesc },
    { emoji: '🔬', name: t.philosophy, desc: t.philosophyDesc },
    { emoji: '🎵', name: t.arts, desc: t.artsDesc },
    { emoji: '🔢', name: t.math, desc: t.mathDesc },
  ];

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="container hero-content">
          <div className="hero-badge">
            <span className="badge badge-gold"><Zap size={10} /> {t.heroPowered}</span>
          </div>
          <h1 className="hero-title">
            {t.heroTitle}<br />
            <span className="gradient-text">{t.heroTitleHighlight}</span>
          </h1>
          <p className="hero-desc">
            {t.heroDesc}
          </p>
          <div className="hero-actions">
            <Link to="/ask" className="btn btn-primary">
              <Sparkles size={16} /> {t.heroBtn1} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="hero-langs">
            {['English', 'हिन्दी', 'தமிழ்', 'বাংলা', 'తెలుగు', 'ಕನ್ನಡ'].map(l => (
              <span key={l} className="lang-pill">{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container stats-grid">
          {STATS.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-value gradient-text">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Domains */}
      <section className="domains-section container">
        <div className="section-header">
          <span className="badge badge-gold"><Globe size={10} /> {t.domainBadge}</span>
          <h2>{t.domainTitle}</h2>
          <p>{t.domainDesc}</p>
        </div>
        <div className="domains-grid">
          {DOMAINS.map(d => (
            <Link to="/texts" key={d.name} className="domain-card">
              <span className="domain-emoji">{d.emoji}</span>
              <strong>{d.name}</strong>
              <span>{d.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section container">
        <div className="section-header">
          <span className="badge badge-violet"><Shield size={10} /> {t.featureBadge}</span>
          <h2>{t.featureTitle}</h2>
          <p>{t.featureDesc}</p>
        </div>
        <div className="features-grid">
          {FEATURES.map(f => (
            <Link to={f.to} key={f.title} className={`feature-card feature-${f.color}`}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <span className="feature-arrow">Explore <ArrowRight size={14} /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section container">
        <div className="cta-card card card-glow">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaDesc}</p>
          <Link to="/ask" className="btn btn-primary">
            {t.ctaBtn} <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}

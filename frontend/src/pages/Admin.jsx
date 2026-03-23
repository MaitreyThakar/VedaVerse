import React, { useState, useEffect } from 'react';
import './Admin.css';
import { 
  Database, 
  ShieldCheck, 
  BookOpen, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Search,
  Plus,
  Loader2
} from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('curation');
  const [stats, setStats] = useState([]);
  const [curatedEntries, setCuratedEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch('http://127.0.0.1:8000/api/admin/stats');
      const statsData = await statsRes.json();
      
      const curationRes = await fetch('http://127.0.0.1:8000/api/admin/curation');
      const curationData = await curationRes.json();

      const formattedStats = [
        { label: 'Total Corpora', value: statsData.totalCorpora, icon: Database, color: '#3b82f6' },
        { label: 'Expert Validated', value: statsData.expertValidated, icon: ShieldCheck, color: '#10b981' },
        { label: 'Glossary Terms', value: statsData.glossaryTerms, icon: BookOpen, color: '#f59e0b' },
        { label: 'Retriever Accuracy', value: statsData.retrieverAccuracy, icon: TrendingUp, color: '#8b5cf6' },
      ];

      setStats(formattedStats);
      setCuratedEntries(curationData);
    } catch (err) {
      setError('Failed to fetch dynamic dashboard data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <Loader2 size={48} className="spin" />
        <p>Loading dynamic curation data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <AlertCircle size={48} />
        <h2>Connection Error</h2>
        <p>{error}</p>
        <button className="primary-btn" onClick={fetchData}>Retry Connection</button>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-content">
          <span className="badge">Admin Panel</span>
          <h1>Dataset Curation 🏛️</h1>
          <p>Maintain bilingual corpora, glossaries, and expert-in-the-loop validation.</p>
        </div>
        <button className="primary-btn">
          <Plus size={18} />
          New Dataset
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-content">
        <div className="tabs-nav">
          <button 
            className={`tab-btn ${activeTab === 'curation' ? 'active' : ''}`}
            onClick={() => setActiveTab('curation')}
          >
            <ShieldCheck size={18} />
            Expert Curation
          </button>
          <button 
            className={`tab-btn ${activeTab === 'glossary' ? 'active' : ''}`}
            onClick={() => setActiveTab('glossary')}
          >
            <BookOpen size={18} />
            Glossary & Annotations
          </button>
          <button 
            className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            <TrendingUp size={18} />
            Performance
          </button>
        </div>

        <div className="tab-pane">
          <div className="pane-header">
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search corpora..." />
            </div>
            <div className="filters">
              <span>All Languages</span>
              <span>All Status</span>
            </div>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Sanskrit / Translation</th>
                <th>Category</th>
                <th>Curator</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {curatedEntries.map(entry => (
                <tr key={entry.id}>
                  <td>#{entry.id}</td>
                  <td className="content-cell">
                    <FileText size={16} />
                    <div className="text-stack">
                      <div className="sanskrit-text">{entry.sanskrit}</div>
                      <div className="translation-text">{entry.english}</div>
                    </div>
                  </td>
                  <td>{entry.category}</td>
                  <td>{entry.author}</td>
                  <td>
                    <span className={`status-badge ${entry.status.toLowerCase()}`}>
                      {entry.status === 'Validated' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {entry.status}
                    </span>
                  </td>
                  <td>
                    <button className="text-btn">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;

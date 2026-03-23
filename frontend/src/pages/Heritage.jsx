import { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { translations } from '../translations';
import { submitHeritage, ingestDocument } from '../api';
import { Upload, CheckCircle, AlertCircle, Loader2, User, FileText, MapPin, ChevronRight } from 'lucide-react';
import './Heritage.css';

const CATEGORIES = ['Ayurveda & Herbs', 'Yoga & Meditation', 'Folk Medicine', 'Traditional Arts', 'Indigenous Language', 'Agricultural Wisdom', 'Architecture', 'Other'];
const LANGUAGES_LIST = ['Sanskrit', 'Hindi', 'Tamil', 'Bengali', 'Telugu', 'Kannada', 'Marathi', 'Gujarati', 'Odia', 'Malayalam', 'Assamese', 'Other'];
const REGIONS = ['North India', 'South India', 'East India', 'West India', 'Northeast India', 'Central India'];

export default function Heritage() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  
  const STEPS = [t.heritageStep1 || 'Your Info', t.heritageStep2 || 'Knowledge Details', t.heritageStep3 || 'Text & Submit'];

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    contributor_name: '', contributor_email: '',
    title: '', category: '', language: '', region: '',
    description: '', knowledge_text: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      const res = await submitHeritage(form);
      setResult(res);

      if (form.knowledge_text.length > 100) {
        try {
          const blob = new Blob([form.knowledge_text], { type: 'text/plain' });
          const fd = new FormData();
          fd.append('file', blob, `${form.title}.txt`);
          fd.append('source_name', form.title);
          fd.append('category', form.category);
          await ingestDocument(fd);
        } catch (_) { /* skip RAG */ }
      }
    } catch (e) {
      setError(t.heritageError || 'Submission failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer?.files[0] || e.target.files?.[0];
    if (f) setFile(f);
  };

  if (result) {
    return (
      <div className="heritage-page page-wrapper">
        <div className="container heritage-success">
          <CheckCircle size={56} className="success-icon" />
          <h2>{t.heritageSuccessTitle || "Submission Received!"}</h2>
          <p>{result.message}</p>
          <div className="submission-id">{t.heritageSuccessId || "Submission ID:"} <strong>{result.submission_id}</strong></div>
          <button className="btn btn-outline" onClick={() => { setResult(null); setForm({ contributor_name:'',contributor_email:'',title:'',category:'',language:'',region:'',description:'',knowledge_text:'' }); setStep(0); }}>
            {t.heritageSubmitAnother || "Submit Another"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="heritage-page page-wrapper">
      <div className="container">
        <div className="heritage-header">
          <h2>{t.heritageTitle || "Heritage Submission Portal"}</h2>
          <p>{t.heritageSub || "Help preserve India's living knowledge traditions. Submit regional, folk, or undocumented knowledge for inclusion in the VedaVerse archive."}</p>
        </div>

        <div className="step-track">
          {STEPS.map((s, i) => (
            <div key={i} className={`step-item ${i <= step ? 'done' : ''} ${i === step ? 'active' : ''}`}>
              <span className="step-num">{i + 1}</span>
              <span className="step-label">{s}</span>
              {i < STEPS.length - 1 && <ChevronRight size={14} className="step-arrow" />}
            </div>
          ))}
        </div>

        <div className="heritage-form card">
          {step === 0 && (
            <div className="form-step">
              <h3><User size={18} /> {t.heritageContributorTitle || "Contributor Information"}</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>{t.heritageFullName || "Full Name *"}</label>
                  <input className="input" placeholder={t.heritageFullNamePlace || "Your name"} value={form.contributor_name}
                    onChange={e => update('contributor_name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>{t.heritageEmail || "Email Address *"}</label>
                  <input className="input" type="email" placeholder={t.heritageEmailPlace || "your@email.com"} value={form.contributor_email}
                    onChange={e => update('contributor_email', e.target.value)} />
                </div>
              </div>
              <p className="form-note">{t.heritageNote || "Your details will not be shared publicly. We may contact you to verify or expand the submission."}</p>
              <button className="btn btn-primary" disabled={!form.contributor_name || !form.contributor_email}
                onClick={() => setStep(1)}>{t.heritageStepNext || "Continue"} <ChevronRight size={14} /></button>
            </div>
          )}

          {step === 1 && (
            <div className="form-step">
              <h3><FileText size={18} /> {t.heritageDetailsTitle || "Knowledge Details"}</h3>
              <div className="form-group">
                <label>{t.heritageTitleLabel || "Title *"}</label>
                <input className="input" placeholder={t.heritageTitlePlace || "e.g. Traditional Marma Therapy of Kerala"} value={form.title}
                  onChange={e => update('title', e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t.heritageCategoryLabel || "Category *"}</label>
                  <select className="input" value={form.category} onChange={e => update('category', e.target.value)}>
                    <option value="">{t.heritageSelectCategory || "Select category"}</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>{t.heritageLanguageLabel || "Language *"}</label>
                  <select className="input" value={form.language} onChange={e => update('language', e.target.value)}>
                    <option value="">{t.heritageSelectLanguage || "Select language"}</option>
                    {LANGUAGES_LIST.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>{t.heritageRegionLabel || "Region"} <MapPin size={12} /></label>
                  <select className="input" value={form.region} onChange={e => update('region', e.target.value)}>
                    <option value="">{t.heritageSelectRegion || "Select region"}</option>
                    {REGIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>{t.heritageDescLabel || "Brief Description *"} <small>(min. 50 chars)</small></label>
                <textarea className="input" rows={3} placeholder={t.heritageDescPlace || "Describe this knowledge tradition — its origin, significance, and current state."}
                  value={form.description} onChange={e => update('description', e.target.value)} />
              </div>
              <div className="step-actions">
                <button className="btn btn-ghost" onClick={() => setStep(0)}>{t.heritageStepBack || "Back"}</button>
                <button className="btn btn-primary"
                  disabled={!form.title || !form.category || !form.language || form.description.length < 50}
                  onClick={() => setStep(2)}>{t.heritageStepNext || "Continue"} <ChevronRight size={14} /></button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h3><Upload size={18} /> {t.heritageKnowledgeTitle || "Knowledge Text & Documents"}</h3>

              <div className="form-group">
                <label>{t.heritageTextLabel || "Detailed Knowledge Text *"} <small>(min. 100 chars)</small></label>
                <textarea className="input" rows={8}
                  placeholder={t.heritageTextPlace || "Share the detailed knowledge, practices, recipes, techniques, mantras, or stories."}
                  value={form.knowledge_text} onChange={e => update('knowledge_text', e.target.value)} />
                <small className="char-count">{form.knowledge_text.length} characters</small>
              </div>

              <div className="form-group">
                <label>{t.heritageUploadLabel || "Upload Supporting Document (PDF/TXT — optional)"}</label>
                <div
                  className={`dropzone ${dragOver ? 'dragover' : ''} ${file ? 'has-file' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <input id="file-input" type="file" accept=".pdf,.txt,.md" style={{ display: 'none' }} onChange={handleFileDrop} />
                  {file ? (
                    <div className="file-chosen"><CheckCircle size={20} /><span>{file.name}</span></div>
                  ) : (
                    <>
                      <Upload size={24} />
                      <span>{t.heritageDragDrop || "Drag & drop PDF or TXT, or click to browse"}</span>
                      <small>Max 10MB</small>
                    </>
                  )}
                </div>
              </div>

              {error && <div className="error-msg"><AlertCircle size={14} /> {error}</div>}

              <div className="step-actions">
                <button className="btn btn-ghost" onClick={() => setStep(1)}>{t.heritageStepBack || "Back"}</button>
                <button className="btn btn-primary"
                  disabled={form.knowledge_text.length < 100 || loading}
                  onClick={handleSubmit}>
                  {loading ? <><Loader2 size={14} className="spin" /> {t.heritageSubmittingBtn || "Submitting..."}</> : (t.heritageSubmitBtn || '🙏 Submit to Archive')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

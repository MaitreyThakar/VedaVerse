import { Github, Globe, BookOpen, Cpu, Database, Layers } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { translations } from '../translations';
import './About.css';

const STACK = [
  { icon: <Cpu size={20} />, name: 'Google Gemini', descKey: 'geminiDesc', color: 'gold' },
  { icon: <Database size={20} />, name: 'ChromaDB', descKey: 'chromaDesc', color: 'violet' },
  { icon: <Layers size={20} />, name: 'LangChain', descKey: 'langchainDesc', color: 'teal' },
  { icon: <Globe size={20} />, name: 'FastAPI', descKey: 'fastapiDesc', color: 'red' },
  { icon: <BookOpen size={20} />, name: 'React + Vite', descKey: 'reactDesc', color: 'teal' },
  { icon: <Globe size={20} />, name: 'D3.js', descKey: 'd3Desc', color: 'gold' },
];

const DOMAINS_INFO = [
  { emoji: '🌿', nameKey: 'ayurveda', texts: ['Charaka Samhita', 'Sushruta Samhita', 'Ashtanga Hridayam'] },
  { emoji: '🧘', nameKey: 'yoga', texts: ['Yoga Sutras of Patanjali', 'Hatha Yoga Pradipika', 'Gherand Samhita'] },
  { emoji: '📜', nameKey: 'sanskrit', texts: ['Ashtadhyayi (Panini)', 'Nirukta (Yaska)', 'Vakyapadiya'] },
  { emoji: '🔬', nameKey: 'philosophy', texts: ['Principal Upanishads', 'Arthashastra', 'Samkhya Karika'] },
  { emoji: '🎵', nameKey: 'arts', texts: ['Natya Shastra', 'Sangita Ratnakara', 'Abhinaya Darpana'] },
  { emoji: '🔢', nameKey: 'math', texts: ['Aryabhatiya', 'Brahmasphutasiddhanta', 'Sulba Sutras'] },
];

export default function About() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const steps = [
    { step: '01', title: t.step1Title, desc: t.step1Desc },
    { step: '02', title: t.step2Title, desc: t.step2Desc },
    { step: '03', title: t.step3Title, desc: t.step3Desc },
    { step: '04', title: t.step4Title, desc: t.step4Desc },
    { step: '05', title: t.step5Title, desc: t.step5Desc },
  ];

  const commonStacks = {
    geminiDesc: language === 'hi' ? 'पीढ़ी और अनुवाद के लिए LLM' : 
                language === 'ta' ? 'உருவாக்கம் மற்றும் மொழிபெயர்ப்பிற்கான LLM' :
                language === 'bn' ? 'প্রজন্ম এবং অনুবাদের জন্য LLM' : 'LLM for generation & translation',
    chromaDesc: language === 'hi' ? 'सिमेंटिक खोज के लिए वेक्टर डेटाबेस' : 
                language === 'ta' ? 'சொற்பொருள் தேடலுக்கான திசையன் தரவுத்தளம்' :
                language === 'bn' ? 'শব্দার্থবিজ্ঞান অনুসন্ধানের জন্য ভেক্টর ডাটাবেস' : 'Vector database for semantic search',
    langchainDesc: language === 'hi' ? 'RAG ऑर्केस्ट्रेशन फ्रेमवर्क' : 
                   language === 'ta' ? 'RAG ஆர்கெஸ்ட்ரேஷன் கட்டமைப்பு' :
                   language === 'bn' ? 'RAG অর্কেস্ট্রেশন ফ্রেমওয়ার্ক' : 'RAG orchestration framework',
    fastapiDesc: language === 'hi' ? 'उच्च प्रदर्शन वाला पायथन बैकएंड' : 
                 language === 'ta' ? 'உயர் செயல்திறன் கொண்ட பைதான் பின்தளம்' :
                 language === 'bn' ? 'উচ্চ-ক্ষমতাসম্পন্ন পাইথন ব্যাকএন্ড' : 'High-performance Python backend',
    reactDesc: language === 'hi' ? 'आधुनिक फ्रंटएंड फ्रेमवर्क' : 
               language === 'ta' ? 'நவீன முன்முனை கட்டமைப்பு' :
               language === 'bn' ? 'আধুনিক ফ্রন্টএন্ড ফ্রেমওয়ার্ক' : 'Modern frontend framework',
    d3Desc: language === 'hi' ? 'इंटरैक्टिव ज्ञान ग्राफ' : 
             language === 'ta' ? 'ஊடாடும் அறிவு வரைபடம்' :
             language === 'bn' ? 'ইন্টারেক্টিভ জ্ঞান গ্রাফ' : 'Interactive knowledge graph',
  }

  return (
    <div className="about-page page-wrapper">
      <div className="container">
        {/* Mission */}
        <section className="about-mission">
          <div className="badge badge-gold">🙏 {t.mission}</div>
          <h2>{t.missionTitle}<br /><span className="gradient-text">{t.modernAccess}</span></h2>
          <p>{t.missionP1}</p>
          <p>{t.missionP2}</p>
        </section>

        {/* Corpus */}
        <section className="about-section">
          <h3>📚 {t.knowledgeCorpus}</h3>
          <div className="corpus-grid">
            {DOMAINS_INFO.map(d => (
              <div key={d.nameKey} className="corpus-card card">
                <div className="corpus-emoji">{d.emoji}</div>
                <h4>{t[d.nameKey] || d.nameKey}</h4>
                <ul>
                  {d.texts.map(t_text => <li key={t_text}>{t_text}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="about-section">
          <h3>⚙️ {t.howItWorks}</h3>
          <div className="pipeline-steps">
            {steps.map(s => (
              <div key={s.step} className="pipeline-step">
                <span className="step-num-lg">{s.step}</span>
                <div>
                  <strong>{s.title}</strong>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="about-section">
          <h3>🛠️ {t.techStack}</h3>
          <div className="stack-grid">
            {STACK.map(s => (
              <div key={s.name} className={`stack-card card feature-${s.color}`}>
                <div className="feature-icon">{s.icon}</div>
                <div>
                  <strong>{s.name}</strong>
                  <p>{commonStacks[s.descKey]}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="about-section about-cta card card-glow">
          <h3>{t.builtBy}</h3>
          <p>
            <em>{language === 'hi' ? 'वेद' : language === 'ta' ? 'வேதம்' : language === 'bn' ? 'বেদ' : 'Veda'}</em> — {language === 'hi' ? 'प्राचीन ज्ञान' : language === 'ta' ? 'பண்டைய அறிவு' : language === 'bn' ? 'প্রাচীন জ্ঞান' : 'ancient knowledge'}. 
            <em>{language === 'hi' ? 'वर्स' : language === 'ta' ? 'வர்ஸ்' : language === 'bn' ? 'ভার্স' : 'Verse'}</em> — {language === 'hi' ? 'आधुनिक डिजिटल परत' : language === 'ta' ? 'நவீன டிஜிட்டల్ அடுக்கு' : language === 'bn' ? 'আধুনিক ডিজিটাল স্তর' : 'modern digital layer'}. 
            {t.teamP1}
          </p>
          <div className="cta-badges">
            <span className="badge badge-gold">🏆 {t.hackathon}</span>
            <span className="badge badge-violet">🤖 {t.geminiPowered}</span>
            <span className="badge badge-teal">🇮🇳 {t.madeInIndia}</span>
          </div>
        </section>
      </div>
    </div>
  );
}

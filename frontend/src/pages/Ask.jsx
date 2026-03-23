import { useState, useRef, useEffect } from 'react';
import { useLanguage, LANGUAGES } from '../LanguageContext';
import { askQuestion, performOCR } from '../api';
import { Send, Bot, User, BookOpen, Globe, Loader2, AlertCircle, Image as ImageIcon, X, Wand2, ShieldCheck } from 'lucide-react';

function MessageBubble({ msg, t }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`message ${isUser ? 'message-user' : 'message-bot'} ${msg.is_curated ? 'curated-msg' : ''}`}>
      <div className="msg-avatar">
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className="msg-content">
        {msg.is_curated && (
          <div className="curated-badge">
            <ShieldCheck size={11} /> <span>Expert Curated</span>
          </div>
        )}
        {msg.image && <img src={msg.image} alt="User upload" className="msg-image" />}
        <div className="msg-text">{msg.content}</div>
        
        {msg.glossary && msg.glossary.length > 0 && (
          <div className="msg-glossary">
            <div className="glossary-title"><BookOpen size={10} /> Sanskrit Glossary</div>
            <div className="glossary-grid">
              {msg.glossary.map((item, idx) => (
                <div key={idx} className="glossary-item">
                  <span className="term">{item.term}</span>
                  <span className="translit">({item.transliteration})</span>
                  <span className="gu-meaning">→ {item.gujarati}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {msg.sources && msg.sources.length > 0 && (
          <div className="msg-sources">
            <div className="sources-label"><BookOpen size={11} /> {t.askSources || 'Sources'}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {msg.sources.map((s, i) => (
                <div key={i} className="source-chip">
                  <span className="badge badge-gold">{s.category || 'Text'}</span>
                  <strong>{s.title || s}</strong>
                  {s.page && <span className="source-page">p.{s.page}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        {msg.translated && (
          <div className="translated-note">
            <Globe size={10} /> {t.askAutoTranslated || 'Auto-translated'}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Ask() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language] || translations.en;
  
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: t.askIntro || "Namaste! 🙏 I am VedaVerse — your guide to India's ancient knowledge systems. Ask me anything about Ayurveda, Yoga, Sanskrit, Philosophy, or the Arts. You can ask in any Indian language!",
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image too large. Please select a file smaller than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        setSelectedImage(base64);
        setOcrSuccess(false);
        
        // --- NEW: LOCAL OCR TRIGGER ---
        setOcrLoading(true);
        try {
          const res = await performOCR(base64);
          if (res.success && res.text) {
             setInput(prev => prev ? prev + '\n' + res.text : res.text);
             setOcrSuccess(true);
          } else if (res.message && res.message.includes('Tesseract-OCR not installed')) {
            setError('Local OCR requires Tesseract-OCR installed on the computer. Using image for AI query instead.');
          }
        } catch (err) {
          console.error("OCR failed", err);
        } finally {
          setOcrLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setOcrLoading(false);
    setOcrSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Update intro if language changes and no chat history yet
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'bot') {
       setMessages([{
         role: 'bot',
         content: t.askIntro
       }]);
    }
  }, [language]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (query = input) => {
    if ((!query.trim() && !selectedImage) || loading) return;
    setError(null);
    const userMsg = { role: 'user', content: query, image: selectedImage };
    setMessages(prev => [...prev, userMsg]);
    
    const currentImage = selectedImage;
    setInput('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    setLoading(true);

    try {
      const res = await askQuestion(query, language, sessionId, currentImage);
      if (!sessionId) setSessionId(res.session_id);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: res.answer,
        sources: res.sources,
        translated: res.translated,
        is_curated: res.is_curated,
        glossary: res.glossary,
      }]);
    } catch (e) {
      setError('Could not reach the backend. Make sure the API server is running on port 8000.');
      setMessages(prev => [...prev, {
        role: 'bot',
        content: t.askError || '⚠️ I could not connect to the backend. Please ensure the FastAPI server is running.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const currentLang = LANGUAGES.find(l => l.code === language);
  const suggestions = t.suggestions || [];

  return (
    <div className="ask-page page-wrapper">
      <div className="ask-layout container">
        {/* Sidebar */}
        <aside className="ask-sidebar">
          <div className="card">
            <h3>🌐 {t.askSidebarResponse || 'Response Language'}</h3>
            <select
              className="input"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.flag} {l.native} ({l.name})</option>
              ))}
            </select>
          </div>

          <div className="card">
            <h3>💡 {t.askSidebarSuggestions || 'Try asking...'}</h3>
            <div className="suggestions">
              {suggestions.map(s => (
                <button key={s} className="suggestion-btn" onClick={() => handleSend(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="card sidebar-info">
            <div className="badge badge-teal">ℹ️ {t.askSidebarAboutRag || 'About RAG'}</div>
            <p>{t.askSidebarRagDesc || 'VedaVerse uses Retrieval-Augmented Generation to find relevant passages in ancient texts before generating your answer.'}</p>
          </div>
        </aside>

        {/* Chat */}
        <div className="chat-panel">
          <div className="chat-header">
            <Bot size={20} />
            <span>VedaVerse AI</span>
            <span className="badge badge-gold">{t.geminiPowered || 'Powered by Gemini'}</span>
            <span className="chat-lang-indicator">
              <Globe size={12} /> {currentLang?.native}
            </span>
          </div>

          {error && (
            <div className="error-bar">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="chat-messages">
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} t={t} />)}
            {loading && (
              <div className="message message-bot">
                <div className="msg-avatar"><Bot size={16} /></div>
                <div className="msg-content">
                  <div className="typing-indicator">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-container">
            {selectedImage && (
              <div className="image-preview-bar">
                <div className="image-preview-item">
                  <img src={selectedImage} alt="Preview" />
                  <button className="remove-img-btn" onClick={removeImage}><X size={12} /></button>
                </div>
                {ocrLoading ? (
                  <div className="ocr-status scanning">
                    <Loader2 size={12} className="spin" />
                    <span>Scanning image for text...</span>
                  </div>
                ) : ocrSuccess ? (
                  <div className="ocr-status success">
                    <Wand2 size={12} />
                    <span>Text extracted locally!</span>
                  </div>
                ) : null}
              </div>
            )}
            <div className="chat-input-area">
              <div className="image-upload-wrapper">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  hidden
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload" className="image-upload-label" title="Upload image for OCR">
                  <ImageIcon size={20} />
                </label>
              </div>
              <textarea
                className="input chat-textarea"
                rows={1}
                placeholder={t.askPlaceholder || "Ask about Ayurveda, Yoga, Sanskrit, Philosophy..."}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
              />
              <button
                className="btn btn-primary send-btn"
                onClick={() => handleSend()}
                disabled={(!input.trim() && !selectedImage) || loading}
              >
                {loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                {loading ? (t.askThinking || 'Thinking...') : (t.askBtn || 'Ask')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

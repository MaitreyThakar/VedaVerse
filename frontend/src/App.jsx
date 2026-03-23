import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './LanguageContext';
import Header from './components/Header';
import Home from './pages/Home';
import Ask from './pages/Ask';
import Texts from './pages/Texts';
import Heritage from './pages/Heritage';
import About from './pages/About';
import './index.css';

function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)', textAlign: 'center',
      padding: '20px', color: 'var(--text-dim)', fontSize: '0.8rem',
    }}>
      🙏 VedaVerse — Bridging Ancient Wisdom & Modern Intelligence | Built with Gemini AI &amp; LangChain
    </footer>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{
          style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }
        }} />
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ask" element={<Ask />} />
            <Route path="/texts" element={<Texts />} />
            <Route path="/heritage" element={<Heritage />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </LanguageProvider>
  );
}

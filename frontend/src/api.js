// API client for VedaVerse backend
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const askQuestion = (query, language = 'en', sessionId = null, imageData = null) =>
  api.post('/api/ask', { query, language, session_id: sessionId, image_data: imageData }).then(r => r.data);

export const performOCR = (imageData) =>
  api.post('/api/ocr', { image_data: imageData }).then(r => r.data);

export const getGraph = () =>
  api.get('/api/graph').then(r => r.data);

export const getTexts = (params = {}) =>
  api.get('/api/texts', { params }).then(r => r.data);

export const getLanguages = () =>
  api.get('/api/languages').then(r => r.data);

export const submitHeritage = (data) =>
  api.post('/api/submit', data).then(r => r.data);

export const ingestDocument = (formData) =>
  api.post('/api/ingest', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);

export const healthCheck = () =>
  api.get('/health').then(r => r.data);

export default api;

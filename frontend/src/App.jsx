import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import ClinicalDashboard from './components/ClinicalDashboard';
import GeminiAdvancedInsights from './components/GeminiAdvancedInsights';
import VcfUploader from './components/VcfUploader';
import VcfDashboard from './components/VcfDashboard';
import AiClinicalReport from './components/AiClinicalReport';
import ApiKeyConfig from './components/ApiKeyConfig';
import { Dna, Sun, Moon, AlertTriangle, Key } from 'lucide-react';
import './index.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  // --- Theme ---
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // --- State ---
  const [variantData, setVariantData] = useState(null);
  const [vcfVariants, setVcfVariants] = useState([]);
  const [vcfFilename, setVcfFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showApiModal, setShowApiModal] = useState(false);

  // --- Handlers ---
  const handleSearch = async (query, useGemini, apiKey) => {
    setLoading(true);
    setError(null);
    setVariantData(null);
    setInsights(null);
    setVcfVariants([]);
    setVcfFilename("");
    setReport(null);
    if (apiKey) setGeminiApiKey(apiKey);

    try {
      const response = await axios.get(`${API_BASE_URL}/variant/${encodeURIComponent(query)}`);
      const data = response.data;
      setVariantData(data);

      if (useGemini && (apiKey || geminiApiKey)) {
        fetchInsights(data, apiKey || geminiApiKey);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 404) {
        setError("Variante não encontrada no banco de dados.");
      } else {
        setError("Erro de comunicação com o servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async (data, apiKey) => {
    setLoadingInsights(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/advanced-search`, {
        api_key: apiKey,
        variant_data: data
      });
      setInsights(response.data.insights);
    } catch (err) {
      console.error("Erro ao buscar insights", err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleVcfUpload = async (file) => {
    setLoading(true);
    setError(null);
    setVariantData(null);
    setInsights(null);
    setVcfVariants([]);
    setVcfFilename("");
    setReport(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/vcf-upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setVcfVariants(response.data.variants);
      setVcfFilename(response.data.filename || file.name);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Erro de comunicação com o servidor ao enviar VCF.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!geminiApiKey) {
      setShowApiModal(true);
      return;
    }
    generateReport(geminiApiKey);
  };

  const generateReport = async (apiKey) => {
    setLoadingReport(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/generate-report`, {
        api_key: apiKey,
        variants_data: vcfVariants,
        filename: vcfFilename
      });
      setReport(response.data.report);
    } catch (err) {
      console.error("Erro ao gerar laudo", err);
      if (err.response?.data?.error) {
        setError(`Erro ao gerar laudo: ${err.response.data.error}`);
      } else {
        setError("Erro ao gerar o laudo. Tente novamente.");
      }
    } finally {
      setLoadingReport(false);
    }
  };

  const handleApiKeySave = (key) => {
    setGeminiApiKey(key);
    setShowApiModal(false);
    // If there are pending VCF variants and user just configured key, generate report
    if (vcfVariants.length > 0 && key) {
      generateReport(key);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-logo">
            <Dna className="app-logo-icon" size={32} />
            <div className="app-logo-text">
              <h1>Buscador de Variantes Germinativas</h1>
              <span>Plataforma de Bioinformática Clínica</span>
            </div>
          </div>
          <div className="app-header-actions">
            <button
              className={`btn btn-sm ${geminiApiKey ? 'btn-success' : 'btn-outline'}`}
              onClick={() => setShowApiModal(true)}
              title="Configurar chave de acesso"
              aria-label="Configurar API Key"
            >
              <Key size={14} />
              {geminiApiKey ? 'Acesso Configurado' : 'Configurações'}
            </button>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
              aria-label={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container">
        {/* Hero */}
        <section className="page-hero">
          <h2>Análise de Variantes Genéticas</h2>
          <p>
            Pesquise por rsID ou HGVS, envie arquivos VCF para análise em lote
            e gere laudos clínicos automatizados.
          </p>
        </section>

        {/* Input Section */}
        <section className="input-grid">
          <SearchBar onSearch={handleSearch} loading={loading} savedApiKey={geminiApiKey} />
          <VcfUploader onUpload={handleVcfUpload} loading={loading} />
        </section>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 'var(--space-xl)' }} role="alert">
            <AlertTriangle size={18} className="alert-icon" />
            <div>
              <strong>Erro: </strong>{error}
            </div>
          </div>
        )}

        {/* Results */}
        {variantData && <ClinicalDashboard data={variantData} />}
        
        {(loadingInsights || insights) && (
          <GeminiAdvancedInsights insights={insights} loading={loadingInsights} />
        )}

        {vcfVariants.length > 0 && (
          <VcfDashboard 
            variants={vcfVariants} 
            filename={vcfFilename}
            onGenerateReport={handleGenerateReport} 
            loadingReport={loadingReport} 
          />
        )}

        {(loadingReport || report) && (
          <AiClinicalReport report={report} loading={loadingReport} filename={vcfFilename} />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        Buscador de Variantes Germinativas · Plataforma de Bioinformática Clínica
      </footer>

      {/* API Key Modal */}
      {showApiModal && (
        <ApiKeyConfig 
          apiKey={geminiApiKey} 
          onSave={handleApiKeySave} 
          onClose={() => setShowApiModal(false)} 
        />
      )}
    </div>
  );
}

export default App;

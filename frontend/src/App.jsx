import React, { useState } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import ClinicalDashboard from './components/ClinicalDashboard';
import GeminiAdvancedInsights from './components/GeminiAdvancedInsights';
import VcfUploader from './components/VcfUploader';
import VcfDashboard from './components/VcfDashboard';
import AiClinicalReport from './components/AiClinicalReport';
import ApiKeyConfig from './components/ApiKeyConfig';
import { Activity } from 'lucide-react';
import './index.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
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
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.status === 404) {
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
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setVcfVariants(response.data.variants);
      setVcfFilename(response.data.filename || file.name);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
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
      const key = prompt("Por favor, insira sua chave da API do Gemini para gerar o laudo:");
      if (!key) return;
      setGeminiApiKey(key);
      generateReport(key);
    } else {
      generateReport(geminiApiKey);
    }
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
      if (err.response && err.response.data && err.response.data.error) {
        setError(`Erro ao gerar laudo: ${err.response.data.error}`);
      } else {
        setError("Erro ao se comunicar com a IA para gerar o laudo.");
      }
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="container">
      <header>
        <Activity size={48} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
        <h1>Buscador de Variantes Genéticas</h1>
        <p>Busque por rsID, nomenclatura HGVS ou envie um arquivo VCF. Habilite a IA para insights clínicos.</p>
      </header>

      <ApiKeyConfig apiKey={geminiApiKey} onSave={setGeminiApiKey} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div>
          <SearchBar onSearch={handleSearch} loading={loading} savedApiKey={geminiApiKey} />
        </div>
        <div>
          <VcfUploader onUpload={handleVcfUpload} loading={loading} />
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '2rem' }}>
          <strong>Erro:</strong> {error}
        </div>
      )}

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
    </div>
  );
}

export default App;

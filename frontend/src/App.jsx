import React, { useState } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import ClinicalDashboard from './components/ClinicalDashboard';
import GeminiAdvancedInsights from './components/GeminiAdvancedInsights';
import { Activity } from 'lucide-react';
import './index.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [variantData, setVariantData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const handleSearch = async (query, useGemini, apiKey) => {
    setLoading(true);
    setError(null);
    setVariantData(null);
    setInsights(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/variant/${encodeURIComponent(query)}`);
      const data = response.data;
      setVariantData(data);

      if (useGemini && apiKey) {
        fetchInsights(data, apiKey);
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
      // Não bloqueia a exibição dos dados da variante se o Gemini falhar
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div className="container">
      <header>
        <Activity size={48} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
        <h1>Buscador de Variantes Genéticas</h1>
        <p>Busque por rsID ou nomenclatura HGVS. Habilite a IA para insights clínicos.</p>
      </header>

      <SearchBar onSearch={handleSearch} loading={loading} />

      {error && (
        <div className="alert alert-danger">
          <strong>Erro:</strong> {error}
        </div>
      )}

      {variantData && <ClinicalDashboard data={variantData} />}
      
      {(loadingInsights || insights) && (
        <GeminiAdvancedInsights insights={insights} loading={loadingInsights} />
      )}
    </div>
  );
}

export default App;

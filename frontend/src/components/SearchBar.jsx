import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

const SearchBar = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('');
  const [useGemini, setUseGemini] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, useGemini, apiKey);
    }
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="search-input">Pesquisar Variante (rsID ou HGVS)</label>
          <input
            id="search-input"
            type="text"
            placeholder="Ex: rs1333049 ou NM_000546.5:c.215A>G"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="toggle-wrapper" onClick={() => setUseGemini(!useGemini)}>
          <div className={`toggle-bg ${useGemini ? 'active' : ''}`}>
            <div className="toggle-knob"></div>
          </div>
          <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Ativar Busca Avançada com IA <Sparkles size={16} color="var(--primary-color)" />
          </span>
        </div>

        {useGemini && (
          <div className="input-group" style={{ marginTop: '1rem', animation: 'fadeIn 0.3s' }}>
            <label htmlFor="api-key">Gemini API Key</label>
            <input
              id="api-key"
              type="password"
              placeholder="Insira sua chave da API do Google Gemini..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '1rem' }}
          disabled={loading || !query.trim()}
        >
          {loading ? (
            <><div className="loader" style={{width: '16px', height: '16px', borderWidth: '2px'}}></div> Pesquisando...</>
          ) : (
            <><Search size={20} /> Buscar Variante</>
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchBar;

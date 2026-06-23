import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

const SearchBar = ({ onSearch, loading, savedApiKey }) => {
  const [query, setQuery] = useState('');
  const [useGemini, setUseGemini] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, useGemini, savedApiKey);
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

        {useGemini && !savedApiKey && (
          <div style={{ 
            backgroundColor: '#fff3cd', 
            color: '#856404', 
            padding: '0.75rem 1rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            border: '1px solid #ffeeba',
            fontSize: '0.9rem'
          }}>
            ⚠️ Configure sua API Key clicando no botão <strong>"Configurar API Key"</strong> acima.
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


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
      <h3 className="card-title">
        <Search size={18} color="var(--color-primary)" />
        Buscar Variante
      </h3>
      <p className="card-description">
        Pesquise por identificador rsID ou nomenclatura HGVS para consultar dados clínicos e populacionais.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="variant-search">Identificador da Variante</label>
          <div className="input-wrapper">
            <input
              id="variant-search"
              type="text"
              placeholder="Ex: rs1333049 ou NM_000546.5:c.215A>G"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
            <Search size={16} className="input-icon" />
          </div>
        </div>

        <div 
          className="toggle-wrapper" 
          onClick={() => setUseGemini(!useGemini)}
          role="switch"
          aria-checked={useGemini}
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setUseGemini(!useGemini)}
        >
          <div className={`toggle-bg ${useGemini ? 'active' : ''}`}>
            <div className="toggle-knob" />
          </div>
          <div className="toggle-label">
            <span className="toggle-label-title">
              Busca Avançada com IA
              <Sparkles size={14} color="var(--color-primary)" />
            </span>
            <span className="toggle-label-description">
              Gera insights clínicos utilizando o modelo Gemini com base na literatura médica.
            </span>
          </div>
        </div>

        {useGemini && !savedApiKey && (
          <div className="alert alert-warning" style={{ marginBottom: 'var(--space-md)' }}>
            <Sparkles size={16} className="alert-icon" />
            <span>Configure sua API Key clicando no botão <strong>"API Key"</strong> no cabeçalho.</span>
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary btn-full btn-lg"
          disabled={loading || !query.trim()}
        >
          {loading ? (
            <>
              <div className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} />
              Pesquisando...
            </>
          ) : (
            <>
              <Search size={18} />
              Buscar Variante
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchBar;

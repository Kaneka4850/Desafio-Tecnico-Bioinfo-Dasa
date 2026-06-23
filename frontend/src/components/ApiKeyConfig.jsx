import React, { useState } from 'react';
import { Settings, Eye, EyeOff, Check, X } from 'lucide-react';

const ApiKeyConfig = ({ apiKey, onSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);

  const handleOpen = () => {
    setTempKey(apiKey);
    setIsOpen(true);
  };

  const handleSave = () => {
    onSave(tempKey);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempKey(apiKey);
    setIsOpen(false);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={handleOpen}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: apiKey ? '2px solid #2ecc71' : '2px solid var(--border-color)',
            backgroundColor: apiKey ? '#2ecc7115' : 'var(--white)',
            color: apiKey ? '#2ecc71' : 'var(--text-light)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'all 0.3s ease'
          }}
        >
          <Settings size={16} />
          {apiKey ? 'API Key Configurada ✓' : 'Configurar API Key'}
        </button>
      </div>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s'
        }}>
          <div style={{
            backgroundColor: 'var(--white)',
            borderRadius: '16px',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={20} color="var(--primary-color)" />
              Configuração da API Key
            </h3>
            <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Insira sua chave da API do Google Gemini. Ela será usada para gerar insights clínicos e laudos.
            </p>

            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="Cole sua API Key aqui..."
                style={{
                  width: '100%',
                  padding: '0.75rem 3rem 0.75rem 1rem',
                  border: '2px solid var(--primary-light)',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                onBlur={(e) => e.target.style.borderColor = ''}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-light)'
                }}
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={handleCancel} className="btn btn-outline" style={{ padding: '0.5rem 1.25rem' }}>
                <X size={16} /> Cancelar
              </button>
              <button onClick={handleSave} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
                <Check size={16} /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApiKeyConfig;

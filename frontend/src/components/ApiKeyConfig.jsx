import React, { useState } from 'react';
import { Settings, Eye, EyeOff, Check, X } from 'lucide-react';

const ApiKeyConfig = ({ apiKey, onSave, onClose }) => {
  const [tempKey, setTempKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    onSave(tempKey);
  };

  const handleCancel = () => {
    if (onClose) onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">
          <Settings size={20} color="var(--color-primary)" />
          Configuração de Acesso
        </h3>
        <p className="modal-description" style={{ marginBottom: '1.5rem' }}>
          Insira sua chave de acesso. Ela será utilizada para gerar análises clínicas e laudos.
        </p>

        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <input
            type={showKey ? 'text' : 'password'}
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            placeholder="Cole sua chave de acesso aqui..."
            className="input-plain"
            style={{ paddingRight: '3rem' }}
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
              color: 'var(--color-text-secondary)'
            }}
          >
            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="modal-actions">
          <button onClick={handleCancel} className="btn btn-outline" style={{ padding: '0.5rem 1.25rem' }}>
            <X size={16} /> Cancelar
          </button>
          <button onClick={handleSave} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
            <Check size={16} /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyConfig;

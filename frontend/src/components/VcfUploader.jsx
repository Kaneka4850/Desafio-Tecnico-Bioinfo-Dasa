import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

const VcfUploader = ({ onUpload, loading }) => {
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setError(null);
    const file = e.target.files[0];
    
    if (!file) return;

    if (file.name.endsWith('.vcf') || file.name.endsWith('.gvcf')) {
      onUpload(file);
    } else {
      setError("Erro: O arquivo não é um VCF. Por favor, envie um arquivo .vcf ou .gvcf.");
      // Limpa o input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h3>Upload de Arquivo VCF</h3>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
        Envie um arquivo .vcf ou .gvcf filtrado para análise em lote (limitado às primeiras 50 variantes).
      </p>

      <div 
        onClick={!loading ? handleClick : undefined}
        style={{
          border: '2px dashed var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem',
          textAlign: 'center',
          cursor: loading ? 'not-allowed' : 'pointer',
          backgroundColor: 'var(--color-bg)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => !loading && (e.currentTarget.style.borderColor = 'var(--color-primary)')}
        onMouseLeave={(e) => !loading && (e.currentTarget.style.borderColor = 'var(--color-border)')}
      >
        <Upload size={48} color="var(--color-primary)" style={{ marginBottom: '1rem' }} />
        <h4>{loading ? 'Processando arquivo...' : 'Clique para selecionar um arquivo VCF'}</h4>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
          accept=".vcf,.gvcf"
        />
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
          <strong>{error}</strong>
        </div>
      )}
    </div>
  );
};

export default VcfUploader;

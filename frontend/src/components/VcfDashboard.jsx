import React from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';

const getClassificationStyle = (clinicalArray) => {
  if (!clinicalArray || clinicalArray.length === 0) return { color: 'var(--text-light)', label: 'Não Reportada', icon: <Info size={16} /> };

  const sigString = clinicalArray.join(' ').toLowerCase();

  if (sigString.includes('pathogenic') && !sigString.includes('likely pathogenic')) {
    return { color: '#e74c3c', label: 'Patogênica', icon: <ShieldAlert size={16} /> }; // Vermelho
  } else if (sigString.includes('likely pathogenic')) {
    return { color: '#e67e22', label: 'Provavelmente Patogênica', icon: <AlertTriangle size={16} /> }; // Laranja
  } else if (sigString.includes('uncertain') || sigString.includes('vus') || sigString.includes('conflicting')) {
    return { color: '#f1c40f', label: 'VUS', icon: <AlertCircle size={16} /> }; // Amarelo
  } else if (sigString.includes('benign')) {
    return { color: '#2ecc71', label: sigString.includes('likely') ? 'Provavelmente Benigna' : 'Benigna', icon: <CheckCircle size={16} /> }; // Verde
  }

  return { color: 'var(--text-light)', label: clinicalArray.join(', '), icon: <Info size={16} /> };
};

const VcfDashboard = ({ variants, filename, onGenerateReport, loadingReport }) => {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="card">
      {filename && (
        <div style={{ 
          backgroundColor: 'var(--primary-light)', 
          color: 'var(--primary-color)', 
          padding: '0.5rem 1rem', 
          borderRadius: '8px', 
          marginBottom: '1rem',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          📁 Arquivo: <strong>{filename}</strong>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>Variantes Identificadas ({variants.length})</h3>
        <button 
          className="btn btn-primary" 
          onClick={onGenerateReport}
          disabled={loadingReport}
        >
          {loadingReport ? 'Gerando Laudo...' : 'Gerar Laudo Clínico IA'}
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-light)' }}>Variante (rsID)</th>
              <th style={{ padding: '1rem', color: 'var(--text-light)' }}>Posição</th>
              <th style={{ padding: '1rem', color: 'var(--text-light)' }}>Gene(s)</th>
              <th style={{ padding: '1rem', color: 'var(--text-light)' }}>Consequência</th>
              <th style={{ padding: '1rem', color: 'var(--text-light)' }}>MAF (gnomAD)</th>
              <th style={{ padding: '1rem', color: 'var(--text-light)' }}>Classificação</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v, idx) => {
              const classStyle = getClassificationStyle(v.clinical);
              return (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{v.variant_id}</td>
                  <td style={{ padding: '1rem' }}>chr{v.chromosome}:{v.position}</td>
                  <td style={{ padding: '1rem' }}>{v.genes.join(', ')}</td>
                  <td style={{ padding: '1rem' }}>{v.consequence}</td>
                  <td style={{ padding: '1rem' }}>{v.minor_allele_freq}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      color: classStyle.color,
                      backgroundColor: `${classStyle.color}15`, // Transparência
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}>
                      {classStyle.icon}
                      {classStyle.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VcfDashboard;

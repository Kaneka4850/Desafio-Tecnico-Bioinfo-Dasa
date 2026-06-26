import React from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';

const getClassificationStyle = (clinicalArray) => {
  if (!clinicalArray || clinicalArray.length === 0) return { badgeClass: 'badge badge-not-reported', label: 'Não Reportada', icon: <Info size={16} /> };

  const sigString = clinicalArray.join(' ').toLowerCase();

  if (sigString.includes('pathogenic') && !sigString.includes('likely pathogenic')) {
    return { badgeClass: 'badge badge-pathogenic', label: 'Patogênica', icon: <ShieldAlert size={16} /> };
  } else if (sigString.includes('likely pathogenic')) {
    return { badgeClass: 'badge badge-likely-pathogenic', label: 'Provavelmente Patogênica', icon: <AlertTriangle size={16} /> };
  } else if (sigString.includes('uncertain') || sigString.includes('vus') || sigString.includes('conflicting')) {
    return { badgeClass: 'badge badge-vus', label: 'VUS', icon: <AlertCircle size={16} /> };
  } else if (sigString.includes('benign')) {
    return { badgeClass: 'badge badge-benign', label: sigString.includes('likely') ? 'Provavelmente Benigna' : 'Benigna', icon: <CheckCircle size={16} /> };
  }

  return { badgeClass: 'badge badge-not-reported', label: clinicalArray.join(', '), icon: <Info size={16} /> };
};

const VcfDashboard = ({ variants, filename, onGenerateReport, loadingReport }) => {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="card">
      {filename && (
        <div style={{
          backgroundColor: 'var(--color-primary-subtle)',
          color: 'var(--color-primary)',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-md)',
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
          {loadingReport ? 'Gerando Laudo...' : 'Gerar Laudo Clínico com IA'}
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Variante (rsID)</th>
              <th>Posição</th>
              <th>Gene(s)</th>
              <th>Consequência</th>
              <th>MAF (gnomAD)</th>
              <th>Classificação</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v, idx) => {
              const classStyle = getClassificationStyle(v.clinical);
              return (
                <tr key={idx}>
                  <td style={{ fontWeight: '600' }}>{v.variant_id}</td>
                  <td>chr{v.chromosome}:{v.position}</td>
                  <td>{v.genes.join(', ')}</td>
                  <td style={{ textTransform: 'capitalize' }}>{v.consequence}</td>
                  <td>{v.minor_allele_freq !== null ? `${(v.minor_allele_freq * 100).toFixed(2)}%` : 'N/D'}</td>
                  <td>
                    <span className={classStyle.badgeClass} style={{ gap: '0.25rem' }}>
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

import React from 'react';
import { Dna, MapPin, AlertCircle, FileText, Database } from 'lucide-react';

const ClinicalDashboard = ({ data }) => {
  const {
    variant_id,
    rsid,
    chromosome,
    position,
    alleles,
    minor_allele_freq,
    genes,
    consequence,
    clinical,
    omim,
    cgi
  } = data;

  const isPathogenic = clinical.some(c => c.toLowerCase().includes('pathogenic'));

  return (
    <div className="card" style={{ animation: 'fadeIn 0.5s' }}>
      <h2 className="card-title">
        <Dna size={24} color="var(--primary-color)" />
        Informações da Variante: {rsid !== variant_id && rsid !== 'Desconhecido' ? `${variant_id} (${rsid})` : variant_id}
      </h2>
      
      <div className="dashboard-grid">
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', fontSize: '1rem', marginBottom: '1rem' }}>
            <MapPin size={18} /> Localização Genômica
          </h3>
          <div className="info-item">
            <div className="info-item-label">Cromossomo</div>
            <div className="info-item-value">{chromosome}</div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Posição</div>
            <div className="info-item-value">{position.toLocaleString()}</div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Alelos (Ref &gt; Alt)</div>
            <div className="info-item-value">{alleles || 'N/A'}</div>
          </div>
        </div>

        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', fontSize: '1rem', marginBottom: '1rem' }}>
            <FileText size={18} /> Anotação Biológica
          </h3>
          <div className="info-item">
            <div className="info-item-label">Gene(s) Afetado(s)</div>
            <div className="info-item-value">
              {genes.map(g => (
                <span key={g} className="badge">{g}</span>
              ))}
            </div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Consequência Molecular</div>
            <div className="info-item-value" style={{ textTransform: 'capitalize' }}>
              {consequence}
            </div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Frequência (MAF)</div>
            <div className="info-item-value">
              {minor_allele_freq !== null ? `${(minor_allele_freq * 100).toFixed(2)}%` : 'N/D'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--primary-light)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', fontSize: '1rem', marginBottom: '1rem' }}>
          <AlertCircle size={18} /> Classificação Clínica (Ensembl)
        </h3>
        <div>
          {clinical.map((c, index) => (
            <span key={index} className={`badge ${c.toLowerCase().includes('pathogenic') ? 'badge-danger' : ''}`}>
              {c.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {(omim || cgi) && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--primary-light)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', fontSize: '1rem', marginBottom: '1rem' }}>
            <Database size={18} /> Bases de Dados Adicionais
          </h3>
          <div className="dashboard-grid">
            {omim && (
              <div>
                <div className="info-item-label">OMIM</div>
                <div className="info-item-value" style={{ fontSize: '0.9rem' }}>Status: {omim.status}</div>
              </div>
            )}
            {cgi && (
              <div>
                <div className="info-item-label">Cancer Genome Interpreter</div>
                <div className="info-item-value" style={{ fontSize: '0.9rem' }}>Status: {cgi.status}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicalDashboard;

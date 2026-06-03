import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Activity } from 'lucide-react';

const GeminiAdvancedInsights = ({ insights, loading }) => {
  return (
    <div className="card" style={{ animation: 'fadeIn 0.5s', backgroundColor: 'var(--primary-light)', border: '1px solid var(--secondary-color)' }}>
      <h2 className="card-title" style={{ color: 'var(--primary-color)' }}>
        <Sparkles size={24} />
        Insights Clínicos com IA
      </h2>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
          <div className="loader" style={{ width: '40px', height: '40px', borderWidth: '4px', marginBottom: '1rem' }}></div>
          <p style={{ color: 'var(--primary-color)', fontWeight: 500 }}>
            Analisando literatura médica e estruturando hipóteses...
          </p>
        </div>
      ) : (
        <div className="markdown-content">
          <ReactMarkdown>{insights}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default GeminiAdvancedInsights;

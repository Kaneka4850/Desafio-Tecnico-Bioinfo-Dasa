import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, Download, AlertTriangle } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

const AiClinicalReport = ({ report, loading, filename }) => {
  const reportRef = useRef(null);

  if (!loading && !report) return null;

  const sanitizeFilename = (name) => {
    if (!name) return 'laudo_clinico';
    return name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  };

  const handleExportPDF = () => {
    const element = reportRef.current;
    if (!element) return;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${sanitizeFilename(filename)}_laudo.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleExportWord = async () => {
    if (!report) return;

    // Parse markdown into simple paragraphs for DOCX
    const lines = report.split('\n');
    const docParagraphs = [];

    // Add disclaimer at top
    docParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "AVISO: Este é um laudo gerado automaticamente para fins de pesquisa. Deve ser revisado por um profissional habilitado antes de qualquer uso clínico.",
            bold: true,
            color: "856404",
            size: 20,
          }),
        ],
        spacing: { after: 300 },
        shading: { fill: "FFF3CD" },
      })
    );

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        docParagraphs.push(new Paragraph({ text: '' }));
        continue;
      }

      // Headings
      if (trimmed.startsWith('### ')) {
        docParagraphs.push(new Paragraph({
          text: trimmed.replace(/^###\s*/, '').replace(/\*\*/g, ''),
          heading: HeadingLevel.HEADING_3,
        }));
      } else if (trimmed.startsWith('## ')) {
        docParagraphs.push(new Paragraph({
          text: trimmed.replace(/^##\s*/, '').replace(/\*\*/g, ''),
          heading: HeadingLevel.HEADING_2,
        }));
      } else if (trimmed.startsWith('# ')) {
        docParagraphs.push(new Paragraph({
          text: trimmed.replace(/^#\s*/, '').replace(/\*\*/g, ''),
          heading: HeadingLevel.HEADING_1,
        }));
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        // Bullet points
        const bulletText = trimmed.replace(/^[-*]\s*/, '').replace(/\*\*/g, '');
        docParagraphs.push(new Paragraph({
          children: [new TextRun({ text: bulletText, size: 22 })],
          bullet: { level: 0 },
        }));
      } else if (trimmed.startsWith('---')) {
        docParagraphs.push(new Paragraph({
          children: [new TextRun({ text: '─'.repeat(50), color: "CCCCCC" })],
        }));
      } else {
        // Regular paragraph - handle bold markers
        const parts = trimmed.split(/(\*\*.*?\*\*)/g);
        const runs = parts.map(part => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return new TextRun({ text: part.slice(2, -2), bold: true, size: 22 });
          }
          return new TextRun({ text: part, size: 22 });
        });
        docParagraphs.push(new Paragraph({ children: runs }));
      }
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: docParagraphs,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${sanitizeFilename(filename)}_laudo.docx`);
  };

  return (
    <div className="card" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
        <h2 className="card-title" style={{ color: 'var(--color-primary)', marginBottom: 0 }}>
          <FileText size={24} />
          Laudo Clínico
        </h2>

        {!loading && report && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={handleExportPDF} 
              className="btn btn-outline"
            >
              <Download size={16} /> PDF
            </button>
            <button 
              onClick={handleExportWord} 
              className="btn btn-outline"
            >
              <Download size={16} /> Word
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem' }}>
          <div className="loader" style={{ width: '50px', height: '50px', borderWidth: '5px', marginBottom: '1.5rem' }}></div>
          <p style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '1.1rem' }}>
            Analisando variantes e redigindo o laudo clínico...
          </p>
        </div>
      ) : (
        <div ref={reportRef} className="markdown-content" style={{ marginTop: '1rem', lineHeight: '1.6' }}>
          <div className="alert alert-warning" style={{ marginBottom: '2rem' }}>
            <AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} /><strong>Aviso:</strong> Este é um laudo gerado automaticamente para fins de pesquisa.
            Ele <strong>deve ser revisado por um profissional habilitado</strong> antes de qualquer uso clínico.
          </div>
          <ReactMarkdown>{report}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default AiClinicalReport;

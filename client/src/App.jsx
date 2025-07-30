import React, { useState, useEffect } from 'react';
const API_BASE = process.env.REACT_APP_API_URL;

function App() {
  const [resumeText, setResumeText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const analyzeResume = async () => {
    if (!resumeText) return;
    setLoading(true);
    setFeedback('');

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText })
      });

      const data = await res.json();
      setFeedback(data.feedback);
    } catch (error) {
      console.error('❌ Error:', error);
      setFeedback('❌ Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    if (file) {
      setSelectedFile(file);
    }

    setLoading(true);
    setFeedback('');
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setFeedback(data.feedback || '❌ No feedback returned.');
    } catch (err) {
      console.error('❌ Upload error:', err);
      setFeedback('❌ File upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const cleanFeedback = feedback?.trim();

  const renderFeedback = () => {
    return cleanFeedback.split('\n').map((line, idx) => {
      let color = '#eee';
      const lower = line.toLowerCase();
      let cleanedLine = line.replace(/^[-*]\s*/, '').trim();

      if (line.startsWith('✅') || lower.includes('excellent') || lower.includes('strong')) {
        color = 'lightgreen';
      } else if (line.startsWith('⚠️') || lower.includes('consider') || lower.includes('could')) {
        color = 'orange';
      } else if (line.startsWith('❌') || lower.includes('missing') || lower.includes('lacks')) {
        color = 'red';
      }

      if (/^\*/.test(line)) {
        cleanedLine = `<strong>${cleanedLine}</strong>`;
        cleanedLine = cleanedLine.replace(/\*/g, '');
      }

      return (
        <p
          key={idx}
          style={{
            color,
            fontSize: '1rem',
            lineHeight: '1.6',
            marginBottom: '10px',
          }}
          dangerouslySetInnerHTML={{ __html: cleanedLine }}
        />
      );
    });
  };

  // Append responsive styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @media (max-width: 768px) {
        .input-wrapper {
          flex-direction: column !important;
        }

        .textarea {
          width: 100% !important;
        }

        button {
          width: 100% !important;
        }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div
      style={{
        padding: '2rem',
        fontFamily: 'Segoe UI, sans-serif',
        backgroundColor: '#121212',
        minHeight: '100vh',
        color: 'white'
      }}
    >
      <h1 style={{ color: '#8fffbd', marginBottom: '2rem' }}>📄 Resume AI-Doctor</h1>

      {/* Input Area */}
      <div
        className="input-wrapper"
        style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}
      >
        {/* File Upload */}
        <div
          style={{
            backgroundColor: '#1e1e1e',
            padding: '2rem',
            borderRadius: '12px',
            border: '2px dashed #8fffbd',
            flex: '1',
            textAlign: 'center',
            minWidth: '250px'
          }}
        >
          <label
            htmlFor="pdfUpload"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#8fffbd',
              color: '#121212',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1.1rem',
            }}
          >
            📎 Upload PDF
          </label>
          <input
            id="pdfUpload"
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <p style={{ marginTop: '1rem', color: '#aaa' }}>
            Upload your resume as a PDF for best results.
          </p>

          {/* Show file name if selected */}
          {selectedFile && (
            <p style={{ marginTop: '0.5rem', color: '#8fffbd', fontSize: '0.9rem' }}>
              ✅ Selected: <strong>{selectedFile.name}</strong>
            </p>
          )}
        </div>

        {/* Paste Text */}
        <div style={{ flex: '1', minWidth: '250px' }}>
          <textarea
            className="textarea"
            rows="10"
            placeholder="✏️ Or paste your resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: '#1e1e1e',
              color: 'white',
              fontSize: '1rem',
              borderRadius: '8px',
              border: '1px solid #444',
              resize: 'vertical',
              marginBottom: '1rem'
            }}
          />

          <button
            onClick={analyzeResume}
            disabled={loading || !resumeText}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              background: loading || !resumeText ? '#444' : '#8fffbd',
              color: '#121212',
              border: 'none',
              borderRadius: '6px',
              cursor: loading || !resumeText ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Analyzing...' : 'Analyze Text'}
          </button>
        </div>
      </div>

      {/* Feedback Section */}
      <div
        style={{
          background: '#1e1e1e',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 0 8px rgba(0,0,0,0.4)',
          minHeight: '100px'
        }}
      >
        <h3 style={{ marginBottom: '1rem', color: '#8fffbd' }}>📝 AI Feedback</h3>

        {loading && (
          <div style={{ textAlign: 'center', color: '#ccc' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                border: '4px solid #444',
                borderTop: '4px solid #8fffbd',
                borderRadius: '50%',
                margin: '0 auto 1rem auto',
                animation: 'spin 1s linear infinite'
              }}
            ></div>
            Analyzing your resume...
          </div>
        )}

        {!loading && cleanFeedback && renderFeedback()}
      </div>
    </div>
  );
}

export default App;

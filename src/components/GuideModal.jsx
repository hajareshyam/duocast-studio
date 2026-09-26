import React from 'react';

export default function GuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" id="guideModal">
      <div className="modal-card glass-card modal-large">
        <div className="modal-header">
          <h3>⚡ Deploy to Cloudflare Pages (100% Free Forever)</h3>
          <button onClick={onClose} className="btn-close" id="closeGuideBtn">&times;</button>
        </div>
        <div className="guide-content">
          <ol className="guide-steps">
            <li>
              <strong>Push Code to GitHub:</strong>
              <p>Your repository is ready at <code>https://github.com/hajareshyam/duocast-studio</code>.</p>
            </li>
            <li>
              <strong>Connect to Cloudflare Pages:</strong>
              <p>Log into <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener noreferrer">dash.cloudflare.com</a> &gt; <strong>Workers &amp; Pages</strong> &gt; <strong>Create application</strong> &gt; <strong>Pages</strong> &gt; <strong>Connect to Git</strong>.</p>
            </li>
            <li>
              <strong>Select Build Settings:</strong>
              <p>Framework preset: <strong>Vite</strong><br />
              Build command: <code>npm run build</code><br />
              Build output directory: <code>dist</code></p>
            </li>
            <li>
              <strong>Instant Global CDN Deployment:</strong>
              <p>Cloudflare builds your studio in &lt;60s and provides a free custom SSL domain (e.g. <code>https://duocast-studio.pages.dev</code>) with unlimited bandwidth and 0ms cold starts worldwide!</p>
            </li>
          </ol>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary" id="gotItGuideBtn">Got it!</button>
        </div>
      </div>
    </div>
  );
}

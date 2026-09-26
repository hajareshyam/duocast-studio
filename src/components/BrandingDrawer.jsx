import React from 'react';

const TOPIC_PRESETS = [
  'Travel Hacks & Packing Tips ✈️',
  'Mom Life & Parenting Realities 🤱',
  'Live Podcast & Fan Q&A 🎙️',
  'Weekend Getaways & Hidden Gems 🗺️'
];

export default function BrandingDrawer({
  isOpen,
  onClose,
  hostName,
  onChangeHostName,
  guestName,
  onChangeGuestName,
  showTitle,
  onChangeShowTitle,
  studioTheme,
  onChangeStudioTheme,
  tickerText,
  onChangeTickerText,
  tickerEnabled,
  onToggleTicker
}) {
  return (
    <aside className={`branding-bar glass-card ${isOpen ? 'is-open' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-bright)' }}>
          🎨 Studio Branding & Graphics
        </h4>
        <button onClick={onClose} className="btn-close" title="Close Drawer">&times;</button>
      </div>

      <div className="branding-inputs">
        <div className="input-group">
          <label htmlFor="hostNameInput">Host (You):</label>
          <input
            type="text"
            id="hostNameInput"
            value={hostName}
            onChange={(e) => onChangeHostName(e.target.value)}
            placeholder="Your @handle"
          />
        </div>

        <div className="input-group">
          <label htmlFor="guestNameInput">Co-Host (Guest):</label>
          <input
            type="text"
            id="guestNameInput"
            value={guestName}
            onChange={(e) => onChangeGuestName(e.target.value)}
            placeholder="Guest @handle"
          />
        </div>

        <div className="input-group">
          <label htmlFor="topicInput">Show / Reel Title:</label>
          <input
            type="text"
            id="topicInput"
            value={showTitle}
            onChange={(e) => onChangeShowTitle(e.target.value)}
            placeholder="Optional Title"
          />
        </div>

        <div className="input-group">
          <label htmlFor="studioThemeSelect">Studio Theme:</label>
          <select
            id="studioThemeSelect"
            className="select-styled select-sm"
            value={studioTheme}
            onChange={(e) => onChangeStudioTheme(e.target.value)}
          >
            <option value="theme-indigo">✨ Studio Indigo</option>
            <option value="theme-cyberpunk">🔮 Cyberpunk Neon</option>
            <option value="theme-sunset">🌅 Sunset Rose Gold</option>
            <option value="theme-emerald">🌿 Emerald Slate</option>
          </select>
        </div>

        <div className="topic-presets-container">
          <span className="presets-label">Quick Topics:</span>
          <div className="topic-chips">
            {TOPIC_PRESETS.map((t) => (
              <button
                key={t}
                type="button"
                className="topic-chip"
                onClick={() => onChangeShowTitle(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="input-group input-group-full">
          <label htmlFor="tickerTextInput">Scrolling Ticker:</label>
          <input
            type="text"
            id="tickerTextInput"
            value={tickerText}
            onChange={(e) => onChangeTickerText(e.target.value)}
            placeholder="Bottom scrolling marquee text..."
          />
          <button
            type="button"
            onClick={onToggleTicker}
            className={`btn ${tickerEnabled ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ whiteSpace: 'nowrap' }}
          >
            Ticker: {tickerEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </aside>
  );
}

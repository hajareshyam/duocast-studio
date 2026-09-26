import React, { useState } from 'react';

export default function ChatDrawer({
  isOpen,
  onClose,
  messages,
  onSendMessage
}) {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="chat-drawer glass-card" id="chatDrawer">
      <div className="chat-header">
        <div className="chat-title">
          <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Backstage Chat</span>
        </div>
        <button onClick={onClose} className="btn-close" id="closeChatBtn">&times;</button>
      </div>

      <div className="chat-messages" id="chatMessagesContainer">
        <div className="chat-system-msg">Send silent cues and notes to your co-host during the broadcast.</div>
        {messages.map((m, idx) => (
          <div key={idx} className={`chat-bubble ${m.isSelf ? 'chat-bubble-self' : 'chat-bubble-peer'}`}>
            <span className="chat-sender">{m.sender}</span>
            <p className="chat-text">{m.text}</p>
            <span className="chat-time">{m.time}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chat-input-bar" id="chatForm">
        <input
          type="text"
          id="chatTextInput"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a private cue..."
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary btn-sm btn-icon">
          <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
}

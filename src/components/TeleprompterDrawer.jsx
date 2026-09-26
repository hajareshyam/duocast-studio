import React, { useRef, useEffect } from 'react';

const DEFAULT_SCRIPT = `🎙️ HOOK (0-3 sec):
"Stop packing like it's 2015! Here are the 3 travel hacks that saved my sanity with kids..."

✨ POINT 1:
The 2-bag rule for international flights — never check essential gear or kid medicines.

✨ POINT 2:
Offline maps & digital backup of passports in secure cloud notes.

✨ CALL TO ACTION:
"Drop your favorite holiday spot in the comments below, and share this with your travel partner!"`;

export default function TeleprompterDrawer({
  isOpen,
  onClose,
  isScrolling,
  onToggleScroll,
  onResetScroll,
  speed,
  onChangeSpeed,
  fontSize,
  onChangeFontSize,
  scriptText,
  onChangeScriptText,
  prompterRef
}) {
  if (!isOpen) return null;

  return (
    <div className="teleprompter-drawer glass-card" id="teleprompterDrawer">
      <div className="drawer-header">
        <div className="drawer-title">
          <span>📝 Creator Teleprompter</span>
        </div>
        <div className="prompter-quick-controls">
          <button
            type="button"
            onClick={onToggleScroll}
            className={`btn ${isScrolling ? 'btn-secondary' : 'btn-primary'} btn-sm`}
            id="toggleScrollPrompterBtn"
          >
            {isScrolling ? '⏸️ Pause' : '▶️ Scroll'}
          </button>
          <button
            type="button"
            onClick={onResetScroll}
            className="btn btn-ghost btn-sm"
            id="resetScrollPrompterBtn"
          >
            ⏮️ Top
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-close"
            id="closePrompterBtn"
          >
            &times;
          </button>
        </div>
      </div>

      <div className="prompter-controls-bar">
        <div className="prompter-control-group">
          <label htmlFor="prompterSpeedRange">Speed: <span>{speed}x</span></label>
          <input
            type="range"
            id="prompterSpeedRange"
            min="1"
            max="6"
            step="1"
            value={speed}
            onChange={(e) => onChangeSpeed(Number(e.target.value))}
          />
        </div>
        <div className="prompter-control-group">
          <label htmlFor="prompterFontSizeRange">Font: <span>{fontSize}px</span></label>
          <input
            type="range"
            id="prompterFontSizeRange"
            min="14"
            max="32"
            step="2"
            value={fontSize}
            onChange={(e) => onChangeFontSize(Number(e.target.value))}
          />
        </div>
      </div>

      <div
        ref={prompterRef}
        id="prompterContent"
        className="prompter-body"
        contentEditable="true"
        spellCheck="false"
        style={{ fontSize: `${fontSize}px` }}
        suppressContentEditableWarning={true}
        onBlur={(e) => onChangeScriptText(e.currentTarget.innerText)}
      >
        {scriptText || DEFAULT_SCRIPT}
      </div>
    </div>
  );
}

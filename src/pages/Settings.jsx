import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHub } from '../lib/store.jsx';
import { BackLink, ConfirmButton, Icon, Sparkle } from '../components/ui.jsx';
import { SIZES, THEMES, getPrefs, setPrefs } from '../lib/prefs.js';

export default function Settings() {
  const { mode, campaign, leave, resetDemo } = useHub();
  const nav = useNavigate();
  const [p, setP] = useState(getPrefs);
  const change = (patch) => { const next = { ...p, ...patch }; setP(next); setPrefs(next); };

  return (
    <div className="shell">
      <div className="page" style={{ paddingTop: '0.6rem', gap: '1.1rem' }}>
        <BackLink />
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="title">Pick your look</h1>
          <p className="lede">This only changes your phone. Everyone picks their own.</p>
        </div>

        <div className="card" aria-label="Preview">
          <div className="row" style={{ color: 'var(--deco)', gap: 8 }}><Sparkle size={12} /><span className="label" style={{ color: 'inherit' }}>Preview</span></div>
          <span className="card-title" style={{ fontSize: '1.7rem' }}>Tabaxi</span>
          <span className="card-body">Curious cat-folk with claws, climbing and bursts of speed.</span>
          <span className="tag accent" style={{ alignSelf: 'flex-start', fontSize: '0.9rem', padding: '6px 12px' }}>Stealth: d20 + 5</span>
        </div>

        <div className="stack" style={{ gap: 8 }}>
          <span className="label">Theme</span>
          {THEMES.map((t) => (
            <button key={t.id} type="button" className="pick" aria-pressed={p.theme === t.id} onClick={() => change({ theme: t.id })}>
              <span aria-hidden="true" className="row" style={{ gap: 0 }}>
                {t.swatch.map((c, i) => <span key={c} style={{ width: 22, height: 22, borderRadius: 11, background: c, border: '1px solid var(--line-strong)', marginLeft: i ? -7 : 0 }} />)}
              </span>
              <span className="grow stack" style={{ gap: 2 }}><b style={{ fontSize: '0.95rem' }}>{t.name}</b><span className="small" style={{ fontSize: '0.75rem' }}>{t.tag}</span></span>
              {p.theme === t.id && <Icon name="check" style={{ color: 'var(--accent)' }} />}
            </button>
          ))}
        </div>

        <div className="stack" style={{ gap: 8 }}>
          <span className="label">Text size</span>
          <div className="seg">
            {SIZES.map((s) => <button key={s.id} type="button" aria-pressed={p.size === s.id} aria-label={s.label} onClick={() => change({ size: s.id })} style={{ fontSize: s.px }}>Aa</button>)}
          </div>
        </div>

        <div className="stack" style={{ gap: 8 }}>
          <span className="label">Campaign</span>
          <div className="card">
            <b>{campaign?.name || 'Not joined'}</b>
            {mode === 'demo'
              ? <p className="small">Demo mode. Everything is saved on this device only.</p>
              : <p className="small">Saved on this phone, so it works without internet. New reveals arrive whenever you&rsquo;re online.</p>}
            <div className="row" style={{ flexWrap: 'wrap' }}>
              <Link to="/dm" className="btn ghost small">DM mode</Link>
              {mode === 'firebase' && campaign && <ConfirmButton onConfirm={() => { leave(); nav('/join'); }}>Leave campaign</ConfirmButton>}
              {mode === 'demo' && <ConfirmButton onConfirm={resetDemo}>Reset demo content</ConfirmButton>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useHub } from '../lib/store.jsx';

const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
const PATHS = {
  book: <><path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2V5z" /><path d="M4 20a2 2 0 0 0 2 1h13v-3" /></>,
  person: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
  d20: <><path d="M12 2.5l8.5 4.9v9.2L12 21.5l-8.5-4.9V7.4z" /><path d="M12 2.5L7.5 10h9z" /><path d="M7.5 10L12 21.5 16.5 10" /><path d="M3.5 7.4l4 2.6M20.5 7.4l-4 2.6" /></>,
  map: <><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /></>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.5-.8 1.5-1.5 0-1.2-1-1.6-1-2.7 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-4-4-7.2-9-7.2z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7.5" r="1" /></>,
  quill: <><path d="M20 3c-7 0-12 5-13 13l-3 5" /><path d="M7 16c5 0 9-3 10-9" /><path d="M11 12l-3 1" /></>,
  check: <path d="M5 12l5 5L20 7" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.6v.4" /><path d="M12 17h.01" /></>,
  back: <path d="M15 5l-7 7 7 7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></>,
  cloud: <><path d="M7 18a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 8a4 4 0 0 1 0 8h-1" /><path d="M12 12v8M9 17l3 3 3-3" /></>,
  offline: <><path d="M7 18a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 8a4 4 0 0 1 0 8H7" /><path d="M4 4l16 16" /></>,
  trash: <><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
  x: <path d="M6 6l12 12M18 6L6 18" />,
};
export function Icon({ name, size = 22, style }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style={style} {...P}>{PATHS[name]}</svg>;
}
export function Sparkle({ size = 14 }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style={{ fill: 'currentColor' }}><path d="M12 3l1.8 6.2L20 12l-6.2 1.8L12 21l-1.8-7.2L4 12l6.2-2.8z" /></svg>;
}
export const Ornament = () => <div className="ornament" aria-hidden="true"><span /><Sparkle /><span /></div>;

export function Nav() {
  return (
    <nav className="nav" aria-label="Main">
      <NavLink to="/options"><Icon name="book" size={24} /><span>Options</span></NavLink>
      <NavLink to="/character"><Icon name="person" size={24} /><span>Character</span></NavLink>
      <NavLink to="/rolls"><Icon name="d20" size={24} /><span>Rolls</span></NavLink>
      <button type="button" disabled style={{ opacity: 0.55 }}><Icon name="map" size={24} /><span>World · soon</span></button>
    </nav>
  );
}

export function SyncStatus() {
  const { mode, online, pending, isOwner } = useHub();
  if (mode === 'demo') return <div className="status"><Icon name="check" size={14} /><span>Demo · saved on this device</span></div>;
  if (pending > 0 && isOwner) return <div className="status"><Icon name="cloud" size={14} /><span>{pending} change{pending > 1 ? 's' : ''} waiting · will sync when online</span></div>;
  if (!online) return <div className="status"><Icon name="offline" size={14} /><span>Offline · everything still works</span></div>;
  return <div className="status"><Icon name="check" size={14} /><span>Saved on this phone · works offline</span></div>;
}

export function Header({ eyebrow, title, children, tools = true }) {
  const { campaign } = useHub();
  return (
    <header className="top">
      <div className="top-row">
        <div className="stack" style={{ gap: 4 }}>
          <div className="eyebrow">{eyebrow ?? campaign?.name ?? ''}</div>
          <h1 className="title">{title}</h1>
        </div>
        {tools && (
          <div className="row" style={{ gap: 2 }}>
            <NavLink to="/settings" className="icon-btn" aria-label="Settings and theme"><Icon name="palette" /></NavLink>
            <NavLink to="/dm" className="icon-btn" aria-label="DM mode"><Icon name="quill" /></NavLink>
          </div>
        )}
      </div>
      {children}
    </header>
  );
}

export function BackLink({ label = 'Back', to }) {
  const nav = useNavigate();
  return <button type="button" className="back" onClick={() => (to ? nav(to) : nav(-1))}><Icon name="back" size={20} /><span>{label}</span></button>;
}

// A subtle "?" that reveals one short explanation.
export function useToggle(initial = null) {
  const [open, setOpen] = useState(initial);
  return [open, (id) => setOpen((cur) => (cur === id ? null : id))];
}
export function HelpButton({ open, onClick, label }) {
  return <button type="button" className="help" aria-expanded={open} aria-label={label} onClick={onClick}><Icon name="help" size={19} /></button>;
}

// A button that asks for a second tap instead of a pop-up.
export function ConfirmButton({ children, confirmText = 'Tap again to confirm', onConfirm, className = 'btn ghost small', style }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), 4000); return () => clearTimeout(t); }, [armed]);
  return (
    <button type="button" className={className} style={{ ...style, ...(armed ? { borderColor: 'var(--warn)', color: 'var(--warn)' } : null) }}
      onClick={() => { if (armed) { setArmed(false); onConfirm(); } else setArmed(true); }}>
      <span aria-live="polite">{armed ? confirmText : children}</span>
    </button>
  );
}

export function Switch({ on, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className="switch" onClick={() => onChange(!on)}>
      <span className="state">{on ? 'Visible' : 'Hidden'}</span>
      <span className="track"><span className="knob" /></span>
    </button>
  );
}

export function Picture({ src, alt, height = 200, label = 'No picture yet', className = 'picture', style }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className={className} style={{ height, ...style }}>
      {src && !broken
        ? <img src={src} alt={alt} onError={() => setBroken(true)} />
        : <div className="stack" style={{ alignItems: 'center', gap: 6, fontSize: '0.8rem', textAlign: 'center', padding: 8 }}><Icon name="image" size={height > 80 ? 28 : 18} />{height > 80 && <span>{broken ? 'Picture couldn’t load' : label}</span>}</div>}
    </div>
  );
}

// Paste an image address (e.g. from Pinterest) or upload a photo.
export function ImagePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const onFile = (file) => {
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 640, scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      onChange(canvas.toDataURL('image/jpeg', 0.82));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };
  return (
    <div className="stack">
      <label className="field">
        <span>Picture link</span>
        <input className="input" type="url" inputMode="url" placeholder="Paste an image address" value={value?.startsWith('data:') ? '' : value || ''} onChange={(e) => onChange(e.target.value.trim())} />
      </label>
      <div className="between">
        <label className="btn ghost small" style={{ cursor: 'pointer' }}>
          Upload a photo
          <input type="file" accept="image/*" className="sr" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        <button type="button" className="help" aria-expanded={open} aria-label="How to use a Pinterest picture" onClick={() => setOpen(!open)}><Icon name="help" size={19} /></button>
      </div>
      {open && <p className="why">On Pinterest, open the pin, press and hold the picture, and choose <b>Copy Image Address</b> (or <b>Copy Image</b> on iPhone, then save and upload it). Paste the address above. A regular pin link won&rsquo;t show a picture.</p>}
      {value && <button type="button" className="link-btn" style={{ alignSelf: 'flex-start' }} onClick={() => onChange('')}>Remove picture</button>}
    </div>
  );
}

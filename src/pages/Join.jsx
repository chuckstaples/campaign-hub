import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useHub } from '../lib/store.jsx';
import { Ornament } from '../components/ui.jsx';

export default function Join() {
  const { mode, campaignId, join, ready } = useHub();
  const nav = useNavigate();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  if (mode === 'demo' || campaignId) return <Navigate to="/options" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true); setErr('');
    const problem = await join(code);
    setBusy(false);
    if (problem) setErr(problem); else nav('/options', { replace: true });
  };

  return (
    <div className="shell">
      <div className="page" style={{ justifyContent: 'center', paddingTop: '2rem' }}>
        <div className="stack" style={{ gap: 8, textAlign: 'center' }}>
          <div className="eyebrow">The Campaign Hub</div>
          <h1 className="title">Join your party</h1>
          <p className="lede">Type the code your DM gave you.</p>
        </div>
        <Ornament />
        <form className="stack" onSubmit={submit}>
          <label className="field">
            <span>Campaign code</span>
            <input className="input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} autoCapitalize="characters" autoComplete="off" maxLength={8}
              style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.2em', fontWeight: 700 }} placeholder="ABC123" />
          </label>
          {err && <p className="why" role="alert">{err}</p>}
          <button className="btn" disabled={busy || !ready || !code.trim()}>{busy ? 'Joining…' : 'Join'}</button>
        </form>
        <p className="small" style={{ textAlign: 'center' }}>You need internet the first time. After that, the hub works offline at the table.</p>
        <Link to="/dm" className="small" style={{ textAlign: 'center', color: 'var(--accent)', fontWeight: 600, padding: 12 }}>I&rsquo;m the DM</Link>
      </div>
    </div>
  );
}

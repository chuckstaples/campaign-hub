import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHub } from '../lib/store.jsx';
import { BackLink, ConfirmButton, Icon, Ornament, Switch, SyncStatus } from '../components/ui.jsx';
import { KINDS } from './Options.jsx';
import { WORLD_KINDS, allFacts } from '../lib/world.js';

export default function DM() {
  const hub = useHub();
  if (!hub.ready) return <div className="shell"><p className="lede" style={{ padding: '2rem 1.25rem' }}>Opening…</p></div>;
  if (hub.mode === 'firebase' && !hub.user) return <SignIn />;
  if (hub.mode === 'firebase' && !hub.isOwner) return <PickCampaign />;
  return <Manage />;
}

function SignIn() {
  const { signIn, online } = useHub();
  const [err, setErr] = useState('');
  return (
    <div className="shell">
      <div className="page" style={{ paddingTop: '0.6rem' }}>
        <BackLink />
        <h1 className="title">DM mode</h1>
        <p className="lede">Sign in to add and edit content and choose what players can see. Players never need to sign in.</p>
        {!online && <p className="why">You need internet to sign in the first time.</p>}
        {err && <p className="why" role="alert">{err}</p>}
        <button type="button" className="btn" onClick={() => signIn().catch((e) => setErr(e?.code === 'auth/popup-closed-by-user' ? '' : 'Sign-in didn’t work. Try again.'))}>Sign in with Google</button>
      </div>
    </div>
  );
}

function PickCampaign() {
  const { myCampaigns, openCampaign, createCampaign, deleteCampaign, user, signOut, campaign } = useHub();
  const [list, setList] = useState(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => { myCampaigns().then(setList).catch(() => setList([])); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const create = async (e) => {
    e.preventDefault(); if (!name.trim()) return;
    setBusy(true); setErr('');
    try { const id = await createCampaign(name.trim()); openCampaign(id); }
    catch (x) { console.error(x); setErr('Couldn’t create it. Check your internet and try again.'); }
    setBusy(false);
  };

  return (
    <div className="shell">
      <div className="page" style={{ paddingTop: '0.6rem' }}>
        <BackLink />
        <h1 className="title">Your campaigns</h1>
        {campaign && <p className="why">This phone is joined to &ldquo;{campaign.name}&rdquo;, which belongs to a different account.</p>}
        {list === null && <p className="lede">Loading…</p>}
        {list?.map((c) => (
          <div key={c.id} className="stack" style={{ gap: 6 }}>
            <button type="button" className="pick" onClick={() => openCampaign(c.id)}>
              <span className="grow stack" style={{ gap: 2 }}><span className="card-title" style={{ fontSize: '1.3rem' }}>{c.name}</span><span className="small">Code {c.code}</span></span>
              <Icon name="back" style={{ transform: 'rotate(180deg)', color: 'var(--muted)' }} />
            </button>
            <ConfirmButton className="link-btn" style={{ alignSelf: 'flex-end', minHeight: 36 }} confirmText="Tap again to delete it for good"
              onConfirm={() => deleteCampaign(c.id).then(() => setList(list.filter((x) => x.id !== c.id))).catch(() => setErr('Couldn\u2019t delete it. Check your internet and try again.'))}>
              Delete {c.name}
            </ConfirmButton>
          </div>
        ))}
        <form className="card" onSubmit={create}>
          <h2 className="h2" style={{ fontSize: '1.3rem' }}>Start a new campaign</h2>
          <p className="small">It comes loaded with races, backgrounds and classes, all hidden until you reveal them.</p>
          <label className="field"><span>Campaign name</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Shadows over Baldur's Gate" /></label>
          {err && <p className="why" role="alert">{err}</p>}
          <button className="btn" disabled={busy || !name.trim()}>{busy ? 'Setting it up…' : 'Create campaign'}</button>
        </form>
        <p className="small">Signed in as {user?.email}. <button type="button" className="link-btn" style={{ minHeight: 0 }} onClick={signOut}>Sign out</button></p>
      </div>
    </div>
  );
}

function Manage() {
  const { entries, secrets, campaign, setVisible, mode, signOut, user, deleteCampaign } = useHub();
  const [delErr, setDelErr] = useState('');
  const nav = useNavigate();
  const remember = (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } };
  const [section, setSection] = useState(() => sessionStorage.getItem('hub.dmsection') || 'options');
  const [kind, setKind] = useState(() => sessionStorage.getItem('hub.dmtab') || 'race');
  const [q, setQ] = useState('');
  const [copied, setCopied] = useState(false);
  const isWorld = section === 'world';
  const kinds = isWorld ? WORLD_KINDS : KINDS;
  const curKind = kinds.some((k) => k.id === kind) ? kind : kinds[0].id;
  const pickKind = (k) => { setKind(k); remember('hub.dmtab', k); };
  const pickSection = (sct) => {
    if (sct === 'combat') { nav('/dm/combat'); return; }
    setSection(sct); remember('hub.dmsection', sct);
    const first = (sct === 'world' ? WORLD_KINDS : KINDS)[0].id; setKind(first); remember('hub.dmtab', first); setQ('');
  };
  const all = entries.filter((e) => e.kind === curKind);
  const list = all.filter((e) => !q.trim() || e.name.toLowerCase().includes(q.trim().toLowerCase()));
  const shown = all.filter((e) => e.visible).length;
  const one = kinds.find((k) => k.id === curKind).one;
  const factLine = (e) => {
    const facts = allFacts(e, secrets[e.id]);
    if (!facts.length) return e.summary || 'No connections or notes yet';
    return `${facts.filter((f) => f.revealed).length} of ${facts.length} things revealed`;
  };

  const share = async () => {
    const url = `${location.origin}${location.pathname}#/join`;
    const text = `Join our campaign hub: ${url}\nCode: ${campaign.code}`;
    try {
      if (navigator.share) await navigator.share({ title: campaign.name, text });
      else { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch { /* cancelled */ }
  };

  return (
    <div className="shell">
      <div className="dm-band">
        <span className="row" style={{ gap: 8, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}><Icon name="quill" size={16} />DM mode · only you see this</span>
        <Link to="/options" style={{ minHeight: 44, display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '0.8rem', fontWeight: 600 }}>Player view</Link>
      </div>
      <header className="top">
        <h1 className="title">Your content</h1>
        {mode === 'firebase' && campaign && (
          <div className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <div className="grow stack" style={{ gap: 2 }}><span className="label">Players join with</span><span className="code">{campaign.code}</span></div>
            <button type="button" className="btn small" onClick={share}>{copied ? 'Copied' : 'Share'}</button>
          </div>
        )}
        {mode === 'demo' && <p className="banner" style={{ margin: 0 }}>Demo mode: anyone on this device can edit. Connecting Firebase adds your sign-in and a join code for players.</p>}
        <div className="seg" aria-label="Section">
          <button type="button" aria-pressed={section === 'options'} onClick={() => pickSection('options')}>Options</button>
          <button type="button" aria-pressed={isWorld} onClick={() => pickSection('world')}>World</button>
          <button type="button" aria-pressed={false} onClick={() => pickSection('combat')}>Combat</button>
        </div>
        <div className="wrap" style={{ gap: 8 }}>{kinds.map((k) => <button key={k.id} type="button" className="chip" aria-pressed={curKind === k.id} onClick={() => pickKind(k.id)}>{k.label}</button>)}</div>
        <div className="between">
          <span className="small">Players can see <b style={{ color: 'var(--ink)' }}>{shown}</b> of {all.length}</span>
          <button type="button" className="btn small" onClick={() => nav(`/dm/new/${curKind}`)}><Icon name="plus" size={16} />New {one}</button>
        </div>
        <label className="search">
          <Icon name="search" size={18} style={{ color: 'var(--muted)' }} />
          <span className="sr">Search</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${kinds.find((k) => k.id === curKind).label.toLowerCase()}`} />
        </label>
        {!isWorld && (
          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="btn ghost small" style={{ flex: 1 }} onClick={() => setVisible(list.map((e) => e.id), true)}>Show all{q ? ' found' : ''}</button>
            <button type="button" className="btn ghost small" style={{ flex: 1 }} onClick={() => setVisible(list.map((e) => e.id), false)}>Hide all{q ? ' found' : ''}</button>
          </div>
        )}
        {isWorld && <p className="small">Tap an entry to reveal its connections and notes one at a time.</p>}
      </header>
      <div className="page" style={{ paddingTop: '0.25rem', gap: '0.5rem' }}>
        {list.map((e) => (
          <div key={e.id} className={`list-row${e.source === 'Homebrew' && !isWorld ? ' draft' : ''}`}>
            <button type="button" className="grow stack" style={{ gap: 2, minHeight: 44, border: 'none', background: 'none', padding: 0, textAlign: 'left', justifyContent: 'center' }} aria-label={isWorld ? `Open ${e.name}` : `Edit ${e.name}`} onClick={() => nav(isWorld ? `/world/${e.id}` : `/dm/edit/${e.id}`)}>
              <span className="card-title" style={{ fontSize: '1.2rem' }}>{e.name}</span>
              {isWorld
                ? <span className="small" style={{ fontSize: '0.72rem' }}>{factLine(e)}</span>
                : <span className="small" style={{ fontSize: '0.72rem', color: e.source === 'Homebrew' ? 'var(--warn)' : 'var(--muted)' }}>{e.source || 'Official'} · tap to edit</span>}
            </button>
            <Switch on={!!e.visible} onChange={(v) => setVisible([e.id], v)} label={`Visible to players: ${e.name}`} />
          </div>
        ))}
        {list.length === 0 && <p className="lede" style={{ textAlign: 'center', padding: '1.5rem 0' }}>Nothing here yet.{isWorld ? ` Tap New ${one} to add one.` : ''}</p>}
        <Ornament />
        {mode === 'firebase' && campaign && (
          <div className="card dashed" style={{ alignItems: 'center', textAlign: 'center' }}>
            <span className="small">Deleting removes this campaign and everything in it for every player. It can&rsquo;t be undone.</span>
            {delErr && <p className="why" role="alert">{delErr}</p>}
            <ConfirmButton className="btn danger small" confirmText="Tap again to delete for good"
              onConfirm={() => deleteCampaign(campaign.id).then(() => nav('/dm')).catch(() => setDelErr('Couldn\u2019t delete it. Check your internet and try again.'))}>
              Delete this campaign
            </ConfirmButton>
          </div>
        )}
        {mode === 'firebase' && <p className="small" style={{ textAlign: 'center' }}>Signed in as {user?.email} · <button type="button" className="link-btn" style={{ minHeight: 0 }} onClick={signOut}>Sign out</button></p>}
      </div>
      <div className="footer" style={{ alignItems: 'center' }}><SyncStatus /></div>
    </div>
  );
}

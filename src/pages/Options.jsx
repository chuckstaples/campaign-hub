import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useHub } from '../lib/store.jsx';
import { Header, Icon, Nav, Ornament, SyncStatus } from '../components/ui.jsx';

export const KINDS = [
  { id: 'race', label: 'Races', one: 'race' },
  { id: 'background', label: 'Backgrounds', one: 'background' },
  { id: 'class', label: 'Classes', one: 'class' },
];

const FILTERS = {
  race: [
    { id: 'dark', label: 'Darkvision', test: (e) => /darkvision/i.test(e.senses || '') },
    { id: 'fly', label: 'Can fly', test: (e) => /fly/i.test(e.speed || '') },
    { id: 'small', label: 'Can be Small', test: (e) => /small/i.test(e.size || '') },
    { id: 'magic', label: 'Innate magic', test: (e) => (e.traits || []).some((t) => /cantrip|cast /i.test(t.text)) },
  ],
  background: [],
  class: [
    { id: 'caster', label: 'Casts spells', test: (e) => !!e.casting },
    { id: 'tough', label: 'Big hit die (d10+)', test: (e) => Number(e.hitDie) >= 10 },
  ],
};

export function metaLine(e) {
  if (e.kind === 'race') return [e.size, e.speed].filter(Boolean).join(' · ');
  if (e.kind === 'background') return (e.skills || []).join(', ');
  if (e.kind === 'class') return `d${e.hitDie} hit die${e.casting ? ` · casts with ${e.casting}` : ''}`;
  return '';
}
export function chips(e) {
  if (e.kind === 'race') return (e.traits || []).map((t) => t.name).filter((n) => n !== 'Languages').slice(0, 4);
  if (e.kind === 'background') return (e.abilities || []).map((a) => `+ ${a}`);
  if (e.kind === 'class') return (e.traits || []).map((t) => t.name).slice(0, 3);
  return [];
}

export default function Options() {
  const { visibleEntries, entriesReady, mode } = useHub();
  const [kind, setKind] = useState(() => sessionStorage.getItem('hub.tab') || 'race');
  const [q, setQ] = useState('');
  const [on, setOn] = useState({});
  const pickKind = (k) => { setKind(k); setOn({}); try { sessionStorage.setItem('hub.tab', k); } catch { /* ignore */ } };

  const filters = FILTERS[kind];
  const all = visibleEntries.filter((e) => e.kind === kind);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return all.filter((e) => filters.every((f) => !on[f.id] || f.test(e))
      && (!s || [e.name, e.summary, ...(e.traits || []).map((t) => t.name + ' ' + t.text), ...(e.skills || [])].join(' ').toLowerCase().includes(s)));
  }, [all, q, on, filters]);
  const kindLabel = KINDS.find((k) => k.id === kind);
  const anyFilter = q || Object.values(on).some(Boolean);

  return (
    <div className="shell">
      <Header title="Character Options"><SyncStatus /></Header>
      {mode === 'demo' && <p className="banner">Demo mode: this is saved on this device only. Connecting Firebase turns on syncing between phones.</p>}
      <div style={{ padding: '0.5rem 1.25rem 0' }}>
        <div className="seg">
          {KINDS.map((k) => <button key={k.id} type="button" aria-pressed={kind === k.id} onClick={() => pickKind(k.id)}>{k.label}</button>)}
        </div>
      </div>
      <div className="stack" style={{ padding: '0.85rem 1.25rem 0.25rem', gap: '0.6rem' }}>
        <label className="search">
          <Icon name="search" size={18} style={{ color: 'var(--muted)' }} />
          <span className="sr">Search {kindLabel.label.toLowerCase()}</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search names or traits" />
        </label>
        {filters.length > 0 && (
          <div className="wrap" style={{ gap: 8 }}>
            {filters.map((f) => <button key={f.id} type="button" className="chip" aria-pressed={!!on[f.id]} onClick={() => setOn({ ...on, [f.id]: !on[f.id] })}>{f.label}</button>)}
          </div>
        )}
        <div className="between small" style={{ minHeight: 24 }}>
          <span>{all.length ? `Showing ${list.length} of ${all.length}` : ''}</span>
          {anyFilter && <button type="button" className="link-btn" style={{ minHeight: 32, color: 'var(--warn)' }} onClick={() => { setQ(''); setOn({}); }}>Clear filters</button>}
        </div>
      </div>
      <div className="page" style={{ paddingTop: '0.4rem', gap: '0.75rem' }}>
        {list.map((e) => (
          <Link key={e.id} to={`/entry/${e.id}`} className="card">
            <div className="stack" style={{ gap: 2 }}>
              <span className="card-title">{e.name}</span>
              <span className="card-meta">{metaLine(e)}</span>
            </div>
            {e.summary && <span className="card-body">{e.summary}</span>}
            <div className="wrap" style={{ marginTop: 2 }}>{chips(e).map((c) => <span key={c} className="tag">{c}</span>)}</div>
          </Link>
        ))}
        {entriesReady && all.length === 0 && (
          <div className="card dashed" style={{ alignItems: 'center', textAlign: 'center', padding: '1.75rem 1rem' }}>
            <span className="card-title">Nothing here yet</span>
            <span className="card-body">Your DM hasn&rsquo;t revealed any {kindLabel.label.toLowerCase()} yet.</span>
          </div>
        )}
        {all.length > 0 && list.length === 0 && <p className="lede" style={{ textAlign: 'center', fontStyle: 'italic', padding: '1.5rem 0' }}>Nothing matches all of those. Try removing a filter.</p>}
        <Ornament />
      </div>
      <Nav />
    </div>
  );
}

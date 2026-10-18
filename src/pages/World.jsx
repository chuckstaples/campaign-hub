import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useHub } from '../lib/store.jsx';
import { Header, Icon, Nav, Ornament, Picture, SyncStatus } from '../components/ui.jsx';
import { WORLD_KINDS } from '../lib/world.js';

export default function World() {
  const { visibleEntries, entriesReady } = useHub();
  const [kind, setKind] = useState(() => sessionStorage.getItem('hub.worldtab') || 'npc');
  const [q, setQ] = useState('');
  const pick = (k) => { setKind(k); setQ(''); try { sessionStorage.setItem('hub.worldtab', k); } catch { /* ignore */ } };
  const meta = WORLD_KINDS.find((w) => w.id === kind);
  const all = visibleEntries.filter((e) => e.kind === kind);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return all;
    return all.filter((e) => [e.name, e.summary, e.description, ...(e.facts || []).map((f) => f.text)].join(' ').toLowerCase().includes(s));
  }, [all, q]);

  return (
    <div className="shell">
      <Header title="The World"><SyncStatus /></Header>
      <div style={{ padding: '0.5rem 1.25rem 0' }}>
        <div className="seg">{WORLD_KINDS.map((w) => <button key={w.id} type="button" aria-pressed={kind === w.id} onClick={() => pick(w.id)}>{w.label}</button>)}</div>
      </div>
      {all.length > 4 && (
        <div style={{ padding: '0.85rem 1.25rem 0' }}>
          <label className="search">
            <Icon name="search" size={18} style={{ color: 'var(--muted)' }} />
            <span className="sr">Search {meta.label.toLowerCase()}</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${meta.label.toLowerCase()}`} />
          </label>
        </div>
      )}
      <div className="page" style={{ paddingTop: '0.85rem', gap: '0.75rem' }}>
        {list.map((e) => (
          <Link key={e.id} to={`/world/${e.id}`} className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.85rem' }}>
            {e.image
              ? <Picture src={e.image} alt="" height={60} style={{ width: 60, borderRadius: 12, flexShrink: 0 }} />
              : <span aria-hidden="true" className="picture" style={{ width: 60, height: 60, borderRadius: 12, flexShrink: 0, fontFamily: 'var(--head)', fontSize: '1.6rem', color: 'var(--deco)' }}>{e.name.slice(0, 1)}</span>}
            <span className="stack grow" style={{ gap: 2 }}>
              <span className="card-title">{e.name}</span>
              {e.summary && <span className="card-meta">{e.summary}</span>}
              {(e.facts || []).length > 0 && <span className="card-meta" style={{ color: 'var(--accent)', fontWeight: 600 }}>{e.facts.length} thing{e.facts.length > 1 ? 's' : ''} learned</span>}
            </span>
          </Link>
        ))}
        {entriesReady && all.length === 0 && (
          <div className="card dashed" style={{ alignItems: 'center', textAlign: 'center', padding: '1.75rem 1rem' }}>
            <span className="card-title">No {meta.plural} yet</span>
            <span className="card-body">As your party meets {kind === 'npc' ? 'people' : kind === 'place' ? 'new places' : 'old stories'}, your DM will add them here.</span>
          </div>
        )}
        {all.length > 0 && list.length === 0 && <p className="lede" style={{ textAlign: 'center', fontStyle: 'italic', padding: '1.5rem 0' }}>Nothing matches that.</p>}
        <Ornament />
      </div>
      <Nav />
    </div>
  );
}

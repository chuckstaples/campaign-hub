import { Link, useNavigate, useParams } from 'react-router-dom';
import { useHub } from '../lib/store.jsx';
import { BackLink, Icon, Nav, Picture, Switch } from '../components/ui.jsx';
import { allFacts, toggleFact, worldKind } from '../lib/world.js';

// One fact line: a note, or a connection that links to another entry.
function FactLine({ fact, target, canSee }) {
  return (
    <span style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
      {fact.text}
      {fact.type === 'connection' && target && canSee && (
        <> {fact.text ? '' : 'Connected to '}<Link to={`/world/${target.id}`} style={{ fontWeight: 600 }}>{target.name}</Link></>
      )}
    </span>
  );
}

export default function WorldDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { entries, isOwner, secrets, saveWithSecret, setVisible } = useHub();
  const e = entries.find((x) => x.id === id && (x.visible || isOwner));
  if (!e) return <div className="shell"><div className="page" style={{ paddingTop: '1rem' }}><BackLink /><p className="lede">This isn&rsquo;t available.</p></div><Nav /></div>;

  const kind = worldKind(e.kind);
  const byId = Object.fromEntries(entries.map((x) => [x.id, x]));
  const canSee = (t) => !!t && (t.visible || isOwner);
  const secret = secrets[e.id];
  const facts = isOwner ? allFacts(e, secret) : (e.facts || []).map((f) => ({ ...f, revealed: true }));

  // Revealed connections on other entries that point here.
  const pointing = entries.filter((x) => x.id !== e.id && x.visible && (x.facts || []).some((f) => f.type === 'connection' && f.linkId === e.id));

  const flip = (factId, revealed) => {
    const next = toggleFact(e, secret, factId, revealed);
    saveWithSecret(next.entry, next.secret);
  };

  return (
    <div className="shell">
      <div className="page" style={{ paddingTop: '0.6rem', gap: '1.1rem' }}>
        <div className="between">
          <BackLink label={kind.label} to="/world" />
          {isOwner && <button type="button" className="btn ghost small" onClick={() => nav(`/dm/edit/${e.id}`)}>Edit</button>}
        </div>

        {isOwner && (
          <div className="card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.4rem 0.4rem 1rem' }}>
            <span className="small" style={{ color: 'var(--ink)', fontWeight: 600 }}>Players can see this {kind.one}</span>
            <Switch on={!!e.visible} onChange={(v) => setVisible([e.id], v)} label={`Reveal ${e.name} to players`} />
          </div>
        )}

        {e.image && <Picture src={e.image} alt={e.name} height={220} />}
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="title" style={{ fontSize: '2.4rem' }}>{e.name}</h1>
          {e.summary && <p style={{ fontStyle: 'italic', color: 'var(--muted)', lineHeight: 1.5 }}>{e.summary}</p>}
        </div>
        {e.description && <p style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{e.description}</p>}

        {(facts.length > 0 || isOwner) && (
          <div className="stack" style={{ gap: '0.6rem' }}>
            <h2 className="h2">{isOwner ? 'Things to discover' : 'What you’ve learned'}</h2>
            {isOwner && <p className="small">Flip a switch when the party discovers it.</p>}
            {facts.map((f) => (
              <div key={f.id} className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: isOwner ? '0.5rem 0.4rem 0.5rem 1rem' : undefined, borderStyle: isOwner && !f.revealed ? 'dashed' : undefined }}>
                <span className="grow stack" style={{ gap: 2 }}>
                  <span className="label" style={{ fontSize: '0.62rem' }}>{f.type === 'connection' ? 'Connection' : 'Note'}</span>
                  <FactLine fact={f} target={byId[f.linkId]} canSee={canSee(byId[f.linkId])} />
                </span>
                {isOwner && <Switch on={f.revealed} onChange={(v) => flip(f.id, v)} label={`Reveal: ${f.text || 'connection'}`} />}
              </div>
            ))}
            {isOwner && facts.length === 0 && <p className="small">Nothing yet. Tap Edit to add connections and notes.</p>}
          </div>
        )}

        {pointing.length > 0 && (
          <div className="stack" style={{ gap: '0.5rem' }}>
            <span className="label">Linked from</span>
            <div className="wrap">{pointing.map((x) => <Link key={x.id} to={`/world/${x.id}`} className="tag" style={{ textDecoration: 'none', fontSize: '0.85rem', padding: '6px 12px' }}>{x.name}</Link>)}</div>
          </div>
        )}

        {isOwner && secret?.dmNotes && (
          <div className="soft">
            <span className="row" style={{ gap: 6, fontWeight: 600 }}><Icon name="quill" size={16} />Your private notes</span>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '0.9rem' }}>{secret.dmNotes}</p>
          </div>
        )}
      </div>
      <Nav />
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHub } from '../lib/store.jsx';
import { BackLink, ConfirmButton, Icon, ImagePicker, Picture, Switch } from '../components/ui.jsx';
import { newId } from '../lib/seed.js';
import { WORLD_KINDS, allFacts, isWorldKind, newFactId, splitFacts, worldKind } from '../lib/world.js';

const Field = ({ label, hint, children }) => <label className="field"><span>{label}</span>{children}{hint && <span className="small" style={{ fontWeight: 400 }}>{hint}</span>}</label>;

const PLACEHOLDERS = {
  npc: { summary: 'e.g. Innkeeper of the Gilded Goose', description: 'What the party sees and knows when they meet them' },
  place: { summary: 'e.g. A river town on the Sword Coast', description: 'What it looks like and what the party knows about it' },
  lore: { summary: 'e.g. A local legend', description: 'The story as the party first hears it' },
};

export default function WorldEdit() {
  const { id, kind: newKind } = useParams();
  const { entries, secrets, isOwner, saveWithSecret, deleteEntry } = useHub();
  const nav = useNavigate();
  const existing = entries.find((x) => x.id === id);
  const kind = existing?.kind || newKind;
  const [e, setE] = useState(() => existing || {
    id: newId(newKind), kind: newKind, name: '', summary: '', description: '', image: '', visible: false, source: 'Homebrew', facts: [],
  });
  const [facts, setFacts] = useState(() => allFacts(existing, secrets[id]));
  const [dmNotes, setDmNotes] = useState(() => secrets[id]?.dmNotes || '');

  if (!isOwner) return <div className="shell"><div className="page" style={{ paddingTop: '0.6rem' }}><BackLink /><p className="lede">Only the DM can edit.</p></div></div>;
  if ((id && !existing) || !isWorldKind(kind)) return <div className="shell"><div className="page" style={{ paddingTop: '0.6rem' }}><BackLink /><p className="lede">Not found.</p></div></div>;

  const meta = worldKind(kind);
  const ph = PLACEHOLDERS[kind];
  const up = (patch) => setE((cur) => ({ ...cur, ...patch }));
  const setFact = (fid, patch) => setFacts((list) => list.map((f) => (f.id === fid ? { ...f, ...patch } : f)));
  const addFact = (type) => setFacts((list) => [...list, { id: newFactId(), type, text: '', linkId: '', revealed: false }]);
  const others = entries.filter((x) => isWorldKind(x.kind) && x.id !== e.id).sort((a, b) => a.name.localeCompare(b.name));

  const save = () => {
    const { shown, hidden } = splitFacts(facts);
    const entry = { ...e, name: e.name.trim() || `Unnamed ${meta.one}`, facts: shown };
    saveWithSecret(entry, { ...(secrets[e.id] || {}), facts: hidden, dmNotes });
    nav(`/world/${entry.id}`, { replace: true });
  };

  return (
    <div className="shell">
      <div className="dm-band"><span className="row" style={{ gap: 8, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}><Icon name="quill" size={16} />{existing ? `Edit ${meta.one}` : `New ${meta.one}`}</span></div>
      <div className="page" style={{ paddingTop: '0.6rem', gap: '1.1rem' }}>
        <BackLink label="Cancel" />

        <div className="field"><span>Type</span>
          <div className="seg">{WORLD_KINDS.map((w) => <button key={w.id} type="button" aria-pressed={e.kind === w.id} onClick={() => up({ kind: w.id })}>{w.label}</button>)}</div>
        </div>

        <div className="soft">
          <div className="between">
            <span style={{ fontWeight: 600 }}>Revealed to players</span>
            <Switch on={!!e.visible} onChange={(v) => up({ visible: v })} label="Revealed to players" />
          </div>
          <span className="small" style={{ color: 'inherit' }}>Reveals the name, picture, one-liner and description together.</span>
        </div>

        <Field label="Name"><input className="input" value={e.name} onChange={(x) => up({ name: x.target.value })} /></Field>
        <Field label="One-liner"><input className="input" placeholder={ph.summary} value={e.summary || ''} onChange={(x) => up({ summary: x.target.value })} /></Field>
        <Field label="Description"><textarea className="input" style={{ minHeight: 120 }} placeholder={ph.description} value={e.description || ''} onChange={(x) => up({ description: x.target.value })} /></Field>

        <div className="stack">
          <span className="label">Picture</span>
          {e.image && <Picture src={e.image} alt="" height={170} />}
          <ImagePicker value={e.image} onChange={(image) => up({ image })} />
        </div>

        <div className="stack" style={{ gap: '0.75rem' }}>
          <h2 className="h2" style={{ fontSize: '1.3rem' }}>Things to discover</h2>
          <p className="small">Connections and notes stay hidden until you reveal each one. Players&rsquo; phones never receive hidden ones.</p>
          {facts.map((f) => (
            <div key={f.id} className="card" style={{ gap: 8, borderStyle: f.revealed ? 'solid' : 'dashed' }}>
              <div className="between">
                <span className="label">{f.type === 'connection' ? 'Connection' : 'Note'}</span>
                <div className="row" style={{ gap: 0 }}>
                  <Switch on={f.revealed} onChange={(v) => setFact(f.id, { revealed: v })} label="Revealed to players" />
                  <button type="button" className="icon-btn" aria-label="Remove" onClick={() => setFacts((list) => list.filter((x) => x.id !== f.id))}><Icon name="trash" size={19} /></button>
                </div>
              </div>
              {f.type === 'connection' ? (
                <>
                  <input className="input" aria-label="How they're connected" placeholder="How they're connected, e.g. Works for" value={f.text} onChange={(x) => setFact(f.id, { text: x.target.value })} />
                  <select className="input" aria-label="Connected to" value={f.linkId} onChange={(x) => setFact(f.id, { linkId: x.target.value })}>
                    <option value="">Pick who or what…</option>
                    {WORLD_KINDS.map((w) => {
                      const opts = others.filter((o) => o.kind === w.id);
                      return opts.length ? <optgroup key={w.id} label={w.label}>{opts.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</optgroup> : null;
                    })}
                  </select>
                  <span className="small">Players see the link only once that entry is revealed too.</span>
                </>
              ) : (
                <textarea className="input" aria-label="Note" placeholder="Something the party can learn" value={f.text} onChange={(x) => setFact(f.id, { text: x.target.value })} />
              )}
            </div>
          ))}
          <div className="row">
            <button type="button" className="btn ghost small" style={{ flex: 1 }} onClick={() => addFact('connection')}><Icon name="plus" size={16} />Connection</button>
            <button type="button" className="btn ghost small" style={{ flex: 1 }} onClick={() => addFact('note')}><Icon name="plus" size={16} />Note</button>
          </div>
        </div>

        <Field label="Private DM notes" hint="Only you ever see these.">
          <textarea className="input" style={{ minHeight: 100 }} placeholder="Secrets, plans, voice ideas…" value={dmNotes} onChange={(x) => setDmNotes(x.target.value)} />
        </Field>

        <button type="button" className="btn" onClick={save}>Save</button>
        {existing && <ConfirmButton className="btn danger" confirmText="Tap again to delete for good" onConfirm={() => { deleteEntry(e.id); nav('/dm', { replace: true }); }}>Delete</ConfirmButton>}
      </div>
    </div>
  );
}

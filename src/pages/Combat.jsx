import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useHub, LS } from '../lib/store.jsx';
import { BackLink, ConfirmButton, Icon } from '../components/ui.jsx';
import { sign } from '../lib/rules.js';

// The DM's combat tracker. The current fight is kept on this device, so it
// works with no connection. Saved monsters sync through the DM-only store.

const CONDITIONS = ['Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled', 'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious', 'Concentrating'];
const EMPTY = { round: 1, currentId: null, list: [], trackPlayers: false };
const uid = () => Math.random().toString(36).slice(2, 9);
const d20 = () => 1 + Math.floor(Math.random() * 20);
const num = (v, d = 0) => (v === '' || v == null || Number.isNaN(Number(v)) ? d : Number(v));

function order(list) {
  return [...list].sort((a, b) => (num(b.init, -99) - num(a.init, -99)) || (a.added - b.added));
}
const isDown = (c) => c.type === 'monster' && c.maxHp > 0 && c.hp <= 0;

export default function Combat() {
  const { isOwner, secrets, saveSecret, deleteSecret } = useHub();
  const [fight, setFight] = useState(() => ({ ...EMPTY, ...LS.get('hub.combat', {}) }));
  const [party, setParty] = useState(() => LS.get('hub.party', []));
  const [open, setOpen] = useState(null);
  const [adding, setAdding] = useState(() => (LS.get('hub.combat', {}).list?.length ? null : 'player'));
  useEffect(() => LS.set('hub.combat', fight), [fight]);
  useEffect(() => LS.set('hub.party', party), [party]);

  const sorted = useMemo(() => order(fight.list), [fight.list]);
  const saved = Object.entries(secrets).filter(([, v]) => v?.kind === 'monster').map(([id, v]) => ({ id, ...v })).sort((a, b) => a.name.localeCompare(b.name));

  if (!isOwner) return <div className="shell"><div className="page" style={{ paddingTop: '0.6rem' }}><BackLink /><p className="lede">Only the DM can use the combat tracker.</p></div></div>;

  const update = (fn) => setFight((f) => fn(f));
  const setC = (id, patch) => update((f) => ({ ...f, list: f.list.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const add = (items) => update((f) => {
    const now = Date.now();
    const list = [...f.list, ...items.map((it, i) => ({ id: uid(), added: now + i, conds: [], ...it }))];
    return { ...f, list, currentId: f.currentId || null };
  });
  const remove = (id) => update((f) => ({ ...f, list: f.list.filter((c) => c.id !== id), currentId: f.currentId === id ? null : f.currentId }));

  // Move to the next (or previous) creature still standing, wrapping into a new round.
  const step = (dir) => update((f) => {
    const ord = order(f.list);
    if (!ord.some((c) => !isDown(c))) return f;
    let idx = ord.findIndex((c) => c.id === f.currentId);
    let round = f.round;
    if (idx === -1) { const first = ord.find((c) => !isDown(c)); return { ...f, currentId: first.id }; }
    for (let i = 0; i < ord.length; i++) {
      idx += dir;
      if (idx >= ord.length) { idx = 0; round += 1; }
      if (idx < 0) { idx = ord.length - 1; round = Math.max(1, round - 1); }
      if (!isDown(ord[idx])) break;
    }
    return { ...f, currentId: ord[idx].id, round };
  });

  const current = sorted.find((c) => c.id === fight.currentId);
  const started = !!fight.currentId;

  return (
    <div className="shell">
      <div className="dm-band">
        <span className="row" style={{ gap: 8, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}><Icon name="quill" size={16} />Combat · only you see this</span>
        <Link to="/dm" style={{ minHeight: 44, display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '0.8rem', fontWeight: 600 }}>DM mode</Link>
      </div>

      <header className="top">
        <div className="between">
          <h1 className="title">Combat</h1>
          {fight.list.length > 0 && <span className="tag accent" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>Round {fight.round}</span>}
        </div>
        {current && <p className="small" style={{ color: 'var(--ink)' }}>Now: <b>{current.name}</b></p>}
      </header>

      <div className="page" style={{ paddingTop: '0.25rem', gap: '0.6rem' }}>
        {sorted.map((c) => {
          const now = c.id === fight.currentId;
          const showHp = c.type === 'monster' || fight.trackPlayers;
          const down = isDown(c);
          const expanded = open === c.id;
          return (
            <div key={c.id} className="card" style={{ padding: '0.55rem 0.6rem', gap: 6, borderWidth: now ? 2 : 1, borderColor: now ? 'var(--accent)' : 'var(--line)', opacity: down ? 0.55 : 1 }}>
              <div className="row" style={{ gap: 10 }}>
                <label style={{ flexShrink: 0 }}>
                  <span className="sr">Initiative for {c.name}</span>
                  <input className="input" type="number" inputMode="numeric" value={c.init} onChange={(x) => setC(c.id, { init: x.target.value })}
                    style={{ width: 54, minHeight: 44, padding: 0, textAlign: 'center', fontWeight: 700, fontSize: '1.05rem' }} />
                </label>
                <button type="button" className="grow stack" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : c.id)}
                  style={{ gap: 3, border: 'none', background: 'none', padding: 0, textAlign: 'left', minHeight: 44, justifyContent: 'center', minWidth: 0 }}>
                  <span className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '1rem', textDecoration: down ? 'line-through' : 'none' }}>{c.name}</span>
                    {now && <span className="tag accent" style={{ fontSize: '0.65rem', padding: '2px 7px' }}>Now</span>}
                    {down && <span className="tag" style={{ fontSize: '0.65rem', padding: '2px 7px' }}>Down</span>}
                    {c.type === 'player' && <span className="tag" style={{ fontSize: '0.65rem', padding: '2px 7px' }}>Player</span>}
                  </span>
                  {showHp && c.maxHp > 0 && (
                    <span className="row" style={{ gap: 8 }}>
                      <span style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--track)', overflow: 'hidden', maxWidth: 140 }}>
                        <span style={{ display: 'block', height: '100%', width: `${Math.max(0, Math.min(100, (c.hp / c.maxHp) * 100))}%`, background: c.hp <= c.maxHp / 3 ? 'var(--warn)' : 'var(--accent)' }} />
                      </span>
                      <span className="small" style={{ fontSize: '0.78rem', color: 'var(--ink)' }}>{c.hp} / {c.maxHp} HP{c.ac ? ` · AC ${c.ac}` : ''}</span>
                    </span>
                  )}
                  {showHp && c.conds?.length > 0 && <span className="small" style={{ fontSize: '0.72rem', color: 'var(--warn)' }}>{c.conds.join(', ')}</span>}
                </button>
              </div>
              {expanded && <Details c={c} showHp={showHp} setC={setC} remove={remove} />}
            </div>
          );
        })}

        {fight.list.length === 0 && (
          <div className="card dashed" style={{ alignItems: 'center', textAlign: 'center', padding: '1.25rem 1rem' }}>
            <span className="card-title">No fight yet</span>
            <span className="card-body">Add the players and monsters below, type in initiative, then tap Start.</span>
          </div>
        )}

        <AddPanel adding={adding} setAdding={setAdding} add={add} party={party} setParty={setParty} inFight={fight.list}
          saved={saved} saveSecret={saveSecret} deleteSecret={deleteSecret} />

        <div className="card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span className="small" style={{ color: 'var(--ink)' }}>Track player HP &amp; conditions</span>
          <button type="button" role="switch" aria-checked={fight.trackPlayers} aria-label="Track player HP and conditions" className="switch" onClick={() => update((f) => ({ ...f, trackPlayers: !f.trackPlayers }))}>
            <span className="state">{fight.trackPlayers ? 'On' : 'Off'}</span><span className="track"><span className="knob" /></span>
          </button>
        </div>

        {fight.list.length > 0 && (
          <ConfirmButton className="btn ghost small" confirmText="Tap again to clear the fight" onConfirm={() => { update((f) => ({ ...EMPTY, trackPlayers: f.trackPlayers })); setAdding('player'); setOpen(null); }}>
            End fight
          </ConfirmButton>
        )}
      </div>

      {fight.list.length > 0 && (
        <div className="footer">
          {started
            ? <><button type="button" className="btn ghost" style={{ flex: 1 }} onClick={() => step(-1)}>Back</button>
              <button type="button" className="btn" style={{ flex: 2 }} onClick={() => step(1)}>Next turn</button></>
            : <button type="button" className="btn" style={{ flex: 1 }} onClick={() => { step(1); setAdding(null); }}>Start the fight</button>}
        </div>
      )}
    </div>
  );
}

function Details({ c, showHp, setC, remove }) {
  const [amt, setAmt] = useState('');
  const hit = (dir) => {
    const n = num(amt, 0); if (!n) return;
    setC(c.id, { hp: Math.max(0, Math.min(c.maxHp, c.hp + dir * n)) }); setAmt('');
  };
  const toggleCond = (k) => setC(c.id, { conds: c.conds?.includes(k) ? c.conds.filter((x) => x !== k) : [...(c.conds || []), k] });
  return (
    <div className="stack" style={{ gap: 10, paddingTop: 6, borderTop: '1px solid var(--line)' }}>
      {showHp && (
        <>
          {c.maxHp > 0 ? (
            <div className="row" style={{ gap: 6 }}>
              <label className="grow"><span className="sr">Amount</span>
                <input className="input" type="number" inputMode="numeric" placeholder="Amount" value={amt} onChange={(x) => setAmt(x.target.value)} />
              </label>
              <button type="button" className="btn small" style={{ background: 'var(--warn)', borderColor: 'var(--warn)', color: 'var(--on-warn)' }} onClick={() => hit(-1)}>Damage</button>
              <button type="button" className="btn ghost small" onClick={() => hit(1)}>Heal</button>
            </div>
          ) : null}
          <div className="row" style={{ gap: 6 }}>
            <label className="field grow"><span>Max HP</span>
              <input className="input" type="number" inputMode="numeric" value={c.maxHp || ''} onChange={(x) => { const m = num(x.target.value, 0); setC(c.id, { maxHp: m, hp: c.maxHp ? Math.min(c.hp, m) : m }); }} />
            </label>
            <label className="field grow"><span>Current</span>
              <input className="input" type="number" inputMode="numeric" value={c.maxHp ? c.hp : ''} onChange={(x) => setC(c.id, { hp: num(x.target.value, 0) })} />
            </label>
            <label className="field grow"><span>AC</span>
              <input className="input" type="number" inputMode="numeric" value={c.ac || ''} onChange={(x) => setC(c.id, { ac: num(x.target.value, 0) })} />
            </label>
          </div>
          <div className="stack" style={{ gap: 6 }}>
            <span className="label">Conditions</span>
            <div className="wrap" style={{ gap: 6 }}>
              {CONDITIONS.map((k) => <button key={k} type="button" className="chip" style={{ minHeight: 36, padding: '0 10px', fontSize: '0.75rem' }} aria-pressed={!!c.conds?.includes(k)} onClick={() => toggleCond(k)}>{k}</button>)}
            </div>
          </div>
        </>
      )}
      {c.notes && <p className="small" style={{ color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>{c.notes}</p>}
      <button type="button" className="link-btn" style={{ alignSelf: 'flex-start', color: 'var(--warn)' }} onClick={() => remove(c.id)}>Remove from fight</button>
    </div>
  );
}

function AddPanel({ adding, setAdding, add, party, setParty, inFight, saved, saveSecret, deleteSecret }) {
  const [pName, setPName] = useState('');
  const [pInit, setPInit] = useState('');
  const [m, setM] = useState({ name: '', hp: '', ac: '', bonus: '', init: '', count: 1, notes: '', save: false });
  const [msg, setMsg] = useState('');
  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(''), 2000); };
  const notInFight = party.filter((n) => !inFight.some((c) => c.type === 'player' && c.name === n));

  const addPlayer = (name, init) => {
    const n = name.trim(); if (!n) return;
    add([{ type: 'player', name: n, init: init === '' ? '' : num(init), hp: 0, maxHp: 0, ac: 0 }]);
    if (!party.includes(n)) setParty([...party, n]);
    setPName(''); setPInit(''); flash(`Added ${n}`);
  };

  const addMonsters = (src, count, initOverride) => {
    const bonus = num(src.bonus ?? src.initBonus, 0);
    const hp = num(src.hp, 0);
    const n = Math.max(1, Math.min(12, num(count, 1)));
    add(Array.from({ length: n }, (_, i) => ({
      type: 'monster', name: n > 1 ? `${src.name} ${i + 1}` : src.name, hp, maxHp: hp, ac: num(src.ac, 0),
      init: initOverride !== '' && initOverride != null ? num(initOverride) : d20() + bonus, notes: src.notes || '',
    })));
    flash(`Added ${n > 1 ? `${n} × ` : ''}${src.name}`);
  };

  const submitMonster = () => {
    if (!m.name.trim()) return;
    addMonsters({ ...m, name: m.name.trim() }, m.count, m.init);
    if (m.save) saveSecret(`monster-${Date.now().toString(36)}`, { kind: 'monster', name: m.name.trim(), hp: num(m.hp), ac: num(m.ac), initBonus: num(m.bonus), notes: m.notes });
    setM({ name: '', hp: '', ac: '', bonus: '', init: '', count: 1, notes: '', save: false });
  };

  return (
    <div className="card" style={{ gap: 10 }}>
      <div className="between">
        <h2 className="h2" style={{ fontSize: '1.2rem' }}>Add to fight</h2>
        {adding && <button type="button" className="link-btn" onClick={() => setAdding(null)}>Close</button>}
      </div>
      <div className="seg">
        {[['player', 'Player'], ['monster', 'Monster'], ['saved', 'Saved']].map(([k, l]) => <button key={k} type="button" aria-pressed={adding === k} onClick={() => setAdding(adding === k ? null : k)}>{l}</button>)}
      </div>
      {msg && <p className="result" role="status" style={{ alignSelf: 'flex-start' }}>{msg}</p>}

      {adding === 'player' && (
        <div className="stack">
          {notInFight.length > 0 && (
            <div className="wrap" style={{ gap: 6 }}>
              {notInFight.map((n) => <button key={n} type="button" className="chip" aria-pressed={pName === n} onClick={() => setPName(n)}>{n}</button>)}
            </div>
          )}
          <div className="row" style={{ gap: 6, alignItems: 'flex-end' }}>
            <label className="field grow"><span>Name</span><input className="input" value={pName} onChange={(x) => setPName(x.target.value)} placeholder="Character name" /></label>
            <label className="field" style={{ width: 84 }}><span>Initiative</span><input className="input" type="number" inputMode="numeric" value={pInit} onChange={(x) => setPInit(x.target.value)} /></label>
          </div>
          <button type="button" className="btn small" disabled={!pName.trim()} onClick={() => addPlayer(pName, pInit)}>Add player</button>
          <p className="small">Names are remembered for next time.</p>
        </div>
      )}

      {adding === 'monster' && (
        <div className="stack">
          <label className="field"><span>Name</span><input className="input" value={m.name} onChange={(x) => setM({ ...m, name: x.target.value })} placeholder="e.g. Goblin" /></label>
          <div className="row" style={{ gap: 6 }}>
            <label className="field grow"><span>HP</span><input className="input" type="number" inputMode="numeric" value={m.hp} onChange={(x) => setM({ ...m, hp: x.target.value })} /></label>
            <label className="field grow"><span>AC</span><input className="input" type="number" inputMode="numeric" value={m.ac} onChange={(x) => setM({ ...m, ac: x.target.value })} /></label>
            <label className="field grow"><span>How many</span><input className="input" type="number" inputMode="numeric" min={1} max={12} value={m.count} onChange={(x) => setM({ ...m, count: x.target.value })} /></label>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <label className="field grow"><span>Initiative bonus</span><input className="input" type="number" inputMode="numeric" value={m.bonus} onChange={(x) => setM({ ...m, bonus: x.target.value })} placeholder="e.g. 2" /></label>
            <label className="field grow"><span>Or set initiative</span><input className="input" type="number" inputMode="numeric" value={m.init} onChange={(x) => setM({ ...m, init: x.target.value })} placeholder="auto-roll" /></label>
          </div>
          <label className="field"><span>Notes (optional)</span><input className="input" value={m.notes} onChange={(x) => setM({ ...m, notes: x.target.value })} placeholder="e.g. Scimitar +4, 1d6+2" /></label>
          <label className="row" style={{ gap: 8, minHeight: 44 }}>
            <input type="checkbox" checked={m.save} onChange={(x) => setM({ ...m, save: x.target.checked })} style={{ width: 20, height: 20 }} />
            <span className="small" style={{ color: 'var(--ink)' }}>Save to my monsters for next time</span>
          </label>
          <button type="button" className="btn small" disabled={!m.name.trim()} onClick={submitMonster}>Add monster</button>
          <p className="small">Leave initiative blank and it rolls d20 + bonus for each one.</p>
        </div>
      )}

      {adding === 'saved' && (
        <div className="stack">
          {saved.length === 0 && <p className="small">No saved monsters yet. Tick &ldquo;Save to my monsters&rdquo; when adding one.</p>}
          {saved.map((s) => (
            <div key={s.id} className="list-row" style={{ paddingLeft: 12 }}>
              <span className="grow stack" style={{ gap: 2 }}>
                <b>{s.name}</b>
                <span className="small" style={{ fontSize: '0.72rem' }}>{s.hp} HP · AC {s.ac} · init {sign(num(s.initBonus))}</span>
              </span>
              <button type="button" className="btn small" onClick={() => addMonsters(s, 1)}>Add</button>
              <ConfirmButton className="icon-btn" label={`Delete saved ${s.name}`} confirmText="Delete?" style={{ width: 'auto', minWidth: 44, fontSize: '0.75rem' }} onConfirm={() => deleteSecret(s.id)}><Icon name="trash" size={18} /></ConfirmButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

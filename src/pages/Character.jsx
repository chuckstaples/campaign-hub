import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useHub } from '../lib/store.jsx';
import { ConfirmButton, Icon, ImagePicker, Nav, Ornament, Picture, useToggle } from '../components/ui.jsx';
import { ABILITIES, PROF_BONUS, WEAPONS, roll4d6, sign, weaponProficient } from '../lib/rules.js';
import { EMPTY_CHARACTER, deriveCharacter, loadCharacter, saveCharacter } from '../lib/character.js';
import { metaLine } from './Options.jsx';

const STEPS = ['Name', 'Race', 'Background', 'Class', 'Ability scores', 'Weapons', 'Review'];
const KIND_STEP = { race: 1, background: 2, class: 3 };
const KIND_FIELD = { race: 'raceId', background: 'backgroundId', class: 'classId' };

export default function Character() {
  const { visibleEntries, entries } = useHub();
  const loc = useLocation();
  const nav = useNavigate();
  const [c, setC] = useState(loadCharacter);
  const [editing, setEditing] = useState(!c.done);
  const [step, setStep] = useState(0);
  const update = (patch) => setC((cur) => ({ ...cur, ...patch }));

  useEffect(() => saveCharacter(c), [c]);

  // Arriving from "Use this for my character".
  useEffect(() => {
    const pick = loc.state?.pick;
    if (!pick) return;
    update({ [KIND_FIELD[pick.kind]]: pick.id, ...(pick.kind === 'class' ? { classSkills: [] } : {}) });
    setEditing(true); setStep(KIND_STEP[pick.kind]);
    nav('.', { replace: true, state: null });
  }, [loc.state, nav]);

  const byId = useMemo(() => Object.fromEntries(entries.map((e) => [e.id, e])), [entries]);
  const d = useMemo(() => deriveCharacter(c, byId), [c, byId]);

  if (!editing) return <Summary c={c} d={d} onEdit={() => { setEditing(true); setStep(0); }} onReset={() => { setC({ ...EMPTY_CHARACTER }); setEditing(true); setStep(0); }} />;

  const canNext = [
    true, !!c.raceId, !!c.backgroundId, !!c.classId && c.classSkills.length === Number(d.cls?.skillCount || 0),
    ABILITIES.every((a) => d.scores[a.id] != null) && !!c.plus2 && !!c.plus1, true, true,
  ][step];
  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : (update({ done: true }), setEditing(false), nav('/rolls')));

  return (
    <div className="shell">
      <header className="top">
        <div className="between">
          <div className="eyebrow">{c.done ? 'Editing' : 'New character'} · Step {step + 1} of {STEPS.length}</div>
          <Link to="/options" className="icon-btn" style={{ margin: '-10px -10px -10px 0' }} aria-label="Leave for now (your progress is saved)"><Icon name="x" size={20} /></Link>
        </div>
        <h1 className="title">{STEPS[step]}</h1>
        <div className="steps" aria-hidden="true">{STEPS.map((s, i) => <span key={s} className={i <= step ? 'on' : ''} />)}</div>
        {step > 0 && <div className="small">{[c.name || 'Unnamed', d.race?.name, d.bg?.name, d.cls?.name].filter(Boolean).join(' · ')}</div>}
      </header>
      <div className="page" style={{ paddingTop: '0.5rem' }}>
        {step === 0 && <StepName c={c} update={update} />}
        {step === 1 && <StepPick kind="race" c={c} update={update} entries={visibleEntries} />}
        {step === 2 && <StepPick kind="background" c={c} update={update} entries={visibleEntries} />}
        {step === 3 && <StepClass c={c} d={d} update={update} entries={visibleEntries} />}
        {step === 4 && <StepAbilities c={c} d={d} update={update} />}
        {step === 5 && <StepWeapons c={c} d={d} update={update} />}
        {step === 6 && <StepReview c={c} d={d} />}
      </div>
      <div className="footer">
        {step > 0 ? <button type="button" className="btn ghost" style={{ flex: 1 }} onClick={() => setStep(step - 1)}>Back</button>
          : c.done && <button type="button" className="btn ghost" style={{ flex: 1 }} onClick={() => setEditing(false)}>Cancel</button>}
        <button type="button" className="btn" style={{ flex: 2 }} disabled={!canNext} onClick={next}>
          {step === STEPS.length - 1 ? 'Save character' : `Next: ${STEPS[step + 1]}`}
        </button>
      </div>
    </div>
  );
}

function StepName({ c, update }) {
  return (
    <>
      <label className="field"><span>Character name</span>
        <input className="input" value={c.name} onChange={(e) => update({ name: e.target.value })} placeholder="What are they called?" />
      </label>
      <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
        <Picture src={c.image} alt="Your character" height={96} className="picture" style={{ width: 96, borderRadius: 48, flexShrink: 0 }} />
        <div className="grow"><ImagePicker value={c.image} onChange={(image) => update({ image })} /></div>
      </div>
      <p className="small">The picture stays on your phone. Pinterest works great for finding one.</p>
    </>
  );
}

function StepPick({ kind, c, update, entries }) {
  const field = KIND_FIELD[kind];
  const list = entries.filter((e) => e.kind === kind);
  if (!list.length) return <p className="lede">Your DM hasn&rsquo;t revealed any yet.</p>;
  return list.map((e) => (
    <button key={e.id} type="button" className="pick" aria-pressed={c[field] === e.id} onClick={() => update({ [field]: e.id })}>
      <span className="grow stack" style={{ gap: 2 }}>
        <span className="between" style={{ alignItems: 'baseline' }}><span className="card-title" style={{ fontSize: '1.25rem' }}>{e.name}</span><span className="card-meta">{metaLine(e)}</span></span>
        {e.summary && <span className="small">{e.summary}</span>}
        {kind !== 'class' && <span className="small" style={{ color: 'var(--accent)', fontWeight: 600 }}>{(e.abilities || []).length === 6 ? 'Bonuses: any ability' : `Bonuses: ${(e.abilities || []).join(', ')}`}</span>}
      </span>
      {c[field] === e.id && <Icon name="check" size={22} style={{ color: 'var(--accent)' }} />}
    </button>
  ));
}

function StepClass({ c, d, update, entries }) {
  const cls = d.cls;
  const fixed = new Set([...(d.race?.skills || []), ...(d.bg?.skills || [])]);
  const toggle = (s) => {
    const has = c.classSkills.includes(s);
    if (has) update({ classSkills: c.classSkills.filter((x) => x !== s) });
    else if (c.classSkills.length < cls.skillCount) update({ classSkills: [...c.classSkills, s] });
  };
  return (
    <>
      <StepPick kind="class" c={c} update={(p) => update({ ...p, classSkills: [] })} entries={entries} />
      {cls && (
        <div className="soft">
          <h2 className="h2" style={{ fontSize: '1.25rem' }}>Pick {cls.skillCount} {cls.name} skill{cls.skillCount > 1 ? 's' : ''}</h2>
          <p className="small" style={{ color: 'inherit' }}>{c.classSkills.length} of {cls.skillCount} picked.</p>
          <div className="wrap" style={{ gap: 8 }}>
            {(cls.skillList || []).map((s) => fixed.has(s)
              ? <button key={s} type="button" className="chip" disabled>{s} · have it</button>
              : <button key={s} type="button" className="chip" aria-pressed={c.classSkills.includes(s)} onClick={() => toggle(s)}
                disabled={!c.classSkills.includes(s) && c.classSkills.length >= cls.skillCount}>{s}</button>)}
          </div>
        </div>
      )}
    </>
  );
}

function StepAbilities({ c, d, update }) {
  const filled = c.rolls.every((r) => r !== '' && !Number.isNaN(Number(r)));
  const [typing, setTyping] = useState(!filled);
  const [picked, setPicked] = useState(null);
  const [open, toggle] = useToggle();
  const holder = (i) => Object.keys(c.assign).find((k) => c.assign[k] === i);
  const setRoll = (i, v) => { const rolls = [...c.rolls]; rolls[i] = v === '' ? '' : String(Math.max(0, Math.min(30, Number(v)))); update({ rolls }); };
  const rollAll = () => { update({ rolls: c.rolls.map(() => String(roll4d6())) }); setTyping(false); };
  const place = (ab) => {
    if (picked == null) return;
    const assign = { ...c.assign }; const other = holder(picked); const cur = assign[ab];
    assign[ab] = picked; if (other && other !== ab) { if (cur == null) delete assign[other]; else assign[other] = cur; }
    update({ assign }); setPicked(null);
  };
  const elig = d.eligible;
  const setP2 = (a) => update({ plus2: a, plus1: c.plus1 === a ? '' : c.plus1 });

  return (
    <>
      <section className="card">
        <div className="between">
          <h2 className="h2" style={{ fontSize: '1.3rem' }}>1. Your rolls</h2>
          <button type="button" className="btn ghost small" onClick={rollAll}>Roll for me</button>
        </div>
        <p className="small">Roll 4d6 six times, dropping the lowest die each time. {typing ? 'Type each total in.' : 'Tap a number, then tap an ability below to place it.'}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 6 }}>
          {c.rolls.map((r, i) => typing
            ? <input key={i} className="roll-in" type="number" inputMode="numeric" aria-label={`Roll ${i + 1}`} value={r} onChange={(e) => setRoll(i, e.target.value)} />
            : <button key={i} type="button" className={`roll-in${picked === i ? ' on' : ''}`} aria-pressed={picked === i} onClick={() => setPicked(picked === i ? null : i)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span>{r}</span><span style={{ fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.05em' }}>{holder(i) || '—'}</span>
            </button>)}
        </div>
        {typing
          ? <button type="button" className="btn small" disabled={!filled} onClick={() => setTyping(false)}>Done, now place them</button>
          : <button type="button" className="link-btn" style={{ alignSelf: 'flex-start' }} onClick={() => setTyping(true)}>Change the numbers</button>}
      </section>

      <section className="soft">
        <h2 className="h2" style={{ fontSize: '1.3rem' }}>2. Ability bonuses</h2>
        <p className="small" style={{ color: 'inherit' }}>
          {elig.length === 6 ? 'Your race lets these go on any ability.' : `Only abilities your race or background lists can take them. ${d.race?.name}: ${(d.race?.abilities || []).join(', ')}. ${d.bg?.name}: ${(d.bg?.abilities || []).join(', ')}.`}
        </p>
        <span className="small" style={{ fontWeight: 600, color: 'inherit' }}>+2 goes to</span>
        <div className="wrap" style={{ gap: 6 }}>{elig.map((a) => <button key={a} type="button" className="ab-toggle" aria-pressed={c.plus2 === a} onClick={() => setP2(a)}>{a}</button>)}</div>
        <span className="small" style={{ fontWeight: 600, color: 'inherit' }}>+1 goes to</span>
        <div className="wrap" style={{ gap: 6 }}>{elig.map((a) => <button key={a} type="button" className="ab-toggle" aria-pressed={c.plus1 === a} disabled={c.plus2 === a} style={c.plus2 === a ? { opacity: 0.4 } : null} onClick={() => update({ plus1: a })}>{a}</button>)}</div>
      </section>

      <section className="stack" style={{ gap: 6 }}>
        <h2 className="h2" style={{ fontSize: '1.3rem', marginBottom: 4 }}>3. Your scores</h2>
        <div className="row small" style={{ gap: 6, padding: '0 4px', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
          <span className="grow">Ability</span><span style={{ width: 52, textAlign: 'center' }}>Roll</span><span style={{ width: 34, textAlign: 'center' }}>Bonus</span><span style={{ width: 38, textAlign: 'center' }}>Score</span><span style={{ width: 64, textAlign: 'center' }}>Modifier</span>
        </div>
        {ABILITIES.map((a) => {
          const idx = c.assign[a.id]; const base = idx == null ? null : c.rolls[idx];
          const bonus = d.bonusOf[a.id]; const score = d.scores[a.id]; const m = d.mods[a.id];
          return (
            <div key={a.id} className="stack" style={{ gap: 4 }}>
              <div className="score-row">
                <span className="grow stack" style={{ gap: 0, paddingLeft: 6 }}><b style={{ fontSize: '0.9rem' }}>{a.id}</b><span className="small" style={{ fontSize: '0.7rem' }}>{a.name}</span></span>
                <button type="button" className={`slot${picked != null ? ' armed' : ''}`} aria-label={`Place roll on ${a.name}`} onClick={() => place(a.id)}>{base ?? '–'}</button>
                <span style={{ width: 34, textAlign: 'center', fontWeight: 600, color: 'var(--accent)', fontSize: '0.85rem' }}>{bonus ? `+${bonus}` : ''}</span>
                <span style={{ width: 38, textAlign: 'center', fontWeight: 600, fontSize: '1.1rem' }}>{score ?? ''}</span>
                <button type="button" className="modbtn" disabled={score == null} aria-expanded={open === a.id} aria-label={`${a.name} modifier, explain`} onClick={() => toggle(a.id)}>
                  <b style={{ fontSize: '1.05rem' }}>{score == null ? '' : sign(m)}</b><Icon name="help" size={13} style={{ color: 'var(--warn)' }} />
                </button>
              </div>
              {open === a.id && score != null && <p className="why" style={{ margin: '0 4px 4px' }}>{bonus ? `${base} + ${bonus} bonus = ${score}. ` : ''}Your modifier is the score minus 10, halved and rounded down: {score} gives {sign(m)}. You add it to {a.name} rolls.</p>}
            </div>
          );
        })}
      </section>
    </>
  );
}

function StepWeapons({ c, d, update }) {
  const trained = WEAPONS.filter((w) => weaponProficient(w, d.weaponProfs));
  const other = WEAPONS.filter((w) => !weaponProficient(w, d.weaponProfs));
  const [showOther, setShowOther] = useState(false);
  const toggle = (n) => update({ weapons: c.weapons.includes(n) ? c.weapons.filter((x) => x !== n) : c.weapons.length < 3 ? [...c.weapons, n] : c.weapons });
  const Row = (w) => (
    <button key={w.name} type="button" className="pick" style={{ minHeight: 52 }} aria-pressed={c.weapons.includes(w.name)} onClick={() => toggle(w.name)}
      disabled={!c.weapons.includes(w.name) && c.weapons.length >= 3}>
      <span className="grow stack" style={{ gap: 1 }}>
        <span style={{ fontWeight: 600 }}>{w.name}</span>
        <span className="small">{w.die} {w.type}{w.finesse ? ' · finesse' : ''}{w.ranged ? ` · range ${w.ranged}` : ''}{w.thrown ? ' · can throw' : ''}</span>
      </span>
      {c.weapons.includes(w.name) && <Icon name="check" size={22} style={{ color: 'var(--accent)' }} />}
    </button>
  );
  return (
    <>
      <p className="lede">Pick up to 3 weapons your character carries ({c.weapons.length} picked). Check your starting gear with your DM. You can skip this.</p>
      <span className="label">You&rsquo;re trained with these</span>
      {trained.map(Row)}
      <button type="button" className="link-btn" style={{ alignSelf: 'flex-start' }} onClick={() => setShowOther(!showOther)}>{showOther ? 'Hide other weapons' : 'Show other weapons (no proficiency bonus)'}</button>
      {showOther && other.map(Row)}
    </>
  );
}

function StepReview({ c, d }) {
  const [open, toggle] = useToggle();
  return (
    <>
      <div className="stats">
        <button type="button" className="stat center" style={{ cursor: 'pointer' }} aria-expanded={open === 'hp'} onClick={() => toggle('hp')}>
          <span className="label">HP <Icon name="help" size={11} style={{ color: 'var(--warn)' }} /></span><b>{d.hp}</b>
        </button>
        <div className="stat center"><span className="label">Speed</span><b style={{ fontSize: '0.95rem' }}>{(d.race?.speed || '').split(',')[0].split('(')[0]}</b></div>
        <button type="button" className="stat center" style={{ cursor: 'pointer' }} aria-expanded={open === 'pb'} onClick={() => toggle('pb')}>
          <span className="label">Prof. <Icon name="help" size={11} style={{ color: 'var(--warn)' }} /></span><b>+{PROF_BONUS}</b>
        </button>
      </div>
      {open === 'hp' && <p className="why">At level 1 you get the biggest number on your class&rsquo;s hit die (d{d.cls?.hitDie} = {d.cls?.hitDie}) plus your Constitution modifier ({sign(d.mods.CON)}).</p>}
      {open === 'pb' && <p className="why">Your proficiency bonus is +{PROF_BONUS} at level 1. You add it to anything you&rsquo;re trained in.</p>}
      <AbilityGrid d={d} />
      <div className="stack" style={{ gap: 6 }}>
        <span className="label">Trained skills</span>
        <div className="wrap">{[...d.profSkills].sort().map((s) => <span key={s} className="tag">{s}</span>)}</div>
        <span className="label" style={{ marginTop: 6 }}>Trained saves</span>
        <div className="wrap">{(d.cls?.saves || []).map((s) => <span key={s} className="tag">{s}</span>)}</div>
        {c.weapons.length > 0 && <><span className="label" style={{ marginTop: 6 }}>Weapons</span><div className="wrap">{c.weapons.map((w) => <span key={w} className="tag">{w}</span>)}</div></>}
      </div>
      <p className="small">Copy these onto your paper sheet. After you save, the Rolls tab shows what to roll for everything.</p>
    </>
  );
}

function AbilityGrid({ d }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
      {ABILITIES.map((a) => (
        <div key={a.id} className="stat center">
          <span className="label">{a.id}</span>
          <b style={{ fontSize: '1.35rem' }}>{d.scores[a.id] == null ? '–' : sign(d.mods[a.id])}</b>
          <span className="small" style={{ fontSize: '0.75rem' }}>{d.scores[a.id] ?? ''}</span>
        </div>
      ))}
    </div>
  );
}

function Summary({ c, d, onEdit, onReset }) {
  const missing = [!d.race && 'race', !d.bg && 'background', !d.cls && 'class'].filter(Boolean);
  return (
    <div className="shell">
      <header className="top">
        <div className="row" style={{ gap: 14 }}>
          <Picture src={c.image} alt={c.name} height={64} className="picture avatar" />
          <div className="stack" style={{ gap: 2, minWidth: 0 }}>
            <h1 className="title" style={{ fontSize: '1.9rem' }}>{c.name || 'Unnamed'}</h1>
            <span className="small">{[d.race?.name, d.cls?.name].filter(Boolean).join(' ')} · Level 1{d.bg ? ` · ${d.bg.name}` : ''}</span>
          </div>
        </div>
      </header>
      <div className="page" style={{ paddingTop: '0.5rem' }}>
        {missing.length > 0 && <p className="why">Your {missing.join(' and ')} is no longer available. Edit your character to pick again.</p>}
        <div className="stats">
          <div className="stat center"><span className="label">HP</span><b>{d.hp ?? '–'}</b></div>
          <div className="stat center"><span className="label">Speed</span><b style={{ fontSize: '0.95rem' }}>{(d.race?.speed || '–').split(',')[0].split('(')[0]}</b></div>
          <div className="stat center"><span className="label">Prof.</span><b>+{PROF_BONUS}</b></div>
        </div>
        <AbilityGrid d={d} />
        <Link to="/rolls" className="btn">What do I roll?</Link>
        <div className="row"><button type="button" className="btn ghost" style={{ flex: 1 }} onClick={onEdit}>Edit character</button><ConfirmButton className="btn ghost" style={{ flex: 1 }} confirmText="Tap again to clear" onConfirm={onReset}>Start over</ConfirmButton></div>
        <Ornament />
      </div>
      <Nav />
    </div>
  );
}

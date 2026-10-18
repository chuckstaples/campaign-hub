import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useHub } from '../lib/store.jsx';
import { HelpButton, Icon, Nav, Ornament, Picture, useToggle } from '../components/ui.jsx';
import { deriveCharacter, loadCharacter } from '../lib/character.js';
import { PROF_BONUS, plus, rollFormula } from '../lib/rules.js';

const TABS = [{ id: 'fight', label: 'Fighting' }, { id: 'check', label: 'Checks' }, { id: 'save', label: 'Saves' }];

export default function Rolls() {
  const { entries } = useHub();
  const c = useMemo(loadCharacter, []);
  const byId = useMemo(() => Object.fromEntries(entries.map((e) => [e.id, e])), [entries]);
  const d = useMemo(() => deriveCharacter(c, byId), [c, byId]);
  const [tab, setTab] = useState(() => sessionStorage.getItem('hub.rolltab') || 'fight');
  const [open, toggle] = useToggle();
  const [results, setResults] = useState({});
  const pickTab = (t) => { setTab(t); try { sessionStorage.setItem('hub.rolltab', t); } catch { /* ignore */ } };

  if (!c.done || !d.cls) {
    return (
      <div className="shell">
        <header className="top"><h1 className="title">What do I roll?</h1></header>
        <div className="page">
          <p className="lede">Make your character first. Then this page shows exactly which dice to roll for attacks, checks and saves.</p>
          <Link to="/character" className="btn">Make my character</Link>
        </div>
        <Nav />
      </div>
    );
  }

  const roll = (card) => {
    const r = rollFormula(card.dice.n, card.dice.s, card.dice.b);
    let text = `Rolled ${r.raw}${plus(card.dice.b)} = ${r.total}`;
    if (card.dice.s === 20 && r.dice[0] === 20) text = `Natural 20! ${text}`;
    if (card.dice.s === 20 && r.dice[0] === 1) text = `Natural 1. ${text}`;
    if (card.extraDice) text += ` · damage ${rollFormula(card.extraDice.n, card.extraDice.s, card.extraDice.b).total}`;
    setResults((cur) => ({ ...cur, [card.id]: text }));
  };

  const cards = d.cards.filter((x) => x.group === tab);
  return (
    <div className="shell">
      <header className="top" style={{ gap: '0.75rem' }}>
        <div className="row" style={{ gap: 14 }}>
          <Picture src={c.image} alt={c.name} height={64} className="picture avatar" />
          <div className="stack" style={{ gap: 2, minWidth: 0 }}>
            <span className="card-title" style={{ fontSize: '1.75rem' }}>{c.name || 'Unnamed'}</span>
            <span className="small">{d.race?.name} {d.cls?.name} · Level 1</span>
          </div>
        </div>
        <div className="stats">
          <div className="stat center"><span className="label">HP</span><b>{d.hp}</b></div>
          <div className="stat center"><span className="label">Speed</span><b style={{ fontSize: '0.95rem' }}>{(d.race?.speed || '').split(',')[0].split('(')[0]}</b></div>
          <div className="stat center"><span className="label">Prof.</span><b>+{PROF_BONUS}</b></div>
        </div>
        <h1 className="title" style={{ fontSize: '1.9rem', marginTop: 4 }}>What do I roll?</h1>
        <div className="seg">{TABS.map((t) => <button key={t.id} type="button" aria-pressed={tab === t.id} onClick={() => pickTab(t.id)}>{t.label}</button>)}</div>
      </header>
      <div className="page" style={{ paddingTop: '0.25rem', gap: '0.75rem' }}>
        {cards.map((card) => (
          <div key={card.id} className="card" style={{ padding: '0.75rem 0.5rem 0.4rem 1rem', gap: 4 }}>
            <div className="between" style={{ alignItems: 'flex-start' }}>
              <div className="stack" style={{ gap: 2, paddingTop: 2, minWidth: 0 }}>
                <span style={{ fontWeight: 600 }}>{card.name}{card.proficient && <span className="tag accent" style={{ marginLeft: 8, fontSize: '0.65rem', padding: '2px 7px' }}>Trained</span>}</span>
                <span className="small" style={{ fontSize: '0.75rem' }}>{card.note}</span>
              </div>
              <HelpButton open={open === card.id} onClick={() => toggle(card.id)} label={`Why ${card.formula} for ${card.name}?`} />
            </div>
            <div className="row" style={{ gap: 10 }}>
              <Icon name="d20" size={24} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span className="formula">{card.formula}</span>
            </div>
            {card.extra && <span style={{ fontSize: '0.9rem' }}>{card.extra}</span>}
            {open === card.id && <p className="why" style={{ marginRight: 8 }}>{card.why}</p>}
            {card.dice && (
              <div className="between" style={{ paddingRight: 8 }}>
                <button type="button" className="link-btn" onClick={() => roll(card)}>Roll for me</button>
                {results[card.id] && <span className="result" aria-live="polite">{results[card.id]}</span>}
              </div>
            )}
          </div>
        ))}
        <Ornament />
      </div>
      <Nav />
    </div>
  );
}

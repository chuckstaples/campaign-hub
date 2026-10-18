import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHub } from '../lib/store.jsx';
import { BackLink, ConfirmButton, Icon, ImagePicker, Picture, Switch } from '../components/ui.jsx';
import { ABILITIES, SKILL_NAMES } from '../lib/rules.js';
import { newId } from '../lib/seed.js';
import { KINDS } from './Options.jsx';

const BLANK = {
  race: { size: 'Medium', speed: '30 ft', senses: '', abilities: [], skills: [] },
  background: { abilities: [], skills: [] },
  class: { hitDie: 8, saves: [], skillCount: 2, skillList: [], weapons: ['simple'], casting: '' },
};

function Toggles({ options, value, onChange, max }) {
  const set = new Set(value || []);
  return (
    <div className="wrap" style={{ gap: 6 }}>
      {options.map((o) => {
        const id = o.id ?? o, label = o.label ?? o, on = set.has(id);
        return <button key={id} type="button" className={o.id ? 'ab-toggle' : 'chip'} aria-pressed={on} disabled={!on && max && set.size >= max}
          onClick={() => onChange(on ? value.filter((x) => x !== id) : [...(value || []), id])}>{label}</button>;
      })}
    </div>
  );
}

const Field = ({ label, children, hint }) => <label className="field"><span>{label}</span>{children}{hint && <span className="small" style={{ fontWeight: 400 }}>{hint}</span>}</label>;

export default function DMEdit() {
  const { id, kind: newKind } = useParams();
  const { entries, saveEntry, deleteEntry, isOwner } = useHub();
  const nav = useNavigate();
  const existing = entries.find((e) => e.id === id);
  const [e, setE] = useState(() => existing || {
    id: newId(newKind), kind: newKind, name: '', summary: '', source: 'Homebrew', visible: false, image: '', traits: [], weapons: [], ...BLANK[newKind],
  });
  if (!isOwner) return <div className="shell"><div className="page" style={{ paddingTop: '0.6rem' }}><BackLink /><p className="lede">Only the DM can edit.</p></div></div>;
  if (id && !existing) return <div className="shell"><div className="page" style={{ paddingTop: '0.6rem' }}><BackLink /><p className="lede">Not found.</p></div></div>;

  const up = (patch) => setE((cur) => ({ ...cur, ...patch }));
  const setTrait = (i, patch) => up({ traits: e.traits.map((t, j) => (j === i ? { ...t, ...patch } : t)) });
  const one = KINDS.find((k) => k.id === e.kind).one;
  const save = () => { saveEntry({ ...e, name: e.name.trim() || `Untitled ${one}`, traits: e.traits.filter((t) => t.name.trim() || t.text.trim()) }); nav('/dm'); };
  const remove = () => { deleteEntry(e.id); nav('/dm'); };
  const specificWeapons = (e.weapons || []).filter((w) => w !== 'simple' && w !== 'martial');

  return (
    <div className="shell">
      <div className="dm-band"><span className="row" style={{ gap: 8, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}><Icon name="quill" size={16} />{existing ? `Edit ${one}` : `New ${one}`}</span></div>
      <div className="page" style={{ paddingTop: '0.6rem', gap: '1.1rem' }}>
        <BackLink label="Cancel" />
        <div className="between card" style={{ flexDirection: 'row', padding: '0.4rem 0.4rem 0.4rem 1rem' }}>
          <span style={{ fontWeight: 600 }}>Players can see this</span>
          <Switch on={!!e.visible} onChange={(v) => up({ visible: v })} label="Visible to players" />
        </div>
        <Field label="Name"><input className="input" value={e.name} onChange={(x) => up({ name: x.target.value })} /></Field>
        <Field label="One-line description"><input className="input" value={e.summary || ''} onChange={(x) => up({ summary: x.target.value })} /></Field>
        <div className="field"><span>Source</span>
          <div className="seg">{['Official', 'Homebrew'].map((s) => <button key={s} type="button" aria-pressed={(e.source || 'Official') === s} onClick={() => up({ source: s })}>{s}</button>)}</div>
        </div>

        {e.kind === 'race' && <>
          <div className="stats" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Field label="Size"><input className="input" value={e.size || ''} onChange={(x) => up({ size: x.target.value })} /></Field>
            <Field label="Speed"><input className="input" value={e.speed || ''} onChange={(x) => up({ speed: x.target.value })} /></Field>
          </div>
          <Field label="Senses" hint='e.g. "Darkvision 60 ft". Leave blank for normal sight.'><input className="input" value={e.senses || ''} onChange={(x) => up({ senses: x.target.value })} /></Field>
        </>}

        {e.kind !== 'class' && <div className="field">
          <span>Abilities the +2/+1 can go on</span>
          <Toggles options={ABILITIES.map((a) => ({ id: a.id, label: a.id }))} value={e.abilities} onChange={(v) => up({ abilities: v })} />
          <span className="small">Players can put bonuses on any ability their race or background lists. {e.kind === 'background' ? 'Backgrounds usually list three.' : 'Pick all six for "any ability."'}</span>
        </div>}

        {e.kind !== 'class' && <div className="field"><span>Skills it gives</span><Toggles options={SKILL_NAMES} value={e.skills} onChange={(v) => up({ skills: v })} /></div>}

        {e.kind === 'class' && <>
          <div className="field"><span>Hit die</span>
            <div className="seg">{[6, 8, 10, 12].map((h) => <button key={h} type="button" aria-pressed={Number(e.hitDie) === h} onClick={() => up({ hitDie: h })}>d{h}</button>)}</div>
          </div>
          <div className="field"><span>Trained saves (pick 2)</span><Toggles options={ABILITIES.map((a) => ({ id: a.id, label: a.id }))} value={e.saves} onChange={(v) => up({ saves: v })} max={2} /></div>
          <div className="field"><span>Spellcasting at level 1</span>
            <select className="input" value={e.casting || ''} onChange={(x) => up({ casting: x.target.value })}>
              <option value="">None</option>{ABILITIES.map((a) => <option key={a.id} value={a.id}>Uses {a.name}</option>)}
            </select>
          </div>
          <Field label="How many skills players pick"><input className="input" type="number" inputMode="numeric" min={0} max={6} value={e.skillCount} onChange={(x) => up({ skillCount: Number(x.target.value) || 0 })} /></Field>
          <div className="field"><span>Skills they pick from</span><Toggles options={SKILL_NAMES} value={e.skillList} onChange={(v) => up({ skillList: v })} /></div>
          <div className="field"><span>Weapons they&rsquo;re trained with</span>
            <Toggles options={[{ id: 'simple', label: 'Simple' }, { id: 'martial', label: 'Martial' }]} value={(e.weapons || []).filter((w) => w === 'simple' || w === 'martial')}
              onChange={(v) => up({ weapons: [...v, ...specificWeapons] })} />
            <input className="input" placeholder="Plus specific weapons, comma separated" value={specificWeapons.join(', ')}
              onChange={(x) => up({ weapons: [...(e.weapons || []).filter((w) => w === 'simple' || w === 'martial'), ...x.target.value.split(',').map((s) => s.trim()).filter(Boolean)] })} />
          </div>
          <Field label="Usual weapons (shown first to players)" hint="Comma separated, e.g. Quarterstaff, Dagger">
            <input className="input" value={(e.suggestedWeapons || []).join(', ')} onChange={(x) => up({ suggestedWeapons: x.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
          </Field>
        </>}

        {e.kind === 'class' && <Field label="Armor"><input className="input" value={e.armor || ''} onChange={(x) => up({ armor: x.target.value })} /></Field>}
        {e.kind !== 'race' && <Field label="Tools"><input className="input" value={e.tools || ''} onChange={(x) => up({ tools: x.target.value })} /></Field>}
        {e.kind === 'background' && <Field label="Languages"><input className="input" value={e.languages || ''} onChange={(x) => up({ languages: x.target.value })} /></Field>}
        {e.kind !== 'race' && <Field label="Starting gear"><textarea className="input" value={e.equipment || ''} onChange={(x) => up({ equipment: x.target.value })} /></Field>}

        <div className="stack">
          <span className="label">{e.kind === 'class' ? 'Level 1 features' : e.kind === 'background' ? 'Feature' : 'Traits'}</span>
          {e.traits.map((t, i) => (
            <div key={i} className="card" style={{ gap: 8 }}>
              <div className="row">
                <input className="input" aria-label="Trait name" placeholder="Name" value={t.name} onChange={(x) => setTrait(i, { name: x.target.value })} />
                <button type="button" className="icon-btn" aria-label={`Remove ${t.name || 'trait'}`} onClick={() => up({ traits: e.traits.filter((_, j) => j !== i) })}><Icon name="trash" size={20} /></button>
              </div>
              <textarea className="input" aria-label="What it does" placeholder="What it does" value={t.text} onChange={(x) => setTrait(i, { text: x.target.value })} />
            </div>
          ))}
          <button type="button" className="btn ghost small" onClick={() => up({ traits: [...e.traits, { name: '', text: '' }] })}><Icon name="plus" size={16} />Add {e.kind === 'class' ? 'feature' : 'trait'}</button>
        </div>

        <Field label="Extra notes for players (optional)"><textarea className="input" value={e.notes || ''} onChange={(x) => up({ notes: x.target.value })} /></Field>

        <div className="stack">
          <span className="label">Art</span>
          {e.image && <Picture src={e.image} alt="" height={160} />}
          <ImagePicker value={e.image} onChange={(image) => up({ image })} />
        </div>

        <button type="button" className="btn" onClick={save}>Save</button>
        {existing && <ConfirmButton className="btn danger" confirmText="Tap again to delete for good" onConfirm={remove}>Delete</ConfirmButton>}
      </div>
    </div>
  );
}

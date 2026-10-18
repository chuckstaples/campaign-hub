import { useNavigate, useParams } from 'react-router-dom';
import { useHub } from '../lib/store.jsx';
import { BackLink, HelpButton, Nav, Picture, useToggle } from '../components/ui.jsx';
import { ABILITY_NAME } from '../lib/rules.js';

const Stat = ({ label, value }) => value ? <div className="stat"><span className="label">{label}</span><span style={{ fontSize: '0.9rem', lineHeight: 1.3 }}>{value}</span></div> : null;

function weaponText(list = []) {
  return list.map((w) => (w === 'simple' ? 'Simple weapons' : w === 'martial' ? 'Martial weapons' : w)).join(', ');
}

export default function EntryDetail() {
  const { id } = useParams();
  const { entries, isOwner } = useHub();
  const nav = useNavigate();
  const [open, toggle] = useToggle();
  const e = entries.find((x) => x.id === id && (x.visible || isOwner));
  if (!e) return <div className="shell"><div className="page" style={{ paddingTop: '1rem' }}><BackLink /><p className="lede">This isn&rsquo;t available.</p></div><Nav /></div>;

  const kindName = { race: 'Races', background: 'Backgrounds', class: 'Classes' }[e.kind];
  const make = () => nav('/character', { state: { pick: e } });

  return (
    <div className="shell">
      <div className="page" style={{ paddingTop: '0.6rem', gap: '1.1rem' }}>
        <BackLink label={kindName} />
        {!e.visible && <p className="banner" style={{ margin: 0 }}>Hidden from players. Only you can see this.</p>}
        {e.image && <Picture src={e.image} alt={`Art for ${e.name}`} height={210} />}
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="title" style={{ fontSize: '2.5rem' }}>{e.name}</h1>
          {e.summary && <p style={{ fontStyle: 'italic', lineHeight: 1.5, color: 'var(--muted)' }}>{e.summary}</p>}
          {e.source === 'Homebrew' && <span className="tag" style={{ alignSelf: 'flex-start' }}>Homebrew</span>}
        </div>

        {e.kind === 'race' && <div className="stats"><Stat label="Size" value={e.size} /><Stat label="Speed" value={e.speed} /><Stat label="Senses" value={e.senses || 'Normal'} /></div>}
        {e.kind === 'class' && <div className="stats"><Stat label="Hit die" value={`d${e.hitDie}`} /><Stat label="Saves" value={(e.saves || []).join(', ')} /><Stat label="Magic" value={e.casting ? `Uses ${e.casting}` : 'None at level 1'} /></div>}

        {(e.kind === 'race' || e.kind === 'background') && (
          <div className="soft">
            <div className="between">
              <h2 className="h2" style={{ fontSize: '1.25rem' }}>Ability bonuses</h2>
              <HelpButton open={open === 'ab'} onClick={() => toggle('ab')} label="How ability bonuses work" />
            </div>
            <div className="wrap" style={{ alignItems: 'center' }}>
              {(e.abilities || []).length === 6 ? <span className="small" style={{ color: 'inherit' }}>Any ability</span>
                : (e.abilities || []).map((a) => <span key={a} className="tag" style={{ background: 'var(--card)', fontWeight: 600 }} title={ABILITY_NAME[a]}>{a}</span>)}
            </div>
            {open === 'ab' && <p className="small" style={{ color: 'inherit' }}>You get +2 and +1 to place. They can go on any ability your race or your background lists.</p>}
          </div>
        )}

        {(e.skills || []).length > 0 && e.kind !== 'class' && (
          <div className="stack" style={{ gap: 6 }}>
            <span className="label">Skills you get</span>
            <div className="wrap">{e.skills.map((s) => <span key={s} className="tag">{s}</span>)}</div>
          </div>
        )}
        {e.kind === 'class' && (
          <div className="stack" style={{ gap: 6 }}>
            <span className="label">Pick {e.skillCount} skill{e.skillCount > 1 ? 's' : ''} from</span>
            <div className="wrap">{(e.skillList || []).map((s) => <span key={s} className="tag">{s}</span>)}</div>
            {(e.weapons || []).length > 0 && <><span className="label" style={{ marginTop: 8 }}>Weapons</span><p className="small">{weaponText(e.weapons)}</p></>}
          </div>
        )}

        {(e.traits || []).length > 0 && (
          <div className="stack" style={{ gap: '0.75rem' }}>
            <h2 className="h2">{e.kind === 'class' ? 'At level 1' : e.kind === 'background' ? 'Feature' : 'Traits'}</h2>
            {e.traits.map((t, i) => (
              <div key={i} className="stack" style={{ gap: 3, paddingBottom: '0.75rem', borderBottom: '1px solid var(--line)' }}>
                <span style={{ fontWeight: 600 }}>{t.name}</span>
                <span style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--muted)' }}>{t.text}</span>
              </div>
            ))}
          </div>
        )}
        {e.notes && <p style={{ lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{e.notes}</p>}

        <button type="button" className="btn" onClick={make}>Use this for my character</button>
      </div>
      <Nav />
    </div>
  );
}

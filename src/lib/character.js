import { ABILITIES, ABILITY_NAME, SKILLS, WEAPON_BY_NAME, PROF_BONUS, mod, sign, plus, parseDie, weaponProficient, weaponAbility } from './rules.js';

export const EMPTY_CHARACTER = {
  name: '', image: '', raceId: '', backgroundId: '', classId: '', classSkills: [],
  rolls: ['', '', '', '', '', ''], assign: {}, plus2: '', plus1: '', weapons: [], done: false,
};

const KEY = 'hub.character';
export function loadCharacter() {
  try { return { ...EMPTY_CHARACTER, ...(JSON.parse(localStorage.getItem(KEY)) || {}) }; } catch { return { ...EMPTY_CHARACTER }; }
}
export function saveCharacter(c) {
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* storage blocked */ }
}

const has = (entry, re) => !!entry?.traits?.some((t) => re.test(t.name));

export function deriveCharacter(c, byId) {
  const race = byId[c.raceId], bg = byId[c.backgroundId], cls = byId[c.classId];
  const eligible = [...new Set([...(race?.abilities || []), ...(bg?.abilities || [])])];

  const scores = {}, mods = {}, bonusOf = {};
  for (const a of ABILITIES) {
    const idx = c.assign[a.id];
    const base = idx == null || c.rolls[idx] === '' ? null : Number(c.rolls[idx]);
    const bonus = (c.plus2 === a.id && eligible.includes(a.id) ? 2 : 0) + (c.plus1 === a.id && eligible.includes(a.id) ? 1 : 0);
    bonusOf[a.id] = bonus;
    scores[a.id] = base == null ? null : base + bonus;
    mods[a.id] = scores[a.id] == null ? 0 : mod(scores[a.id]);
  }

  const skillSources = {};
  const addSkills = (list, from) => (list || []).forEach((s) => { (skillSources[s] ||= []).push(from); });
  addSkills(race?.skills, race?.name);
  addSkills(bg?.skills, bg?.name);
  addSkills(c.classSkills, cls?.name);
  const profSkills = new Set(Object.keys(skillSources));

  const saves = new Set(cls?.saves || []);
  const weaponProfs = [...(cls?.weapons || []), ...(race?.weapons || [])];
  const hp = cls ? Math.max(1, Number(cls.hitDie) + mods.CON) : null;
  const P = PROF_BONUS;

  const cards = [];
  const card = (o) => cards.push(o);

  // Initiative
  const hare = race && has(race, /hare-trigger/i);
  const initBonus = mods.DEX + (hare ? P : 0);
  card({ id: 'init', group: 'fight', name: 'Initiative', note: 'When a fight starts', formula: `d20${plus(initBonus)}`,
    dice: { n: 1, s: 20, b: initBonus },
    why: `Everyone rolls a d20 when a fight starts. You add Dexterity (${sign(mods.DEX)})${hare ? ` and your proficiency bonus (+${P}) from Hare-Trigger` : ''}.` });

  // Weapons
  for (const wName of c.weapons) {
    const w = WEAPON_BY_NAME[wName]; if (!w) continue;
    const ab = weaponAbility(w, mods);
    const prof = weaponProficient(w, weaponProfs);
    const hit = mods[ab] + (prof ? P : 0);
    const d = parseDie(w.die);
    const why = `To hit: d20 + ${ABILITY_NAME[ab]} (${sign(mods[ab])})${prof ? ` + proficiency (+${P})` : ', no proficiency bonus because you aren’t trained with it'}.`
      + ` Damage: the ${w.name.toLowerCase()}’s ${w.die} + ${ABILITY_NAME[ab]} (${sign(mods[ab])}).`
      + (w.finesse ? ' Finesse weapons use whichever is higher, Strength or Dexterity.' : '')
      + (w.ranged ? ' Ranged weapons use Dexterity.' : '');
    card({ id: `w-${w.name}`, group: 'fight', name: `${w.name} attack`, note: w.ranged ? `To hit, range ${w.ranged}` : w.thrown ? `To hit (can throw ${w.thrown})` : 'To hit',
      formula: `d20${plus(hit)}`, dice: { n: 1, s: 20, b: hit },
      extra: `Damage: ${w.die}${plus(mods[ab])} ${w.type}${w.versatile ? ` (${w.versatile} two-handed)` : ''}`, extraDice: { n: d.n, s: d.s, b: mods[ab] }, why });
  }

  // Natural weapons
  const natural = race?.traits?.find((t) => /^(cat.s claws|claws|talons|ram)$/i.test(t.name));
  if (natural) {
    const hit = mods.STR + P;
    card({ id: 'natural', group: 'fight', name: `${natural.name} (unarmed)`, note: 'To hit', formula: `d20${plus(hit)}`, dice: { n: 1, s: 20, b: hit },
      extra: `Damage: 1d6${plus(mods.STR)}`, extraDice: { n: 1, s: 6, b: mods.STR },
      why: `Everyone is proficient with unarmed strikes. To hit: d20 + Strength (${sign(mods.STR)}) + proficiency (+${P}). Damage: 1d6 + Strength.` });
  }
  if (cls && /monk/i.test(cls.name)) {
    const m = Math.max(mods.STR, mods.DEX), hit = m + P;
    card({ id: 'martial', group: 'fight', name: 'Unarmed strike (Martial Arts)', note: 'To hit, then a bonus-action strike', formula: `d20${plus(hit)}`,
      dice: { n: 1, s: 20, b: hit }, extra: `Damage: 1d4${plus(m)} bludgeoning`, extraDice: { n: 1, s: 4, b: m },
      why: `Monks can use Strength or Dexterity, whichever is higher (${sign(m)}), plus proficiency (+${P}).` });
  }

  // Spellcasting
  if (cls?.casting) {
    const cm = mods[cls.casting], hit = cm + P;
    card({ id: 'spell', group: 'fight', name: 'Spell attack', note: 'For spells that say "make a spell attack"', formula: `d20${plus(hit)}`,
      dice: { n: 1, s: 20, b: hit }, extra: `Spell save DC: ${8 + P + cm}`,
      why: `Spell attack: d20 + ${ABILITY_NAME[cls.casting]} (${sign(cm)}) + proficiency (+${P}). For spells that make enemies save, they need to beat ${8 + P + cm} (8 + ${P} + ${cm}).` });
  }

  // Class and race extras
  if (cls && has(cls, /sneak attack/i)) card({ id: 'sneak', group: 'fight', name: 'Sneak Attack', note: 'Extra damage, once per turn', formula: '+ 1d6', dice: { n: 1, s: 6, b: 0 },
    why: 'Add it when you hit with advantage, or when an ally is right next to your target.' });
  if (cls && has(cls, /^rage$/i)) card({ id: 'rage', group: 'fight', name: 'Rage', note: 'Bonus action, 2 times per long rest', formula: '+2 damage', dice: null,
    why: 'While raging, add +2 to melee weapon damage, and you take half damage from weapons.' });
  if (cls && has(cls, /second wind/i)) card({ id: 'wind', group: 'fight', name: 'Second Wind', note: 'Heal yourself, once per rest', formula: '1d10 + 1', dice: { n: 1, s: 10, b: 1 },
    why: 'Roll a d10 and add your level (1). That many hit points come back.' });
  if (cls && has(cls, /bardic inspiration/i)) card({ id: 'insp', group: 'fight', name: 'Bardic Inspiration', note: 'Give to an ally', formula: 'd6', dice: { n: 1, s: 6, b: 0 },
    why: `Your ally keeps the d6 and adds it to one roll later. You can do this ${Math.max(1, mods.CHA)} time${Math.max(1, mods.CHA) > 1 ? 's' : ''} per long rest.` });
  if (race && has(race, /breath weapon/i)) {
    const dc = 8 + mods.CON + P;
    card({ id: 'breath', group: 'fight', name: 'Breath Weapon', note: 'Action, once per rest', formula: '2d6', dice: { n: 2, s: 6, b: 0 }, extra: `They save against DC ${dc}`,
      why: `Everyone in the area rolls a save. They need ${dc} (8 + Constitution ${sign(mods.CON)} + proficiency +${P}). They take 2d6, or half if they make it.` });
  }
  if (race && has(race, /healing hands/i)) card({ id: 'hands', group: 'fight', name: 'Healing Hands', note: 'Heal by touch, once per long rest', formula: '2d4', dice: { n: 2, s: 4, b: 0 },
    why: `Roll a number of d4s equal to your proficiency bonus (${P}). That many hit points come back.` });
  if (race && has(race, /stone.s endurance/i)) card({ id: 'stone', group: 'fight', name: 'Stone’s Endurance', note: 'Reaction when you take damage', formula: `1d12${plus(mods.CON)}`, dice: { n: 1, s: 12, b: mods.CON },
    why: `Take that much off the damage. The roll is a d12 + Constitution (${sign(mods.CON)}).` });

  // Skills: proficient first
  const skillCards = SKILLS.map((s) => {
    const prof = profSkills.has(s.name);
    const b = mods[s.ability] + (prof ? P : 0);
    const from = skillSources[s.name];
    return { id: `s-${s.name}`, group: 'check', name: s.name, note: s.note, proficient: prof, formula: `d20${plus(b)}`, dice: { n: 1, s: 20, b },
      why: `${ABILITY_NAME[s.ability]} (${sign(mods[s.ability])})${prof ? ` + proficiency (+${P}), from ${from.join(' and ')}.` : '. You aren’t proficient, so nothing else is added.'}` };
  });
  skillCards.sort((a, b) => Number(b.proficient) - Number(a.proficient));
  cards.push(...skillCards);

  // Saves
  for (const a of ABILITIES) {
    const prof = saves.has(a.id);
    const b = mods[a.id] + (prof ? P : 0);
    cards.push({ id: `save-${a.id}`, group: 'save', name: `${a.name} save`, proficient: prof, note: SAVE_NOTES[a.id], formula: `d20${plus(b)}`, dice: { n: 1, s: 20, b },
      why: `${a.name} (${sign(mods[a.id])})${prof ? ` + proficiency (+${P}), because ${cls.name}s are trained in ${a.name} saves.` : '. You aren’t proficient, so nothing else is added.'}` });
  }

  return { race, bg, cls, eligible, scores, mods, bonusOf, profSkills, skillSources, hp, cards, weaponProfs };
}

const SAVE_NOTES = {
  STR: 'Being pushed, held or knocked down', DEX: 'Dodging traps and blasts', CON: 'Poison, cold, toughing it out',
  INT: 'Resisting mind tricks', WIS: 'Fear and charm effects', CHA: 'Being banished or possessed',
};

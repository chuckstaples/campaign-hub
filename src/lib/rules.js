// Core D&D math and reference data used across the app.

export const ABILITIES = [
  { id: 'STR', name: 'Strength' },
  { id: 'DEX', name: 'Dexterity' },
  { id: 'CON', name: 'Constitution' },
  { id: 'INT', name: 'Intelligence' },
  { id: 'WIS', name: 'Wisdom' },
  { id: 'CHA', name: 'Charisma' },
];
export const ABILITY_NAME = Object.fromEntries(ABILITIES.map((a) => [a.id, a.name]));

export const SKILLS = [
  { name: 'Acrobatics', ability: 'DEX', note: 'Flips, balance, tumbling' },
  { name: 'Animal Handling', ability: 'WIS', note: 'Calming or steering animals' },
  { name: 'Arcana', ability: 'INT', note: 'Knowing about magic' },
  { name: 'Athletics', ability: 'STR', note: 'Climbing, jumping, swimming, shoving' },
  { name: 'Deception', ability: 'CHA', note: 'Lying convincingly' },
  { name: 'History', ability: 'INT', note: 'Remembering the past' },
  { name: 'Insight', ability: 'WIS', note: 'Reading people' },
  { name: 'Intimidation', ability: 'CHA', note: 'Scaring someone into it' },
  { name: 'Investigation', ability: 'INT', note: 'Searching for clues' },
  { name: 'Medicine', ability: 'WIS', note: 'Treating wounds, diagnosing' },
  { name: 'Nature', ability: 'INT', note: 'Plants, animals, weather' },
  { name: 'Perception', ability: 'WIS', note: 'Noticing things' },
  { name: 'Performance', ability: 'CHA', note: 'Music, acting, storytelling' },
  { name: 'Persuasion', ability: 'CHA', note: 'Talking someone round' },
  { name: 'Religion', ability: 'INT', note: 'Gods, rites, holy things' },
  { name: 'Sleight of Hand', ability: 'DEX', note: 'Palming, pickpocketing' },
  { name: 'Stealth', ability: 'DEX', note: 'Sneaking and hiding' },
  { name: 'Survival', ability: 'WIS', note: 'Tracking, foraging, finding the way' },
];
export const SKILL_NAMES = SKILLS.map((s) => s.name);

// Weapons: die, damage type, category, properties.
export const WEAPONS = [
  { name: 'Club', die: '1d4', type: 'bludgeoning', cat: 'simple' },
  { name: 'Dagger', die: '1d4', type: 'piercing', cat: 'simple', finesse: true, thrown: '20/60 ft' },
  { name: 'Greatclub', die: '1d8', type: 'bludgeoning', cat: 'simple' },
  { name: 'Handaxe', die: '1d6', type: 'slashing', cat: 'simple', thrown: '20/60 ft' },
  { name: 'Javelin', die: '1d6', type: 'piercing', cat: 'simple', thrown: '30/120 ft' },
  { name: 'Light hammer', die: '1d4', type: 'bludgeoning', cat: 'simple', thrown: '20/60 ft' },
  { name: 'Mace', die: '1d6', type: 'bludgeoning', cat: 'simple' },
  { name: 'Quarterstaff', die: '1d6', type: 'bludgeoning', cat: 'simple', versatile: '1d8' },
  { name: 'Sickle', die: '1d4', type: 'slashing', cat: 'simple' },
  { name: 'Spear', die: '1d6', type: 'piercing', cat: 'simple', thrown: '20/60 ft', versatile: '1d8' },
  { name: 'Light crossbow', die: '1d8', type: 'piercing', cat: 'simple', ranged: '80/320 ft' },
  { name: 'Dart', die: '1d4', type: 'piercing', cat: 'simple', finesse: true, ranged: '20/60 ft' },
  { name: 'Shortbow', die: '1d6', type: 'piercing', cat: 'simple', ranged: '80/320 ft' },
  { name: 'Sling', die: '1d4', type: 'bludgeoning', cat: 'simple', ranged: '30/120 ft' },
  { name: 'Battleaxe', die: '1d8', type: 'slashing', cat: 'martial', versatile: '1d10' },
  { name: 'Flail', die: '1d8', type: 'bludgeoning', cat: 'martial' },
  { name: 'Glaive', die: '1d10', type: 'slashing', cat: 'martial' },
  { name: 'Greataxe', die: '1d12', type: 'slashing', cat: 'martial' },
  { name: 'Greatsword', die: '2d6', type: 'slashing', cat: 'martial' },
  { name: 'Halberd', die: '1d10', type: 'slashing', cat: 'martial' },
  { name: 'Longsword', die: '1d8', type: 'slashing', cat: 'martial', versatile: '1d10' },
  { name: 'Maul', die: '2d6', type: 'bludgeoning', cat: 'martial' },
  { name: 'Morningstar', die: '1d8', type: 'piercing', cat: 'martial' },
  { name: 'Rapier', die: '1d8', type: 'piercing', cat: 'martial', finesse: true },
  { name: 'Scimitar', die: '1d6', type: 'slashing', cat: 'martial', finesse: true },
  { name: 'Shortsword', die: '1d6', type: 'piercing', cat: 'martial', finesse: true },
  { name: 'Trident', die: '1d6', type: 'piercing', cat: 'martial', thrown: '20/60 ft', versatile: '1d8' },
  { name: 'War pick', die: '1d8', type: 'piercing', cat: 'martial' },
  { name: 'Warhammer', die: '1d8', type: 'bludgeoning', cat: 'martial', versatile: '1d10' },
  { name: 'Whip', die: '1d4', type: 'slashing', cat: 'martial', finesse: true },
  { name: 'Hand crossbow', die: '1d6', type: 'piercing', cat: 'martial', ranged: '30/120 ft' },
  { name: 'Heavy crossbow', die: '1d10', type: 'piercing', cat: 'martial', ranged: '100/400 ft' },
  { name: 'Longbow', die: '1d8', type: 'piercing', cat: 'martial', ranged: '150/600 ft' },
];
export const WEAPON_BY_NAME = Object.fromEntries(WEAPONS.map((w) => [w.name, w]));

export const PROF_BONUS = 2; // level 1

// Table rule: modifiers never go below +0 (official rules allow negatives).
export const NO_NEGATIVE_MODS = true;
export const mod = (score) => {
  const m = Math.floor((score - 10) / 2);
  return NO_NEGATIVE_MODS ? Math.max(0, m) : m;
};

// What each class usually carries. Players pick from weapons their class
// (and race) trains them with; these show first as the usual choices.
export const SUGGESTED_WEAPONS = {
  Artificer: ['Light crossbow', 'Light hammer', 'Dagger'],
  Barbarian: ['Greataxe', 'Handaxe', 'Javelin'],
  Bard: ['Rapier', 'Dagger', 'Longsword'],
  'Blood Hunter': ['Longsword', 'Greatsword', 'Hand crossbow'],
  Cleric: ['Mace', 'Light crossbow', 'Quarterstaff'],
  Druid: ['Quarterstaff', 'Scimitar', 'Sling'],
  Fighter: ['Longsword', 'Greatsword', 'Longbow', 'Handaxe'],
  Monk: ['Shortsword', 'Quarterstaff', 'Dart'],
  Paladin: ['Longsword', 'Warhammer', 'Javelin'],
  Ranger: ['Longbow', 'Shortsword', 'Scimitar'],
  Rogue: ['Shortsword', 'Dagger', 'Shortbow', 'Rapier'],
  Sorcerer: ['Quarterstaff', 'Dagger', 'Light crossbow'],
  Warlock: ['Light crossbow', 'Dagger', 'Quarterstaff'],
  Wizard: ['Quarterstaff', 'Dagger'],
};

// Which ability a weapon uses, given the character's modifiers.
export function weaponAbility(w, mods) {
  if (w.ranged) return 'DEX';
  if (w.finesse) return mods.DEX >= mods.STR ? 'DEX' : 'STR';
  return 'STR';
}
export function weaponUses(w) {
  if (w.ranged) return 'Dexterity';
  if (w.finesse) return 'Strength or Dexterity';
  return 'Strength';
}
export const sign = (n) => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`);
// "d20 + 5", "d20 − 1", "d20"
export const plus = (n) => (n === 0 ? '' : n > 0 ? ` + ${n}` : ` − ${Math.abs(n)}`);

export function roll4d6() {
  const d = [0, 0, 0, 0].map(() => 1 + Math.floor(Math.random() * 6)).sort((a, b) => a - b);
  return d[1] + d[2] + d[3];
}

// Parse "2d6" -> {n:2, s:6}
export function parseDie(str) {
  const m = /^(\d*)d(\d+)$/.exec(str || '');
  if (!m) return null;
  return { n: Number(m[1] || 1), s: Number(m[2]) };
}

export function rollFormula(n, sides, bonus = 0) {
  const dice = [];
  for (let i = 0; i < n; i++) dice.push(1 + Math.floor(Math.random() * sides));
  const raw = dice.reduce((a, b) => a + b, 0);
  return { dice, raw, total: raw + bonus };
}

// Does a class's weapon list cover this weapon?
export function weaponProficient(weapon, profs = []) {
  return profs.includes(weapon.cat) || profs.includes(weapon.name);
}

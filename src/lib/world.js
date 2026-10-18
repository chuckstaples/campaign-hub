// World entries (people, places, lore) and their piece-by-piece reveals.
//
// An entry's name, picture and description are revealed together with the
// entry's "visible" switch. Each extra fact (a connection or a note) is
// revealed on its own. Revealed facts are stored on the entry, which players
// can read. Hidden facts and the DM's private notes are stored in a separate
// DM-only "secret" record, so players' phones never receive them.

export const WORLD_KINDS = [
  { id: 'npc', label: 'People', one: 'person', plural: 'people' },
  { id: 'place', label: 'Places', one: 'place', plural: 'places' },
  { id: 'lore', label: 'Lore', one: 'lore entry', plural: 'lore entries' },
];
export const isWorldKind = (k) => WORLD_KINDS.some((w) => w.id === k);
export const worldKind = (k) => WORLD_KINDS.find((w) => w.id === k);

export const newFactId = () => `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

// All facts for the DM, in order, each marked revealed or not.
export function allFacts(entry, secret) {
  const shown = (entry?.facts || []).map((f) => ({ ...f, revealed: true }));
  const hidden = (secret?.facts || []).map((f) => ({ ...f, revealed: false }));
  return [...shown, ...hidden].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// Split an edited fact list back into the public entry and the secret record.
export function splitFacts(facts) {
  const clean = (f, i) => ({ id: f.id, type: f.type, text: f.text, linkId: f.linkId || '', order: i });
  const kept = facts.filter((f) => f.text.trim() || f.linkId);
  return {
    shown: kept.map((f, i) => ({ f, i })).filter(({ f }) => f.revealed).map(({ f, i }) => clean(f, i)),
    hidden: kept.map((f, i) => ({ f, i })).filter(({ f }) => !f.revealed).map(({ f, i }) => clean(f, i)),
  };
}

// Flip one fact between revealed and hidden. Returns the new entry and secret.
export function toggleFact(entry, secret, factId, revealed) {
  const facts = allFacts(entry, secret).map((f) => (f.id === factId ? { ...f, revealed } : f));
  const { shown, hidden } = splitFacts(facts);
  return { entry: { ...entry, facts: shown }, secret: { ...(secret || {}), facts: hidden } };
}

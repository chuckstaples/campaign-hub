// End-to-end walkthrough of the demo build: browse, filter, DM reveal, make a character, check rolls.
import { describe, it, expect, beforeAll, vi } from 'vitest';

// Run the walkthrough in demo mode (no Firebase).
vi.mock('./lib/firebaseConfig.js', () => ({ firebaseConfig: null }));
import { render, screen, within, fireEvent, act } from '@testing-library/react';
import { HubProvider } from './lib/store.jsx';
import App from './App.jsx';

const click = (el) => act(() => { fireEvent.click(el); });
const go = (hash) => act(() => { window.location.hash = hash; });
const btn = (name) => screen.getByRole('button', { name });

describe('Campaign Hub (demo mode)', () => {
  beforeAll(() => {
    localStorage.clear();
    window.location.hash = '#/options';
    render(<HubProvider><App /></HubProvider>);
  });

  it('lists races and filters them', async () => {
    expect(await screen.findByRole('heading', { name: 'Character Options' })).toBeTruthy();
    expect(screen.getByText('Tabaxi')).toBeTruthy();
    click(btn('Can fly'));
    expect(screen.getByText('Aarakocra')).toBeTruthy();
    expect(screen.queryByText('Dwarf')).toBeNull();
    expect(screen.getByText('Showing 3 of 25')).toBeTruthy();
    click(btn('Clear filters'));
    expect(screen.getByText('Dwarf')).toBeTruthy();
  });

  it('opens a race page with its traits', async () => {
    click(screen.getByText('Tabaxi'));
    expect(await screen.findByText('Feline Agility')).toBeTruthy();
    expect(screen.getByText('DEX')).toBeTruthy();
  });

  it('lets the DM hide and reveal entries', async () => {
    go('#/dm');
    expect(await screen.findByRole('heading', { name: 'Your content' })).toBeTruthy();
    const sw = screen.getByRole('switch', { name: 'Visible to players: Dwarf' });
    click(sw);
    expect(sw.getAttribute('aria-checked')).toBe('false');
    go('#/options');
    await screen.findByRole('heading', { name: 'Character Options' });
    expect(screen.queryByText('Dwarf')).toBeNull();
    expect(screen.getByText('Showing 24 of 24')).toBeTruthy();
  });

  it('builds a character step by step', async () => {
    go('#/character');
    fireEvent.change(await screen.findByPlaceholderText('What are they called?'), { target: { value: 'Pip' } });
    click(btn('Next: Race'));
    click(screen.getByText('Tabaxi').closest('button'));
    click(btn('Next: Background'));
    click(screen.getByText('Criminal').closest('button'));
    click(btn('Next: Class'));
    click(screen.getByText('Rogue').closest('button'));
    for (const s of ['Acrobatics', 'Insight', 'Investigation', 'Sleight of Hand']) click(btn(s));
    expect(screen.getByRole('button', { name: /Stealth · have it/ }).disabled).toBe(true);
    click(btn('Next: Ability scores'));

    [15, 14, 13, 12, 10, 8].forEach((v, i) => fireEvent.change(screen.getByLabelText(`Roll ${i + 1}`), { target: { value: String(v) } }));
    click(btn('Done'));
    const order = { Dexterity: 15, Wisdom: 14, Constitution: 13, Charisma: 12, Intelligence: 10, Strength: 8 };
    for (const [ab, v] of Object.entries(order)) {
      const slot = btn(`Choose a number for ${ab}`);
      if (slot.getAttribute('aria-expanded') !== 'true') click(slot);
      const chip = screen.getAllByRole('button').find((b) => b.classList.contains('roll-in') && b.firstChild.textContent === String(v));
      click(chip);
    }
    expect(btn('Choose a number for Strength').textContent).toBe('8');
    click(btn('Strength modifier, explain'));
    expect(screen.getByText(/8 gives \+0\. At this table it never goes below \+0/)).toBeTruthy();
    const plusRows = screen.getAllByText(/goes to/);
    click(within(plusRows[0].nextElementSibling).getByRole('button', { name: 'DEX' }));
    click(within(plusRows[1].nextElementSibling).getByRole('button', { name: 'CON' }));
    click(btn('Dexterity modifier, explain'));
    expect(screen.getByText(/15 \+ 2 bonus = 17/)).toBeTruthy();
    click(btn('Next: Weapons'));
    expect(screen.getByText('Usual for a Rogue')).toBeTruthy();
    expect(screen.queryByText('Greataxe')).toBeNull();
    const sword = screen.getByText('Shortsword').closest('button');
    expect(within(sword).getByText(/Uses Strength or Dexterity, whichever is higher \(DEX \+3\)/)).toBeTruthy();
    click(sword);
    click(btn('Next: Review'));
    expect(screen.getByRole('button', { name: /HP/ }).textContent).toContain('10'); // HP: d8 + Con +2
    click(btn('Save character'));

    expect(await screen.findByRole('heading', { name: 'What do I roll?' })).toBeTruthy();
    expect(screen.getByText('Shortsword attack')).toBeTruthy();
    expect(screen.getByText('Damage: 1d6 + 3 piercing')).toBeTruthy();
    expect(screen.getByText('Sneak Attack')).toBeTruthy();
    click(btn('Why d20 + 3 for Initiative?'));
    expect(screen.getByText(/You add Dexterity \(\+3\)/)).toBeTruthy();
    click(btn('Checks'));
    const stealth = screen.getByText('Stealth').closest('.card');
    expect(within(stealth).getByText('d20 + 5')).toBeTruthy();
    click(within(stealth).getByRole('button', { name: 'Roll for me' }));
    expect(within(stealth).getByText(/^(Natural (20!|1\.) )?Rolled \d+ \+ 5 = \d+$/)).toBeTruthy();
  });

  it('switches theme and text size', async () => {
    go('#/settings');
    click((await screen.findByText('Moonlit Tower')).closest('button'));
    expect(document.documentElement.dataset.theme).toBe('moon');
    click(btn('Bigger text'));
    expect(document.documentElement.dataset.size).toBe('l');
  });

  it('asks for a second tap before deleting', async () => {
    go('#/dm/edit/race-orc');
    const del = await screen.findByRole('button', { name: 'Delete' });
    click(del);
    expect(screen.getByText('Tap again to delete for good')).toBeTruthy();
    click(screen.getByText('Tap again to delete for good').closest('button'));
    await screen.findByRole('heading', { name: 'Your content' });
    expect(screen.queryByText('Orc')).toBeNull();
  });

  it('shows the World tab with revealed entries and lets the DM reveal facts one at a time', async () => {
    go('#/world');
    expect(await screen.findByRole('heading', { name: 'The World' })).toBeTruthy();
    click(screen.getByText('Marta Thistledown'));
    expect(await screen.findByText('Things to discover')).toBeTruthy();
    const fact = screen.getByRole('switch', { name: /Reveal: Runs the inn in/ });
    expect(fact.getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('link', { name: 'Briarford' })).toBeTruthy();
    click(fact);
    expect(screen.getByRole('switch', { name: /Reveal: Runs the inn in/ }).getAttribute('aria-checked')).toBe('false');
    const stored = JSON.parse(localStorage.getItem('hub.demo.secrets'));
    expect(stored['npc-demo-marta'].facts[0].text).toBe('Runs the inn in');
    const entries = JSON.parse(localStorage.getItem('hub.demo.entries'));
    expect(entries.find((e) => e.id === 'npc-demo-marta').facts).toHaveLength(0);
  });

  it('lets the DM add a lore entry with a hidden note', async () => {
    localStorage.removeItem('hub.demo.seedVersion');
    go('#/dm');
    click(await screen.findByRole('button', { name: 'World' }));
    click(btn('Lore'));
    expect(screen.getByText('The Drowned Bell')).toBeTruthy();
    click(btn(/New lore entry/));
    fireEvent.change(await screen.findByPlaceholderText(/A local legend/), { target: { value: 'An old tale' } });
    const nameInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(nameInput, { target: { value: 'The Sunken Crown' } });
    click(btn('Note'));
    fireEvent.change(screen.getByPlaceholderText('Something the party can learn'), { target: { value: 'The crown is cursed.' } });
    fireEvent.change(screen.getByPlaceholderText(/Secrets, plans/), { target: { value: 'Ties to the lich.' } });
    click(btn('Save'));
    expect(await screen.findByRole('heading', { name: 'The Sunken Crown' })).toBeTruthy();
    expect(screen.getByText('The crown is cursed.')).toBeTruthy();
    expect(screen.getByText('Ties to the lich.')).toBeTruthy();
    const entries = JSON.parse(localStorage.getItem('hub.demo.entries'));
    const crown = entries.find((e) => e.name === 'The Sunken Crown');
    expect(crown.facts).toHaveLength(0);
    expect(JSON.stringify(crown)).not.toContain('cursed');
  });

  it('runs a fight in the combat tracker', async () => {
    go('#/dm/combat');
    expect(await screen.findByRole('heading', { name: 'Combat' })).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText('Character name'), { target: { value: 'Pip' } });
    fireEvent.change(screen.getByLabelText('Initiative'), { target: { value: '15' } });
    click(btn('Add player'));
    click(btn('Monster'));
    fireEvent.change(screen.getByPlaceholderText('e.g. Goblin'), { target: { value: 'Goblin' } });
    fireEvent.change(screen.getByLabelText('HP'), { target: { value: '7' } });
    fireEvent.change(screen.getByLabelText('How many'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Or set initiative'), { target: { value: '10' } });
    click(btn('Add monster'));
    expect(screen.getByText('Goblin 1')).toBeTruthy();
    expect(screen.getByText('Goblin 2')).toBeTruthy();
    click(btn('Start the fight'));
    expect(screen.getByText(/Now:/).textContent).toContain('Pip');
    click(btn('Next turn'));
    expect(screen.getByText(/Now:/).textContent).toContain('Goblin 1');
    click(screen.getAllByText('Goblin 1').find((n) => n.closest('.card')).closest('button'));
    fireEvent.change(screen.getByPlaceholderText('Amount'), { target: { value: '9' } });
    click(btn('Damage'));
    expect(screen.getByText('Down')).toBeTruthy();
    click(btn('Next turn'));
    expect(screen.getByText(/Now:/).textContent).toContain('Goblin 2');
    click(btn('Next turn'));
    expect(screen.getByText(/Now:/).textContent).toContain('Pip');
    expect(screen.getByText('Round 2')).toBeTruthy();
  });
});

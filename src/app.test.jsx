// End-to-end walkthrough of the demo build: browse, filter, DM reveal, make a character, check rolls.
import { describe, it, expect, beforeAll } from 'vitest';
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
});

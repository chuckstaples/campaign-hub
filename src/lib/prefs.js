export const THEMES = [
  { id: 'candle', name: 'Candlelit Library', tag: 'Light academia · the default', swatch: ['#F3ECDD', '#2E4B3C', '#A8823A'] },
  { id: 'fey', name: 'Feywild Morning', tag: 'Soft greens and lilac, extra whimsy', swatch: ['#EDF1E4', '#5B3F7A', '#7E9852'] },
  { id: 'moon', name: 'Moonlit Tower', tag: 'Dark mode for late sessions', swatch: ['#1C2030', '#D4B26A', '#8B93B5'] },
  { id: 'plain', name: 'Plain & Clear', tag: 'Simple and easiest to read', swatch: ['#FFFFFF', '#1F4E9A', '#888888'] },
];
export const SIZES = [
  { id: 's', label: 'Smaller text', px: 14 },
  { id: 'm', label: 'Normal text', px: 17 },
  { id: 'l', label: 'Bigger text', px: 21 },
];

const read = (k, d) => { try { return localStorage.getItem(k) || d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };

export function getPrefs() { return { theme: read('hub.theme', 'candle'), size: read('hub.size', 'm') }; }
export function applyPrefs({ theme, size }) {
  const root = document.documentElement;
  root.dataset.theme = theme; root.dataset.size = size;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = getComputedStyle(root).getPropertyValue('--bg').trim() || '#F3ECDD';
}
export function setPrefs(p) { write('hub.theme', p.theme); write('hub.size', p.size); applyPrefs(p); }

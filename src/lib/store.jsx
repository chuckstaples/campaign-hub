import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { firebaseConfig } from './firebaseConfig.js';
import { SEED_VERSION, demoSeed } from './seed.js';

const HubContext = createContext(null);
export const useHub = () => useContext(HubContext);

const LS = {
  get(k, fallback) { try { const v = localStorage.getItem(k); return v == null ? fallback : JSON.parse(v); } catch { return fallback; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};

const MODE = firebaseConfig ? 'firebase' : 'demo';

export function HubProvider({ children }) {
  const [fb, setFb] = useState(null);
  const [authReady, setAuthReady] = useState(MODE === 'demo');
  const [user, setUser] = useState(null);
  const [campaignId, setCampaignId] = useState(() => (MODE === 'demo' ? 'demo' : LS.get('hub.campaignId', null)));
  const [campaign, setCampaign] = useState(MODE === 'demo' ? { id: 'demo', name: 'Demo campaign', code: 'DEMO' } : null);
  const [entries, setEntries] = useState(() => {
    if (MODE !== 'demo') return [];
    if (LS.get('hub.demo.seedVersion', 1) !== SEED_VERSION) { LS.set('hub.demo.seedVersion', SEED_VERSION); return demoSeed(); }
    return LS.get('hub.demo.entries', null) || demoSeed();
  });
  const [sync, setSync] = useState({ pending: 0, fromCache: false });
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [entriesReady, setEntriesReady] = useState(MODE === 'demo');
  const [error, setError] = useState('');

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Firebase: load lazily and listen for sign-in changes.
  useEffect(() => {
    if (MODE !== 'firebase') return;
    let unsub = () => {};
    import('./firebaseStore.js').then(({ createFirebaseStore }) => {
      const store = createFirebaseStore(firebaseConfig);
      setFb(store);
      unsub = store.onAuth((u) => { setUser(u); setAuthReady(true); });
    });
    return () => unsub();
  }, []);

  // Demo: persist edits on this device.
  useEffect(() => { if (MODE === 'demo') LS.set('hub.demo.entries', entries); }, [entries]);

  // Firebase: watch the joined campaign.
  useEffect(() => {
    if (!fb || !campaignId) { if (MODE === 'firebase') setCampaign(null); return; }
    return fb.watchCampaign(campaignId, setCampaign);
  }, [fb, campaignId]);

  const isOwner = MODE === 'demo' || (!!user && !!campaign && campaign.ownerUid === user.uid);

  // Firebase: watch entries. The DM gets everything, players only revealed ones.
  useEffect(() => {
    if (!fb || !campaignId || !authReady || !campaign) return;
    setEntriesReady(false);
    return fb.watchEntries(campaignId, { includeHidden: isOwner }, (list, meta) => {
      setEntries(list); setSync(meta); setEntriesReady(true);
    }, (e) => { console.error(e); setError('Could not load this campaign.'); setEntriesReady(true); });
  }, [fb, campaignId, authReady, campaign, isOwner]);

  const join = useCallback(async (code) => {
    if (!fb) return 'Still starting up. Try again in a second.';
    try {
      const cid = await fb.lookupCode(code);
      if (!cid) return 'No campaign has that code. Check it with your DM.';
      LS.set('hub.campaignId', cid); setCampaignId(cid); return null;
    } catch {
      return 'You need internet the first time you join. After that it works offline.';
    }
  }, [fb]);

  const openCampaign = useCallback((cid) => { LS.set('hub.campaignId', cid); setCampaignId(cid); }, []);
  const leave = useCallback(() => { LS.del('hub.campaignId'); setCampaignId(null); setEntries([]); }, []);

  const saveEntry = useCallback((entry) => {
    if (MODE === 'demo') {
      setEntries((list) => (list.some((e) => e.id === entry.id) ? list.map((e) => (e.id === entry.id ? entry : e)) : [...list, entry]));
    } else fb?.saveEntry(campaignId, entry);
  }, [fb, campaignId]);

  const setVisible = useCallback((ids, visible) => {
    if (MODE === 'demo') setEntries((list) => list.map((e) => (ids.includes(e.id) ? { ...e, visible } : e)));
    else fb?.setVisible(campaignId, ids, visible);
  }, [fb, campaignId]);

  const deleteEntry = useCallback((id) => {
    if (MODE === 'demo') setEntries((list) => list.filter((e) => e.id !== id));
    else fb?.deleteEntry(campaignId, id);
  }, [fb, campaignId]);

  const resetDemo = useCallback(() => { if (MODE === 'demo') setEntries(demoSeed()); }, []);

  const value = useMemo(() => {
    const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));
    return {
      mode: MODE, ready: authReady && (MODE === 'demo' || !!fb), entriesReady, error,
      user, isOwner, campaign, campaignId,
      entries: sorted,
      visibleEntries: sorted.filter((e) => e.visible),
      online, pending: sync.pending, fromCache: sync.fromCache,
      join, leave, openCampaign, saveEntry, setVisible, deleteEntry, resetDemo,
      signIn: () => fb?.signIn(), signOut: () => fb?.signOut(),
      myCampaigns: () => (fb && user ? fb.myCampaigns(user.uid) : Promise.resolve([])),
      createCampaign: (name) => fb.createCampaign(name, user.uid),
      deleteCampaign: async (cid) => {
        await fb.deleteCampaign(cid);
        if (cid === campaignId) { LS.del('hub.campaignId'); setCampaignId(null); setEntries([]); }
      },
    };
  }, [entries, authReady, fb, entriesReady, error, user, isOwner, campaign, campaignId, online, sync, join, leave, openCampaign, saveEntry, setVisible, deleteEntry, resetDemo]);

  return <HubContext.Provider value={value}>{children}</HubContext.Provider>;
}

export { LS };

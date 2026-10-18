// Firebase (Firestore) backend. Firestore keeps a copy of everything on the
// phone, so reads work offline and writes queue until a connection returns.
import { initializeApp } from 'firebase/app';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  collection, doc, getDoc, getDocs, onSnapshot, query, where, setDoc, deleteDoc,
  writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { seedEntries } from './seed.js';

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const makeCode = () => Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

export function createFirebaseStore(config) {
  const app = initializeApp(config);
  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
  const auth = getAuth(app);

  const entriesCol = (cid) => collection(db, 'campaigns', cid, 'entries');
  const clean = (e) => JSON.parse(JSON.stringify(e)); // drop undefined values

  return {
    mode: 'firebase',

    onAuth(cb) { return onAuthStateChanged(auth, cb); },
    async signIn() { await signInWithPopup(auth, new GoogleAuthProvider()); },
    async signOut() { await fbSignOut(auth); },

    async lookupCode(code) {
      const snap = await getDoc(doc(db, 'codes', code.trim().toUpperCase()));
      return snap.exists() ? snap.data().campaignId : null;
    },

    async getCampaign(cid) {
      const snap = await getDoc(doc(db, 'campaigns', cid));
      return snap.exists() ? { id: cid, ...snap.data() } : null;
    },

    watchCampaign(cid, cb) {
      return onSnapshot(doc(db, 'campaigns', cid), (s) => cb(s.exists() ? { id: cid, ...s.data() } : null), () => cb(null));
    },

    async myCampaigns(uid) {
      const snap = await getDocs(query(collection(db, 'campaigns'), where('ownerUid', '==', uid)));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },

    async createCampaign(name, uid) {
      const ref = doc(collection(db, 'campaigns'));
      let code = makeCode();
      // Avoid the (unlikely) case of a code already in use.
      for (let i = 0; i < 5 && (await getDoc(doc(db, 'codes', code))).exists(); i++) code = makeCode();
      await setDoc(ref, { name, code, ownerUid: uid, createdAt: serverTimestamp() });
      await setDoc(doc(db, 'codes', code), { campaignId: ref.id, ownerUid: uid });
      const entries = seedEntries();
      for (let i = 0; i < entries.length; i += 400) {
        const batch = writeBatch(db);
        entries.slice(i, i + 400).forEach((e) => batch.set(doc(db, 'campaigns', ref.id, 'entries', e.id), { ...clean(e), updatedAt: serverTimestamp() }));
        await batch.commit();
      }
      return ref.id;
    },

    // Delete a campaign the signed-in DM owns: entries first (the rules check
    // ownership through the campaign), then the join code, then the campaign.
    async deleteCampaign(cid) {
      const camp = await getDoc(doc(db, 'campaigns', cid));
      if (!camp.exists()) return;
      const entries = await getDocs(entriesCol(cid));
      for (let i = 0; i < entries.docs.length; i += 400) {
        const batch = writeBatch(db);
        entries.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
      const secrets = await getDocs(collection(db, 'campaigns', cid, 'secrets'));
      for (let i = 0; i < secrets.docs.length; i += 400) {
        const batch = writeBatch(db);
        secrets.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
      const code = camp.data().code;
      if (code) await deleteDoc(doc(db, 'codes', code));
      await deleteDoc(doc(db, 'campaigns', cid));
    },

    // cb(entries, {pending, fromCache}); players only receive revealed entries.
    watchEntries(cid, { includeHidden }, cb, onError) {
      const q = includeHidden ? entriesCol(cid) : query(entriesCol(cid), where('visible', '==', true));
      return onSnapshot(q, { includeMetadataChanges: true }, (snap) => {
        const pending = snap.docs.filter((d) => d.metadata.hasPendingWrites).length;
        cb(snap.docs.map((d) => ({ ...d.data(), id: d.id })), { pending, fromCache: snap.metadata.fromCache });
      }, onError);
    },

    // Writes are not awaited: offline they wait in the queue and sync later.
    saveEntry(cid, entry) {
      setDoc(doc(db, 'campaigns', cid, 'entries', entry.id), { ...clean(entry), updatedAt: serverTimestamp() }).catch(console.error);
    },
    setVisible(cid, ids, visible) {
      const batch = writeBatch(db);
      ids.forEach((id) => batch.update(doc(db, 'campaigns', cid, 'entries', id), { visible, updatedAt: serverTimestamp() }));
      batch.commit().catch(console.error);
    },
    deleteEntry(cid, id) {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'campaigns', cid, 'entries', id));
      batch.delete(doc(db, 'campaigns', cid, 'secrets', id));
      batch.commit().catch(console.error);
    },

    // DM-only data (hidden facts, private notes, saved monsters). Players can't read it.
    watchSecrets(cid, cb) {
      return onSnapshot(collection(db, 'campaigns', cid, 'secrets'), (snap) => {
        cb(Object.fromEntries(snap.docs.map((d) => [d.id, d.data()])));
      }, (e) => console.error(e));
    },
    saveSecret(cid, id, data) {
      setDoc(doc(db, 'campaigns', cid, 'secrets', id), { ...clean(data), updatedAt: serverTimestamp() }).catch(console.error);
    },
    deleteSecret(cid, id) {
      deleteDoc(doc(db, 'campaigns', cid, 'secrets', id)).catch(console.error);
    },
    // Save an entry and its secret part together, so they never get out of step.
    saveWithSecret(cid, entry, secret) {
      const batch = writeBatch(db);
      batch.set(doc(db, 'campaigns', cid, 'entries', entry.id), { ...clean(entry), updatedAt: serverTimestamp() });
      batch.set(doc(db, 'campaigns', cid, 'secrets', entry.id), { ...clean(secret), updatedAt: serverTimestamp() });
      batch.commit().catch(console.error);
    },
  };
}

import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const DEFAULT_MODEL = 'isnet_quint8';

export async function loadOrCreateProfile(user) {
  if (!db || !user?.uid) return null;
  const reference = doc(db, 'users', user.uid);
  const snapshot = await getDoc(reference);
  if (snapshot.exists()) {
    const saved = snapshot.data();
    return {
      displayName: saved.displayName || user.name || '',
      downloads: Number.isSafeInteger(saved.downloads) && saved.downloads >= 0 ? saved.downloads : 0,
      model: saved.model === 'isnet' ? 'isnet' : DEFAULT_MODEL,
    };
  }

  const profile = { displayName: user.name || '', downloads: 0, model: DEFAULT_MODEL };
  await setDoc(reference, { ...profile, updatedAt: serverTimestamp() });
  return profile;
}

export async function saveProfile(user, values) {
  if (!db || !user?.uid) return;
  const downloads = Number.isSafeInteger(values.downloads) && values.downloads >= 0 ? values.downloads : 0;
  const model = values.model === 'isnet' ? 'isnet' : DEFAULT_MODEL;
  await setDoc(doc(db, 'users', user.uid), {
    displayName: String(values.displayName || user.name || '').slice(0, 80),
    downloads,
    model,
    updatedAt: serverTimestamp(),
  });
}

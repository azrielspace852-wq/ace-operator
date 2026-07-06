import admin from 'firebase-admin';
const db = admin.firestore();

export async function create(uid, data) {
  const ref = await db.collection('instances').add({
    userId: uid,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const doc = await ref.get();
  return { id: ref.id, ...doc.data() };
}

export async function findByUser(uid) {
  const snap = await db.collection('instances')
    .where('userId', '==', uid)
    .orderBy('createdAt', 'desc')
    .get();
  const list = [];
  snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
  return list;
}

export async function findBySlug(uid, slug) {
  const snap = await db.collection('instances')
    .where('userId', '==', uid)
    .where('slug', '==', slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}

export async function findById(id) {
  const doc = await db.collection('instances').doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function update(id, data) {
  await db.collection('instances').doc(id).update({ ...data, updatedAt: new Date() });
}

export async function deleteDoc(id) {
  await db.collection('instances').doc(id).delete();
}

export async function updateUsage(id, keyLabel) {
  const ref = db.collection('instances').doc(id);
  const doc = await ref.get();
  if (!doc.exists) return;
  const data = doc.data();
  const apiKeys = (data.apiKeys || []).map(k => {
    if (k.label === keyLabel) {
      return { ...k, usageToday: (k.usageToday || 0) + 1 };
    }
    return k;
  });
  await ref.update({ apiKeys, updatedAt: new Date() });
}
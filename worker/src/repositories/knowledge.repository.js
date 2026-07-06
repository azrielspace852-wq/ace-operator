import admin from 'firebase-admin';
const db = admin.firestore();

export async function create(uid, data) {
  const ref = await db.collection('knowledge').add({
    userId: uid,
    ...data,
    createdAt: new Date(),
  });
  const doc = await ref.get();
  return { id: ref.id, ...doc.data() };
}

export async function findByUser(uid) {
  const snap = await db.collection('knowledge')
    .where('userId', '==', uid)
    .orderBy('createdAt', 'desc')
    .get();
  const list = [];
  snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
  return list;
}

export async function findById(id) {
  const doc = await db.collection('knowledge').doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function deleteDoc(id) {
  await db.collection('knowledge').doc(id).delete();
}
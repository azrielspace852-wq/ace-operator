import admin from 'firebase-admin';
const db = admin.firestore();

export async function findById(uid) {
  const doc = await db.collection('users').doc(uid).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function create(uid, data) {
  await db.collection('users').doc(uid).set(data);
  return findById(uid);
}

export async function update(uid, data) {
  await db.collection('users').doc(uid).update(data);
}

export async function findAll() {
  const snap = await db.collection('users').get();
  const list = [];
  snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
  return list;
}
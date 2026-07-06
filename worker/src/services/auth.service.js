import admin from 'firebase-admin';
import * as userRepo from '../repositories/user.repository.js';

export async function verify(token) {
  const decoded = await admin.auth().verifyIdToken(token);
  const uid = decoded.uid;

  let user = await userRepo.findById(uid);
  if (!user) {
    const info = await admin.auth().getUser(uid);
    const newUser = {
      uid,
      email: info.email,
      displayName: info.displayName || info.email || 'User',
      creditLimit: 240,
      creditRemaining: 240,
      status: 'active',
      createdAt: new Date(),
    };
    await userRepo.create(uid, newUser);
    user = newUser;
  }
  return {
    user: {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    },
    credits: {
      remaining: user.creditRemaining || 0,
      limit: user.creditLimit || 240,
    },
  };
}
import * as userRepo from '../repositories/user.repository.js';

export async function getProfile(uid) {
  const user = await userRepo.findById(uid);
  if (!user) throw new Error('User not found');
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
export async function list(uid) {
  return userRepo.findAll();
}
export async function resetCredits(uid, targetUid) {
  const user = await userRepo.findById(targetUid);
  if (!user) throw new Error('User not found');
  await userRepo.update(targetUid, { creditRemaining: user.creditLimit || 240 });
}
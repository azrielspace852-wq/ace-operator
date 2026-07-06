import * as userService from '../services/user.service.js';

export async function profile(req, user) {
  return userService.getProfile(user.uid);
}
export async function list(req, user) {
  return { users: await userService.list(user.uid) };
}
export async function reset(req, user, params) {
  await userService.resetCredits(user.uid, params.id);
  return { success: true };
}
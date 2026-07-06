import * as instanceService from '../services/instance.service.js';

export async function list(req, user) {
  return { instances: await instanceService.list(user.uid) };
}
export async function create(req, user) {
  const instance = await instanceService.create(user.uid, req.body);
  return { instance };
}
export async function update(req, user, params) {
  await instanceService.update(user.uid, params.id, req.body);
  return { success: true };
}
export async function deleteDoc(req, user, params) {
  await instanceService.deleteDoc(user.uid, params.id);
  return { success: true };
}
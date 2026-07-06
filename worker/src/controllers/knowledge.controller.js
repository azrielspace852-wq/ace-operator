import * as knowledgeService from '../services/knowledge.service.js';

export async function list(req, user) {
  return { knowledge: await knowledgeService.list(user.uid) };
}
export async function create(req, user) {
  const knowledge = await knowledgeService.create(user.uid, req.body);
  return { knowledge };
}
export async function deleteDoc(req, user, params) {
  await knowledgeService.deleteDoc(user.uid, params.id);
  return { success: true };
}
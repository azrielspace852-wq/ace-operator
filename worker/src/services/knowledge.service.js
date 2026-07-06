import * as knowledgeRepo from '../repositories/knowledge.repository.js';

export async function list(uid) {
  return knowledgeRepo.findByUser(uid);
}
export async function create(uid, data) {
  return knowledgeRepo.create(uid, data);
}
export async function deleteDoc(uid, id) {
  const kb = await knowledgeRepo.findById(id);
  if (!kb || kb.userId !== uid) throw new Error('Knowledge not found');
  await knowledgeRepo.deleteDoc(id);
}
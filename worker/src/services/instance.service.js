import * as instanceRepo from '../repositories/instance.repository.js';

export async function list(uid) {
  return instanceRepo.findByUser(uid);
}
export async function create(uid, data) {
  return instanceRepo.create(uid, data);
}
export async function update(uid, id, data) {
  const inst = await instanceRepo.findById(id);
  if (!inst || inst.userId !== uid) throw new Error('Instance not found');
  await instanceRepo.update(id, data);
}
export async function deleteDoc(uid, id) {
  const inst = await instanceRepo.findById(id);
  if (!inst || inst.userId !== uid) throw new Error('Instance not found');
  await instanceRepo.deleteDoc(id);
}
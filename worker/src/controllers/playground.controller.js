import * as playgroundService from '../services/playground.service.js';

export async function chat(req, user) {
  const { messages, instance } = req.body;
  if (!messages || !Array.isArray(messages)) {
    throw new Error('Messages required');
  }
  const reply = await playgroundService.chat(user.uid, messages, instance);
  return { reply };
}
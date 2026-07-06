import * as instanceRepo from '../repositories/instance.repository.js';
import * as aiProvider from '../providers/ai.provider.js';

export async function chat(uid, messages, instanceSlug) {
  let instance;
  if (instanceSlug && instanceSlug !== 'default') {
    instance = await instanceRepo.findBySlug(uid, instanceSlug);
  }
  if (!instance) {
    const instances = await instanceRepo.findByUser(uid);
    instance = instances[0] || null;
  }
  if (!instance) {
    throw new Error('No AI instance configured. Please create one first.');
  }

  const activeKey = (instance.apiKeys || []).find(k => k.status === 'active');
  if (!activeKey) {
    throw new Error('No active API key found for this instance.');
  }

  const reply = await aiProvider.chat({
    provider: instance.provider,
    model: instance.model,
    apiKey: activeKey.key,
    messages,
    systemPrompt: instance.systemPrompt,
    temperature: instance.temperature || 0.7,
    maxTokens: instance.maxTokens || 4096,
  });

  await instanceRepo.updateUsage(instance.id, activeKey.label);
  return reply;
}
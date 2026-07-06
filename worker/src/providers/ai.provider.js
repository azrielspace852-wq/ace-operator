export async function chat(config) {
  const { provider, model, apiKey, messages, systemPrompt, temperature, maxTokens } = config;

  const fullMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const urls = {
    groq: 'https://api.groq.com/openai/v1/chat/completions',
    deepseek: 'https://api.deepseek.com/v1/chat/completions',
    openai: 'https://api.openai.com/v1/chat/completions',
    anthropic: 'https://api.anthropic.com/v1/messages',
  };

  const url = urls[provider] || urls.groq;
  let body;
  let headers = { 'Content-Type': 'application/json' };

  if (provider === 'anthropic') {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    body = JSON.stringify({
      model: model || 'claude-3-sonnet-20240229',
      messages: fullMessages.filter(m => m.role !== 'system'),
      system: systemPrompt || '',
      max_tokens: maxTokens || 4096,
      temperature: temperature || 0.7,
    });
  } else {
    headers['Authorization'] = `Bearer ${apiKey}`;
    body = JSON.stringify({
      model: model || 'mixtral-8x7b-32768',
      messages: fullMessages,
      temperature: temperature || 0.7,
      max_tokens: maxTokens || 4096,
    });
  }

  const response = await fetch(url, { method: 'POST', headers, body });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI Provider error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  let reply;
  if (provider === 'anthropic') {
    reply = data.content?.[0]?.text || 'Tidak ada respons';
  } else {
    reply = data.choices?.[0]?.message?.content || 'Tidak ada respons';
  }
  return reply;
}
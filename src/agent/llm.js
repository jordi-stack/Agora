// Universal LLM wrapper - supports any OpenAI-compatible API
// Works with: Groq, OpenAI, Together, Fireworks, Ollama, Anthropic, and more

let provider = null
let client = null

const PROVIDERS = {
  groq: { model: 'llama-3.1-8b-instant', name: 'Groq (LLaMA)' },
  openai: { baseURL: 'https://api.openai.com/v1', model: 'gpt-4o-mini', name: 'OpenAI' },
  together: { baseURL: 'https://api.together.xyz/v1', model: 'meta-llama/Llama-3.1-8B-Instruct-Turbo', name: 'Together (LLaMA)' },
  fireworks: { baseURL: 'https://api.fireworks.ai/inference/v1', model: 'accounts/fireworks/models/llama-v3p1-8b-instruct', name: 'Fireworks (LLaMA)' },
}

export async function initLLM() {
  // Priority: specific provider keys > universal LLM_API_KEY
  const apiKey = process.env.GROQ_API_KEY
    || process.env.OPENAI_API_KEY
    || process.env.TOGETHER_API_KEY
    || process.env.FIREWORKS_API_KEY
    || process.env.ANTHROPIC_API_KEY
    || process.env.LLM_API_KEY

  if (!apiKey) {
    console.warn('[llm] No API key found. Set LLM_API_KEY or a provider-specific key.')
    provider = { name: 'mock', type: 'mock' }
    return provider.name
  }

  // Detect provider from key or env
  if (process.env.ANTHROPIC_API_KEY) {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    provider = { name: 'Anthropic (Claude)', type: 'anthropic', model: process.env.LLM_MODEL || 'claude-haiku-4-5-20251001' }
    console.log(`[llm] Provider: ${provider.name}`)
    return provider.name
  }

  // All others use OpenAI-compatible API
  let detected = 'groq'
  if (process.env.OPENAI_API_KEY) detected = 'openai'
  else if (process.env.TOGETHER_API_KEY) detected = 'together'
  else if (process.env.FIREWORKS_API_KEY) detected = 'fireworks'

  const model = process.env.LLM_MODEL || PROVIDERS[detected]?.model || 'llama-3.1-8b-instant'
  const customBaseURL = process.env.LLM_BASE_URL || PROVIDERS[detected]?.baseURL
  const name = process.env.LLM_BASE_URL ? `Custom (${customBaseURL})` : (PROVIDERS[detected]?.name || detected)

  // Groq SDK is OpenAI-compatible, works with any provider
  const Groq = (await import('groq-sdk')).default
  const opts = { apiKey }
  if (customBaseURL) opts.baseURL = customBaseURL
  client = new Groq(opts)

  provider = { name, type: 'openai-compatible', model }

  console.log(`[llm] Provider: ${name} | Model: ${model}`)
  return provider.name
}

export function getProvider() {
  return provider?.name || 'none'
}

export async function chat(systemPrompt, userPrompt, options = {}) {
  const { temperature = 0.3, maxTokens = 300 } = options

  if (!provider || provider.type === 'mock') {
    return '{"action":"hold","confidence":0.5,"reasoning":"No LLM configured"}'
  }

  if (provider.type === 'anthropic') {
    const response = await client.messages.create({
      model: provider.model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature,
    })
    return response.content[0]?.text || ''
  }

  // OpenAI-compatible (Groq, OpenAI, Together, Fireworks, custom)
  const response = await client.chat.completions.create({
    model: provider.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature,
    max_tokens: maxTokens,
  })

  return response.choices[0]?.message?.content || ''
}

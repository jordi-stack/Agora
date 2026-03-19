// Multi-provider LLM wrapper — auto-detects from env variables
// Supports: Groq (LLaMA), OpenAI (GPT), Anthropic (Claude)

let provider = null
let client = null

export async function initLLM() {
  if (process.env.GROQ_API_KEY) {
    const Groq = (await import('groq-sdk')).default
    client = new Groq({ apiKey: process.env.GROQ_API_KEY })
    provider = 'groq'
    console.log('[llm] Provider: Groq (LLaMA — open-source)')
  } else if (process.env.OPENAI_API_KEY) {
    const OpenAI = (await import('openai')).default
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    provider = 'openai'
    console.log('[llm] Provider: OpenAI')
  } else if (process.env.ANTHROPIC_API_KEY) {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    provider = 'anthropic'
    console.log('[llm] Provider: Anthropic (Claude)')
  } else {
    console.warn('[llm] No LLM API key found. Set GROQ_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY')
    provider = 'mock'
  }

  return provider
}

export function getProvider() {
  return provider
}

const MODELS = {
  groq: process.env.LLM_MODEL || 'llama-3.1-8b-instant',
  openai: process.env.LLM_MODEL || 'gpt-4o-mini',
  anthropic: process.env.LLM_MODEL || 'claude-haiku-4-5-20251001',
}

export async function chat(systemPrompt, userPrompt, options = {}) {
  const { temperature = 0.3, maxTokens = 300 } = options

  if (provider === 'mock') {
    return '{"action":"hold","confidence":0.5,"reasoning":"No LLM configured — mock response"}'
  }

  if (provider === 'anthropic') {
    const response = await client.messages.create({
      model: MODELS.anthropic,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature,
    })
    return response.content[0]?.text || ''
  }

  // Groq and OpenAI share the same API format
  const response = await client.chat.completions.create({
    model: MODELS[provider],
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature,
    max_tokens: maxTokens,
  })

  return response.choices[0]?.message?.content || ''
}

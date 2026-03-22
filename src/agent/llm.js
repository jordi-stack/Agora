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
    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      provider = { name: 'Anthropic (Claude)', type: 'anthropic', model: process.env.LLM_MODEL || 'claude-haiku-4-5-20251001' }
      console.log(`[llm] Provider: ${provider.name}`)
      return provider.name
    } catch {
      console.warn('[llm] ANTHROPIC_API_KEY set but @anthropic-ai/sdk not installed. Run: npm install @anthropic-ai/sdk')
    }
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

export async function chatWithTools(systemPrompt, userPrompt, tools, executeTool, options = {}) {
  const { temperature = 0.3, maxTokens = 1000, maxIterations = 6 } = options

  if (!provider || provider.type === 'mock') {
    return { content: '{"action":"hold","confidence":0.5,"reasoning":"No LLM configured"}', toolCalls: [] }
  }

  const allToolCalls = []

  if (provider.type === 'anthropic') {
    const anthropicTools = tools.map(t => ({
      name: t.function.name,
      description: t.function.description,
      input_schema: t.function.parameters,
    }))
    const messages = [{ role: 'user', content: userPrompt }]

    for (let i = 0; i < maxIterations; i++) {
      const response = await client.messages.create({
        model: provider.model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages,
        tools: anthropicTools,
        temperature,
      })
      const textBlocks = response.content.filter(b => b.type === 'text')
      const toolUseBlocks = response.content.filter(b => b.type === 'tool_use')

      if (toolUseBlocks.length === 0 || response.stop_reason === 'end_turn') {
        return { content: textBlocks.map(b => b.text).join('\n') || '', toolCalls: allToolCalls }
      }

      messages.push({ role: 'assistant', content: response.content })
      const toolResults = []
      for (const block of toolUseBlocks) {
        allToolCalls.push({ name: block.name, args: block.input })
        const result = await executeTool(block.name, block.input)
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: typeof result === 'string' ? result : JSON.stringify(result),
        })
      }
      messages.push({ role: 'user', content: toolResults })
    }
    return { content: '{"action":"hold","confidence":0.5,"reasoning":"Max iterations reached"}', toolCalls: allToolCalls }
  }

  // OpenAI-compatible (Groq, OpenAI, Together, Fireworks)
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]

  for (let i = 0; i < maxIterations; i++) {
    const response = await client.chat.completions.create({
      model: provider.model,
      messages,
      tools,
      tool_choice: 'auto',
      temperature,
      max_tokens: maxTokens,
    })

    const choice = response.choices[0]
    const assistantMessage = choice.message
    messages.push(assistantMessage)

    if (choice.finish_reason !== 'tool_calls' || !assistantMessage.tool_calls?.length) {
      return { content: assistantMessage.content || '', toolCalls: allToolCalls }
    }

    for (const toolCall of assistantMessage.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments)
      allToolCalls.push({ name: toolCall.function.name, args })
      const result = await executeTool(toolCall.function.name, args)
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: typeof result === 'string' ? result : JSON.stringify(result),
      })
    }
  }
  return { content: '{"action":"hold","confidence":0.5,"reasoning":"Max iterations reached"}', toolCalls: allToolCalls }
}

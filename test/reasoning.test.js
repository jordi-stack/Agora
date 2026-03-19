import { describe, it, expect } from 'vitest'

// Test the JSON parsing logic directly (extracted pattern)
function parseDecisionJSON(content) {
  try { return JSON.parse(content) } catch {}
  const codeBlock = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlock) { try { return JSON.parse(codeBlock[1].trim()) } catch {} }
  const jsonObj = content.match(/\{[\s\S]*\}/)
  if (jsonObj) { try { return JSON.parse(jsonObj[0]) } catch {} }
  return { action: 'hold', confidence: 0, reasoning: 'parse error' }
}

describe('LLM JSON Parsing', () => {
  it('parses direct JSON', () => {
    const result = parseDecisionJSON('{"action":"hold","confidence":0.8,"reasoning":"test"}')
    expect(result.action).toBe('hold')
    expect(result.confidence).toBe(0.8)
  })

  it('extracts JSON from markdown code block', () => {
    const result = parseDecisionJSON('Here is my decision:\n```json\n{"action":"transfer","confidence":0.9,"reasoning":"surplus"}\n```')
    expect(result.action).toBe('transfer')
  })

  it('extracts JSON from plain code block', () => {
    const result = parseDecisionJSON('```\n{"action":"reprice","confidence":0.7,"reasoning":"demand up"}\n```')
    expect(result.action).toBe('reprice')
  })

  it('extracts JSON embedded in text', () => {
    const result = parseDecisionJSON('I think we should {"action":"hold","confidence":0.6,"reasoning":"stable"} because reasons')
    expect(result.action).toBe('hold')
  })

  it('returns fallback on garbage input', () => {
    const result = parseDecisionJSON('I cannot decide anything right now')
    expect(result.action).toBe('hold')
    expect(result.confidence).toBe(0)
  })

  it('returns fallback on empty string', () => {
    const result = parseDecisionJSON('')
    expect(result.action).toBe('hold')
    expect(result.confidence).toBe(0)
  })
})

import { describe, it, expect } from 'vitest'
import { parseDecisionJSON } from '../src/agent/reasoning.js'

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
    const result = parseDecisionJSON('I think we should {"action":"hold","confidence":0.6,"reasoning":"stable"} for now')
    expect(result.action).toBe('hold')
  })

  it('returns fallback on invalid input', () => {
    const result = parseDecisionJSON('this is not json at all')
    expect(result.action).toBe('hold')
    expect(result.confidence).toBe(0)
  })

  it('handles amount and newPrice fields', () => {
    const result = parseDecisionJSON('{"action":"transfer","amount":"0.05","confidence":0.9,"reasoning":"surplus detected"}')
    expect(result.amount).toBe('0.05')
  })
})

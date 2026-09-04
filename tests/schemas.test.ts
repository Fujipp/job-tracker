import { describe, expect, it } from 'vitest'
import { appDataSchema, jobInputSchema, jobStatusSchema, settingsSchema } from '../shared/schemas'

describe('schemas', () => {
  it('accepts the minimum valid job', () => expect(jobInputSchema.safeParse({ url:'https://example.com/job/1', title:'Engineer', company:'Acme' }).success).toBe(true))
  it('rejects malformed job URLs', () => expect(jobInputSchema.safeParse({ url:'not a url', title:'Engineer', company:'Acme' }).success).toBe(false))
  it('accepts a response before an interview', () => expect(jobStatusSchema.safeParse('responded').success).toBe(true))
  it('bounds stale reminder settings', () => {
    expect(settingsSchema.safeParse({ staleDays:14, compactCards:false }).success).toBe(true)
    expect(settingsSchema.safeParse({ staleDays:0, compactCards:false }).success).toBe(false)
  })
  it('upgrades older backups with discovery defaults', () => {
    const parsed = appDataSchema.parse({ version:1, jobs:[], settings:{ staleDays:14, compactCards:false } })
    expect(parsed.dismissedDiscoveries).toEqual([])
  })
})

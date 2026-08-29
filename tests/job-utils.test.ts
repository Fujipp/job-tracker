import { describe, expect, it } from 'vitest'
import { canTransition, detectPlatform, isNeedsReview, normalizeUrl } from '../shared/job-utils'
import type { JobApplication } from '../shared/types'

const base: JobApplication = {
  id:'1', url:'https://linkedin.com/jobs/view/1', normalizedUrl:'https://linkedin.com/jobs/view/1', platform:'LinkedIn',
  title:'Developer', company:'Acme', location:'Bangkok', workMode:'hybrid', salary:'', notes:'', tags:[], status:'applied',
  postedAt:null, appliedAt:'2026-08-01T00:00:00.000Z', createdAt:'2026-08-01T00:00:00.000Z', updatedAt:'2026-08-01T00:00:00.000Z',
  lastActivityAt:'2026-08-01T00:00:00.000Z', reviewDismissedAt:null, archived:false, history:[]
}

describe('job utilities', () => {
  it('normalizes tracking URLs for duplicate checks', () => {
    expect(normalizeUrl('https://www.LinkedIn.com/jobs/view/1/?utm_source=x#details')).toBe('https://linkedin.com/jobs/view/1')
  })
  it('detects known and unknown platforms', () => {
    expect(detectPlatform('https://th.jobsdb.com/job/1')).toBe('JobsDB')
    expect(detectPlatform('https://careers.example.com/jobs/1')).toBe('Careers')
  })
  it('flags quiet active applications only after the threshold', () => {
    expect(isNeedsReview(base, 14, new Date('2026-08-16T00:00:00.000Z'))).toBe(true)
    expect(isNeedsReview({...base,status:'saved'}, 14, new Date('2026-08-16T00:00:00.000Z'))).toBe(false)
  })
  it('does not silently reopen terminal states', () => {
    expect(canTransition('rejected','interview')).toBe(false)
    expect(canTransition('rejected','saved')).toBe(true)
  })
})

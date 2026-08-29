import type { JobApplication, JobStatus } from './types'

export function normalizeUrl(value: string) {
  const url = new URL(value.trim())
  url.hash = ''
  ;['utm_source','utm_medium','utm_campaign','utm_term','utm_content','trk','trackingId','ref'].forEach(k => url.searchParams.delete(k))
  url.hostname = url.hostname.toLowerCase().replace(/^www\./, '')
  url.pathname = url.pathname.replace(/\/$/, '') || '/'
  url.searchParams.sort()
  return url.toString()
}

export function detectPlatform(value: string) {
  try {
    const host = new URL(value).hostname.toLowerCase()
    if (host.includes('linkedin.com')) return 'LinkedIn'
    if (host.includes('jobsdb.com')) return 'JobsDB'
    if (host.includes('jobthai.com')) return 'JobsThai'
    const name = host.replace(/^www\./, '').split('.')[0] || 'Other'
    return name.replace(/^./, c => c.toUpperCase())
  } catch { return 'Other' }
}

export function isNeedsReview(job: JobApplication, staleDays: number, now = new Date()) {
  if (!['applied', 'interview'].includes(job.status) || job.archived) return false
  const basis = Math.max(new Date(job.lastActivityAt).getTime(), job.reviewDismissedAt ? new Date(job.reviewDismissedAt).getTime() : 0)
  return now.getTime() - basis >= staleDays * 86_400_000
}

export function daysBetween(from: string, to = new Date().toISOString()) {
  return Math.max(0, Math.floor((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000))
}

export function canTransition(from: JobStatus, to: JobStatus) {
  if (from === to) return true
  const terminal: JobStatus[] = ['offer', 'rejected', 'withdrawn']
  return !terminal.includes(from) || to === 'saved'
}

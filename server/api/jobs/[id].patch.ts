import { randomUUID } from 'node:crypto'
import { jobPatchSchema } from '../../../shared/schemas'
import { canTransition, detectPlatform, normalizeUrl } from '../../../shared/job-utils'
import { readData, writeData } from '../../utils/store'

export default defineEventHandler(async event => {
  const parsed = jobPatchSchema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || 'Invalid update' })
  const data = await readData()
  const job = data.jobs.find(j => j.id === getRouterParam(event, 'id'))
  if (!job) throw createError({ statusCode: 404, statusMessage: 'Job not found' })
  const now = new Date().toISOString()
  const { action, note, ...changes } = parsed.data
  if (changes.url) {
    const normalized = normalizeUrl(changes.url)
    if (data.jobs.some(j => j.id !== job.id && j.normalizedUrl === normalized)) throw createError({ statusCode: 409, statusMessage: 'This job is already tracked' })
    job.normalizedUrl = normalized
    if (!changes.platform) changes.platform = detectPlatform(changes.url)
  }
  if (changes.status && changes.status !== job.status) {
    if (!canTransition(job.status, changes.status)) throw createError({ statusCode: 400, statusMessage: 'Reopen the job before changing this closed application' })
    const from = job.status
    job.status = changes.status
    job.history.push({ id: randomUUID(), from, to: changes.status, at: now, ...(note ? { note } : {}) })
    job.lastActivityAt = now
    job.reviewDismissedAt = null
    if (changes.status === 'applied' && !job.appliedAt) job.appliedAt = now
  }
  if (action === 'follow-up') {
    job.lastActivityAt = now
    job.reviewDismissedAt = null
    job.history.push({ id: randomUUID(), from: job.status, to: job.status, at: now, note: note || 'Followed up' })
  }
  if (action === 'dismiss-review') job.reviewDismissedAt = now
  Object.assign(job, changes, { updatedAt: now })
  await writeData(data)
  return job
})

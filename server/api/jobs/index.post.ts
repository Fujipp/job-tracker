import { randomUUID } from 'node:crypto'
import { jobInputSchema } from '../../../shared/schemas'
import { detectPlatform, normalizeUrl } from '../../../shared/job-utils'
import { readData, writeData } from '../../utils/store'

export default defineEventHandler(async event => {
  const parsed = jobInputSchema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || 'Invalid job' })
  const data = await readData()
  const normalizedUrl = normalizeUrl(parsed.data.url)
  const duplicate = data.jobs.find(j => j.normalizedUrl === normalizedUrl)
  if (duplicate) throw createError({ statusCode: 409, statusMessage: 'This job is already tracked', data: { id: duplicate.id } })
  const now = new Date().toISOString()
  const job = {
    ...parsed.data, id: randomUUID(), normalizedUrl,
    platform: parsed.data.platform || detectPlatform(parsed.data.url), status: 'saved' as const,
    appliedAt: null, createdAt: now, updatedAt: now, lastActivityAt: now, reviewDismissedAt: null,
    archived: false, history: [{ id: randomUUID(), from: null, to: 'saved' as const, at: now }]
  }
  data.jobs.unshift(job)
  await writeData(data)
  setResponseStatus(event, 201)
  return job
})

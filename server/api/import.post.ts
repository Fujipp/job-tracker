import { appDataSchema } from '../../shared/schemas'
import { normalizeUrl } from '../../shared/job-utils'
import { readData, writeData } from '../utils/store'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const incoming = appDataSchema.safeParse(body?.data ?? body)
  if (!incoming.success) throw createError({ statusCode: 400, statusMessage: 'Backup file is not valid' })
  const current = await readData()
  const commit = body?.commit === true
  let created = 0, updated = 0, duplicates = 0
  const byId = new Map(current.jobs.map(j => [j.id, j]))
  const urls = new Map(current.jobs.map(j => [j.normalizedUrl, j.id]))
  for (const raw of incoming.data.jobs) {
    const job = { ...raw, normalizedUrl: normalizeUrl(raw.url) }
    if (byId.has(job.id)) { byId.set(job.id, job); updated++; continue }
    if (urls.has(job.normalizedUrl)) { duplicates++; continue }
    byId.set(job.id, job); urls.set(job.normalizedUrl, job.id); created++
  }
  if (commit) {
    current.jobs = [...byId.values()]
    current.settings = incoming.data.settings
    current.dismissedDiscoveries = [...new Set([...current.dismissedDiscoveries, ...incoming.data.dismissedDiscoveries])]
    await writeData(current)
  }
  return { created, updated, duplicates, committed: commit }
})

import { readData, writeData } from '../../utils/store'
export default defineEventHandler(async event => {
  const data = await readData()
  const index = data.jobs.findIndex(j => j.id === getRouterParam(event, 'id'))
  if (index < 0) throw createError({ statusCode: 404, statusMessage: 'Job not found' })
  data.jobs.splice(index, 1)
  await writeData(data)
  return { ok: true }
})

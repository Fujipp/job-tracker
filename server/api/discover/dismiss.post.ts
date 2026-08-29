import { z } from 'zod'
import { readData, writeData } from '../../utils/store'

export default defineEventHandler(async event => {
  const parsed = z.object({ key:z.string().min(3).max(200), dismissed:z.boolean().default(true) }).safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode:400, statusMessage:'Invalid discovery key' })
  const data = await readData(), keys = new Set(data.dismissedDiscoveries)
  parsed.data.dismissed ? keys.add(parsed.data.key) : keys.delete(parsed.data.key)
  data.dismissedDiscoveries = [...keys]
  await writeData(data)
  return { ok:true }
})

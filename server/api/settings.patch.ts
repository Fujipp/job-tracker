import { settingsSchema } from '../../shared/schemas'
import { readData, writeData } from '../utils/store'
export default defineEventHandler(async event => {
  const data = await readData()
  const parsed = settingsSchema.partial().safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Invalid settings' })
  data.settings = { ...data.settings, ...parsed.data }
  await writeData(data)
  return data.settings
})

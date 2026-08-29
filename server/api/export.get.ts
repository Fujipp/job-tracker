import { readData } from '../utils/store'
export default defineEventHandler(async event => {
  setHeader(event, 'content-disposition', `attachment; filename="first-move-backup-${new Date().toISOString().slice(0,10)}.json"`)
  return readData()
})

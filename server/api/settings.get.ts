import { readData } from '../utils/store'
export default defineEventHandler(async () => (await readData()).settings)

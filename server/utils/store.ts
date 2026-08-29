import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { appDataSchema } from '../../shared/schemas'
import type { AppData } from '../../shared/types'

const defaults: AppData = { version: 1, jobs: [], settings: { staleDays: 14, compactCards: false }, dismissedDiscoveries: [] }
let queue = Promise.resolve()

function pathForData() {
  const config = useRuntimeConfig()
  return join(String(config.dataDir), 'job-tracker.json')
}

export async function readData(): Promise<AppData> {
  const path = pathForData()
  await mkdir(String(useRuntimeConfig().dataDir), { recursive: true })
  try { return appDataSchema.parse(JSON.parse(await readFile(path, 'utf8'))) }
  catch (error: any) {
    if (error?.code !== 'ENOENT') throw error
    await writeData(defaults)
    return structuredClone(defaults)
  }
}

export async function writeData(data: AppData) {
  const task = queue.then(async () => {
    const path = pathForData()
    await mkdir(String(useRuntimeConfig().dataDir), { recursive: true })
    const tmp = `${path}.${process.pid}.${Date.now()}.tmp`
    const valid = appDataSchema.parse(data)
    await writeFile(tmp, `${JSON.stringify(valid, null, 2)}\n`, 'utf8')
    await rename(tmp, path)
  })
  queue = task.catch(() => {})
  return task
}

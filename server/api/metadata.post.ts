const allowedHosts = ['linkedin.com', 'jobsdb.com', 'jobthai.com']

export default defineEventHandler(async event => {
  const value = String((await readBody(event))?.url || '')
  let url: URL
  try { url = new URL(value) } catch { throw createError({ statusCode: 400, statusMessage: 'Enter a valid URL first' }) }
  if (url.protocol !== 'https:' || !allowedHosts.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`))) {
    throw createError({ statusCode: 400, statusMessage: 'Automatic details are available for supported job boards only' })
  }
  try {
    const html = await $fetch<string>(url.toString(), { responseType: 'text', timeout: 5000, headers: { 'user-agent': 'Mozilla/5.0 (compatible; FirstMove/1.0)' } })
    const meta = (property: string) => html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'))?.[1]
      || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i'))?.[1]
    const title = meta('og:title') || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || ''
    const description = meta('og:description') || meta('description') || ''
    return { title: title.replace(/\s*[|–-]\s*(LinkedIn|JobsDB|JobsThai).*$/i, '').trim(), description: description.trim() }
  } catch { return { title: '', description: '', unavailable: true } }
})

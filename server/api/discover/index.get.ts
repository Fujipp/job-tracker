import { normalizeUrl } from '../../../shared/job-utils'
import type { DiscoveredJob, DiscoveryCategory } from '../../../shared/types'
import { readData } from '../../utils/store'

type CacheEntry = { at: number; jobs: Omit<DiscoveredJob, 'isTracked' | 'isDismissed'>[] }
const cache = new Map<string, CacheEntry>()
const CACHE_MS = 15 * 60 * 1000

const clean = (html: unknown = '') => String(html || '').replace(/<[^>]*>/g, ' ').replace(/&hellip;/g, '…').replace(/&amp;/g, '&').replace(/&#(?:x27|39);/g, "'").replace(/\s+/g, ' ').trim()
const isoDate = (value: unknown) => { const date = new Date(String(value || '')); return Number.isNaN(date.getTime()) ? null : date.toISOString() }
const salary = (min: unknown, max: unknown, currency = 'USD') => {
  const lo = Number(min || 0), hi = Number(max || 0)
  if (!lo && !hi) return ''
  const format = (n: number) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 0 }).format(n)
  return `${currency} ${lo ? format(lo) : '?'}${hi ? `–${format(hi)}` : '+'}`
}
const categoryRules: [DiscoveryCategory, RegExp][] = [
  ['Software & IT', /software|developer|program|frontend|backend|full.?stack|devops|cloud|security|คอมพิวเตอร์|ไอที|กราฟฟิค\/it/i],
  ['Data & Analytics', /data|analytics|analyst|machine learning|artificial intelligence|ai\/ml|business intelligence/i],
  ['Engineering', /engineering|engineer|วิศว|ช่าง|โฟร์แมน|เทคนิค|เขียนแบบ/i],
  ['Design & Creative', /design|creative|graphic|ux|ui|ครีเอทีฟ|โฆษณา|นักแสดง|ดนตรี/i],
  ['Product & Project', /product|project|program management|scrum|ผลิตภัณฑ์|โครงการ/i],
  ['Sales & Marketing', /sales|marketing|seo|growth|business development|การขาย|การตลาด/i],
  ['Finance & Accounting', /finance|account|audit|bank|tax|บัญชี|การเงิน|ธนาคาร|ไฟแนนซ์/i],
  ['Operations & Admin', /operations|administration|office|ธุรการ|ประสานงาน|คีย์ข้อมูล|บริหาร/i],
  ['Customer Support', /customer|support|success|call center|บริการลูกค้า/i],
  ['HR & Recruiting', /human resources|recruit|talent|people|บุคคล|ทรัพยากรมนุษย์/i],
  ['Logistics', /logistics|warehouse|supply chain|procurement|จัดซื้อ|คลังสินค้า|import|export/i],
  ['Legal', /legal|law|compliance|กฎหมาย/i], ['Healthcare', /health|medical|nurse|doctor|เภสัช|พยาบาล|แพทย์|สาธารณสุข/i],
  ['Education', /education|teaching|teacher|training|การศึกษา|ฝึกอบรม|อาจารย์|ครู/i],
  ['Hospitality', /hospitality|hotel|travel|tourism|food|restaurant|ท่องเที่ยว|โรงแรม|อาหาร/i]
]
const categorize = (...values: unknown[]): DiscoveryCategory => { const text=values.flat().filter(Boolean).join(' '); return categoryRules.find(([,rule])=>rule.test(text))?.[0] || 'Other' }

async function fetchJobicy(region: string) {
  const geo = region === 'bangkok' ? 'thailand' : ['thailand','apac'].includes(region) ? region : ''
  const url = `https://jobicy.com/api/v2/remote-jobs?count=100${geo ? `&geo=${geo}` : ''}`
  const response = await $fetch<any>(url, { timeout: 8000 })
  return (response.jobs || []).map((j:any) => ({
    key:`Jobicy:${j.id}`, source:'Jobicy' as const, sourceId:String(j.id), url:j.url, title:j.jobTitle || 'Untitled role', company:j.companyName || 'Unknown company',
    location:j.jobGeo || 'Worldwide', workMode:'remote' as const, salary:`${salary(j.salaryMin,j.salaryMax,j.salaryCurrency || 'USD')}${j.salaryPeriod ? ` / ${j.salaryPeriod}` : ''}`.trim(), excerpt:clean(j.jobExcerpt || j.jobDescription).slice(0,260),
    tags:[...(j.jobIndustry || []),...(j.jobType || []),...(j.jobLevel && j.jobLevel !== 'Any' ? [j.jobLevel] : [])].slice(0,6), postedAt:isoDate(j.pubDate), companyLogo:j.companyLogo || '',
    salaryMin:Number(j.salaryMin)||null, salaryMax:Number(j.salaryMax)||null, salaryCurrency:j.salaryCurrency||'', salaryPeriod:j.salaryPeriod||'',
    category:categorize(j.jobIndustry,j.jobTitle), employmentType:(j.jobType || []).join(', ')
  }))
}

async function fetchThaiDoe(region: string) {
  const form = new URLSearchParams({ page:'1', length:'1000', start:'0' })
  if (region === 'bangkok') form.set('criteria[province_id]', '1')
  const [response, types] = await Promise.all([
    $fetch<any>('https://xn--72c5abh2bf8icw0m9d.doe.go.th/api-server/JobAll/ajax_list_job', { method:'POST', body:form.toString(), timeout:10000, headers:{ 'content-type':'application/x-www-form-urlencoded; charset=UTF-8' } }),
    $fetch<any>('https://xn--72c5abh2bf8icw0m9d.doe.go.th/api/job/type', { timeout:6000 }).catch(()=>({data:[]}))
  ])
  const typeMap = new Map((types.data || []).map((type:any)=>[Number(type.value),String(type.name)]))
  return (response.data || []).map((j:any) => ({
    key:`ไทยมีงานทำ:${j.job_id}`, source:'ไทยมีงานทำ' as const, sourceId:String(j.job_id),
    url:`https://xn--72c5abh2bf8icw0m9d.doe.go.th/${j.job_from === 'jobannounce' ? 'job/detail' : 'hundredbillion/detail'}/${j.job_id}`,
    title:j.position || 'ไม่ระบุตำแหน่ง', company:j.employer_name || 'ไม่ระบุบริษัท', location:[j.district_name,j.province_name].filter(Boolean).join(' '),
    workMode:'onsite' as const, salary:j.salary_detail || '', excerpt:clean(j.description).slice(0,260),
    tags:[j.contract_type_name,j.job_type_name || typeMap.get(Number(j.job_type)),j.degree_name].filter(Boolean).slice(0,6), postedAt:isoDate(j.anounce_date), companyLogo:'',
    salaryMin:Number(j.wage_min)||null, salaryMax:Number(j.wage_max)||null, salaryCurrency:'THB', salaryPeriod:'month',
    category:categorize(j.job_type_name || typeMap.get(Number(j.job_type)),j.position), employmentType:j.contract_type_name || ''
  }))
}

async function fetchRemoteOk() {
  const response = await $fetch<any[]>('https://remoteok.com/api', { timeout: 8000, headers: { 'user-agent':'FirstMove Job Tracker' } })
  return response.filter(j => j.id && j.position).map((j:any) => ({
    key:`Remote OK:${j.id}`, source:'Remote OK' as const, sourceId:String(j.id), url:j.apply_url || j.url, title:j.position, company:j.company || 'Unknown company',
    location:j.location || 'Worldwide', workMode:'remote' as const, salary:`${salary(j.salary_min,j.salary_max,'USD')}${j.salary_min || j.salary_max ? ' / year' : ''}`.trim(), excerpt:clean(j.description).slice(0,260), tags:(j.tags || []).slice(0,6),
    postedAt:isoDate(j.date || (j.epoch ? Number(j.epoch) * 1000 : null)), companyLogo:j.company_logo || j.logo || '',
    salaryMin:Number(j.salary_min)||null, salaryMax:Number(j.salary_max)||null, salaryCurrency:'USD', salaryPeriod:'year', category:categorize(j.tags,j.position), employmentType:''
  }))
}

async function fetchRemotive() {
  const response = await $fetch<any>('https://remotive.com/api/remote-jobs', { timeout:8000 })
  return (response.jobs || []).map((j:any) => ({
    key:`Remotive:${j.id}`, source:'Remotive' as const, sourceId:String(j.id), url:j.url, title:j.title, company:j.company_name || 'Unknown company',
    location:j.candidate_required_location || 'Worldwide', workMode:'remote' as const, salary:j.salary || '', excerpt:clean(j.description).slice(0,260),
    tags:[j.category,...(j.tags || [])].filter(Boolean).slice(0,6), postedAt:isoDate(j.publication_date), companyLogo:j.company_logo || j.company_logo_url || '',
    salaryMin:null, salaryMax:null, salaryCurrency:'', salaryPeriod:'', category:categorize(j.category,j.tags,j.title), employmentType:String(j.job_type || '').replaceAll('_',' ')
  }))
}

async function fetchRemoteLanders() {
  const response = await $fetch<any>('https://remotelanders.com/api/jobs?limit=100', { timeout:7000 })
  return (response.jobs || []).map((j:any) => ({
    key:`Remote Landers:${j.slug}`, source:'Remote Landers' as const, sourceId:String(j.slug), url:j.applyUrl || j.url, title:j.title, company:j.company || 'Unknown company',
    location:j.location || 'Worldwide', workMode:'remote' as const, salary:j.salary || '', excerpt:'Employer-direct remote opportunity. Open the original listing for full details.',
    tags:[j.category,j.type,j.level,...(j.subtags || [])].filter(Boolean).slice(0,6), postedAt:isoDate(j.postedDate), companyLogo:'',
    salaryMin:null, salaryMax:null, salaryCurrency:'', salaryPeriod:'', category:categorize(j.category,j.subtags,j.title), employmentType:j.type || ''
  }))
}

async function fetchJobOpportunities(region: string) {
  const params = new URLSearchParams({ limit:'50' })
  if (region === 'bangkok') { params.set('country', 'TH'); params.set('city', 'Bangkok') }
  else if (region === 'thailand') params.set('country', 'TH')
  const response = await $fetch<any>(`https://api.jobopportunitiesapi.org/public/jobs?${params}`, { timeout:9000 })
  return (response.data || []).map((j:any) => {
    const salaryMin = Number(j.salary_min)||null, salaryMax = Number(j.salary_max)||null
    const salaryCurrency = j.salary_currency || '', salaryPeriod = String(j.salary_period || '').toLowerCase()
    const workMode = /hybrid/i.test(j.remote) ? 'hybrid' : /remote/i.test(j.remote) ? 'remote' : /on.?site/i.test(j.remote) ? 'onsite' : 'unspecified'
    return {
      key:`Job Opportunities:${j.id}`, source:'Job Opportunities' as const, sourceId:String(j.id), url:j.apply_url, title:j.title || 'Untitled role', company:j.company || 'Unknown company',
      location:j.location || [j.city,j.country].filter(Boolean).join(', ') || 'Location not specified', workMode,
      salary:`${salary(salaryMin,salaryMax,salaryCurrency)}${salaryPeriod ? ` / ${salaryPeriod}` : ''}`.trim(),
      excerpt:clean(j.description).slice(0,260) || `Employer-direct listing via ${String(j.source || j.provider_type || 'company career site').replaceAll('_',' ')}. Open the role for full details.`,
      tags:[j.category,j.seniority,j.employment_type,String(j.remote || '').replaceAll('_',' ')].filter(Boolean).slice(0,6),
      postedAt:isoDate(j.posted_at), companyLogo:j.company_logo || '', salaryMin, salaryMax, salaryCurrency, salaryPeriod,
      category:categorize(j.category,j.title), employmentType:String(j.employment_type || '')
    }
  }).filter((j:any) => j.url)
}

export default defineEventHandler(async event => {
  const query = getQuery(event), source = String(query.source || 'all'), region = String(query.region || 'all'), q = String(query.q || '').trim().toLowerCase()
  const category = String(query.category || 'all'), employment = String(query.employment || 'all'), salaryOnly = query.salaryOnly === '1', minSalary = Math.max(0,Number(query.minSalary)||0)
  const key = `${source}:${region}`
  let entry = cache.get(key)
  if (!entry || Date.now() - entry.at > CACHE_MS || query.refresh === '1') {
    const tasks: Promise<any>[] = []
    const localOnly = ['bangkok','thailand'].includes(region)
    if ((source === 'all' || source === 'jobicy') && region !== 'bangkok') tasks.push(fetchJobicy(region))
    if (!localOnly && (source === 'all' || source === 'remoteok')) tasks.push(fetchRemoteOk())
    if (!localOnly && (source === 'all' || source === 'remotive')) tasks.push(fetchRemotive())
    if (!localOnly && (source === 'all' || source === 'remotelanders')) tasks.push(fetchRemoteLanders())
    if (source === 'all' || source === 'jobopportunities') tasks.push(fetchJobOpportunities(region))
    if ((source === 'all' || source === 'thaidoe') && ['bangkok','thailand'].includes(region)) tasks.push(fetchThaiDoe(region))
    if (source === 'thaidoe' && !['bangkok','thailand'].includes(region)) tasks.push(fetchThaiDoe('thailand'))
    const settled = await Promise.allSettled(tasks)
    settled.forEach(result => { if (result.status === 'rejected') console.warn('[discover] source unavailable:', result.reason) })
    const live = [...new Map(settled.flatMap(result => result.status === 'fulfilled' ? result.value : []).map(job => [normalizeUrl(job.url),job])).values()]
    if (!live.length && entry) live.push(...entry.jobs)
    if (!live.length) throw createError({ statusCode: 502, statusMessage: 'Job feeds are temporarily unavailable' })
    entry = { at: Date.now(), jobs: live }
    cache.set(key, entry)
  }
  const data = await readData(), tracked = new Set(data.jobs.map(j => j.normalizedUrl)), dismissed = new Set(data.dismissedDiscoveries)
  const locationFiltered = region === 'bangkok'
    ? entry.jobs.filter(j => /bangkok|กรุงเทพ/i.test(j.location))
    : entry.jobs
  const searchFiltered = locationFiltered.filter(j => !q || `${j.title} ${j.company} ${j.location} ${j.tags.join(' ')}`.toLowerCase().includes(q))
  const categoryCounts = Object.fromEntries([...new Set(searchFiltered.map(j=>j.category))].map(value=>[value,searchFiltered.filter(j=>j.category===value).length]))
  const categoryFiltered = searchFiltered
    .filter(j => category === 'all' || j.category === category)
    .filter(j => employment === 'all' || j.employmentType.toLowerCase().includes(employment))
  const salaryThresholds = Object.fromEntries([15000,20000,30000,50000,80000].map(value=>[value,categoryFiltered.filter(j=>j.salaryCurrency==='THB'&&j.salaryPeriod==='month'&&(j.salaryMax||j.salaryMin||0)>=value).length]))
  const jobs = categoryFiltered
    .filter(j => !salaryOnly || !!j.salary)
    .filter(j => !minSalary || (j.salaryCurrency === 'THB' && j.salaryPeriod === 'month' && (j.salaryMax || j.salaryMin || 0) >= minSalary))
    .map(j => ({ ...j, isTracked: tracked.has(normalizeUrl(j.url)), isDismissed: dismissed.has(j.key) }))
  return { jobs, fetchedAt:new Date(entry.at).toISOString(), sources:[...new Set(jobs.map(j=>j.source))], facets:{ total:searchFiltered.length, afterCategory:categoryFiltered.length, salaryDisclosed:categoryFiltered.filter(j=>!!j.salary).length, categories:categoryCounts, salaryThresholds } }
})

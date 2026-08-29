<script setup lang="ts">
import { Plus, Search, SlidersHorizontal, Download, Upload, Settings, BriefcaseBusiness, Send, MessageSquareText, TrendingUp, Timer, X, Check, LayoutDashboard, Radar } from 'lucide-vue-next'
import type { AppData, AppSettings, JobApplication, JobStatus } from '~/shared/types'
import { JOB_STATUSES } from '~/shared/types'
import { daysBetween, isNeedsReview } from '~/shared/job-utils'

const { data: jobs, refresh, pending, error } = await useFetch<JobApplication[]>('/api/jobs', { default: () => [] })
const { data: settings, refresh: refreshSettings } = await useFetch<AppSettings>('/api/settings', { default: () => ({ staleDays: 14, compactCards: false }) })
const showForm = ref(false), showSettings = ref(false), showImport = ref(false)
const editing = ref<JobApplication | null>(null)
const search = ref(''), platform = ref('all'), workMode = ref('all'), dateFrom = ref('')
const toast = ref('')
const importFile = ref<File | null>(null), importPreview = ref<{created:number;updated:number;duplicates:number}|null>(null), importPayload = ref<AppData|null>(null)

const statusMeta: Record<JobStatus,{label:string; dot:string}> = {
  saved:{label:'Saved',dot:'bg-slate-400'}, applied:{label:'Applied',dot:'bg-blue-500'}, interview:{label:'Interview',dot:'bg-amber-500'}, offer:{label:'Offer',dot:'bg-emerald-500'}, rejected:{label:'Rejected',dot:'bg-red-400'}, withdrawn:{label:'Withdrawn',dot:'bg-stone-400'}
}
const filtered = computed(() => (jobs.value || []).filter(j => {
  const q = search.value.toLowerCase(); const haystack = `${j.title} ${j.company} ${j.location} ${j.tags.join(' ')}`.toLowerCase()
  return !j.archived && (!q || haystack.includes(q)) && (platform.value === 'all' || j.platform === platform.value) && (workMode.value === 'all' || j.workMode === workMode.value) && (!dateFrom.value || (j.appliedAt || j.createdAt) >= dateFrom.value)
}))
const byStatus = (status: JobStatus) => filtered.value.filter(j => j.status === status)
const platforms = computed(() => [...new Set((jobs.value || []).map(j => j.platform))].sort())
const reviewJobs = computed(() => (jobs.value || []).filter(j => isNeedsReview(j, settings.value.staleDays)))
const metrics = computed(() => {
  const all = (jobs.value || []).filter(j => !j.archived), applied = all.filter(j => j.appliedAt)
  const progress = all.filter(j => ['interview','offer'].includes(j.status))
  const responded = all.filter(j => ['interview','offer','rejected'].includes(j.status))
  const waits = progress.map(j => { const event = j.history.find(h => h.to === 'interview' || h.to === 'offer'); return event && j.appliedAt ? daysBetween(j.appliedAt, event.at) : 0 })
  return [
    {label:'Opportunities',value:all.length,icon:BriefcaseBusiness,color:'bg-lime'},
    {label:'Applications',value:applied.length,icon:Send,color:'bg-blue-100'},
    {label:'In progress',value:progress.length,icon:MessageSquareText,color:'bg-amber-100'},
    {label:'Response rate',value:applied.length ? `${Math.round(responded.length/applied.length*100)}%` : '—',icon:TrendingUp,color:'bg-emerald-100'},
    {label:'Avg. first reply',value:waits.length ? `${Math.round(waits.reduce((a,b)=>a+b,0)/waits.length)}d` : '—',icon:Timer,color:'bg-violet-100'}
  ]
})

function flash(message:string){ toast.value=message; setTimeout(()=>toast.value='',2600) }
function saved(){ showForm.value=false; editing.value=null; refresh(); flash('Opportunity saved') }
async function update(id:string, body:any, message='Updated') { try { await $fetch(`/api/jobs/${id}`, {method:'PATCH',body}); await refresh(); flash(message) } catch(e:any){ flash(e?.data?.statusMessage || 'Could not update') } }
async function move(job:JobApplication,status:JobStatus){ if (['rejected','withdrawn'].includes(status) && !confirm(`Move “${job.title}” to ${status}?`)) return; await update(job.id,{status},`Moved to ${statusMeta[status].label}`) }
function drop(event:DragEvent,status:JobStatus){ const id=event.dataTransfer?.getData('job-id'); const job=jobs.value.find(j=>j.id===id); if(job && job.status!==status) move(job,status) }
async function removeJob(job:JobApplication){ if(!confirm(`Permanently delete “${job.title}” at ${job.company}? This cannot be undone.`)) return; await $fetch(`/api/jobs/${job.id}`,{method:'DELETE'}); await refresh(); flash('Opportunity deleted') }
async function saveSettings(){ await $fetch('/api/settings',{method:'PATCH',body:settings.value}); await refreshSettings(); showSettings.value=false; flash('Settings saved') }
function downloadBackup(){ window.location.href='/api/export' }
async function selectImport(e:Event){ const file=(e.target as HTMLInputElement).files?.[0]; if(!file)return; importFile.value=file; importPreview.value=null; try { importPayload.value=JSON.parse(await file.text()); importPreview.value=await ($fetch as any)('/api/import',{method:'POST',body:{data:importPayload.value,commit:false}}) } catch { flash('That backup file is not valid'); importFile.value=null } }
async function commitImport(){ if(!importPayload.value)return; await ($fetch as any)('/api/import',{method:'POST',body:{data:importPayload.value,commit:true}}); showImport.value=false; importPreview.value=null; importPayload.value=null; await Promise.all([refresh(),refreshSettings()]); flash('Backup imported') }
</script>

<template>
  <div class="min-h-screen">
    <header class="border-b bg-canvas/90 backdrop-blur"><div class="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 lg:px-8">
      <div class="flex items-center gap-3"><div class="grid h-10 w-10 place-items-center rounded-xl bg-ink text-lime"><BriefcaseBusiness :size="20"/></div><div class="hidden sm:block"><h1 class="font-display text-xl leading-none">First Move</h1><p class="mt-1 text-[10px] font-bold uppercase tracking-[.18em] text-muted">Job command center</p></div></div>
      <nav class="flex rounded-xl border bg-white/70 p-1"><NuxtLink to="/" class="flex items-center gap-2 rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white"><LayoutDashboard :size="16"/><span class="hidden md:inline">Pipeline</span></NuxtLink><NuxtLink to="/discover" class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-muted hover:text-ink"><Radar :size="16"/><span class="hidden md:inline">Discover</span></NuxtLink></nav>
      <div class="flex items-center gap-2"><button class="btn-secondary hidden lg:flex" @click="downloadBackup"><Download :size="16"/> Export</button><button class="btn-secondary hidden lg:flex" @click="showImport=true"><Upload :size="16"/> Import</button><button class="btn-secondary !px-3" aria-label="Settings" @click="showSettings=true"><Settings :size="17"/></button><button class="btn-primary" @click="editing=null;showForm=true"><Plus :size="18"/> <span class="hidden sm:inline">Add opportunity</span><span class="sm:hidden">Add</span></button></div>
    </div></header>

    <main class="mx-auto max-w-[1600px] px-5 py-8 lg:px-8">
      <section class="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p class="mb-2 text-xs font-bold uppercase tracking-[.18em] text-rust">{{ new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}) }}</p><h2 class="max-w-2xl font-display text-4xl leading-tight sm:text-5xl">Make your next move<br><em class="text-moss">before everyone else.</em></h2></div><p class="max-w-md text-sm leading-relaxed text-muted">Capture promising roles, keep every conversation moving, and see exactly where your energy is paying off.</p></section>

      <section class="mb-7 grid grid-cols-2 gap-3 md:grid-cols-5"><article v-for="m in metrics" :key="m.label" class="rounded-2xl border bg-panel p-4 shadow-card"><div class="mb-4 flex h-9 w-9 items-center justify-center rounded-xl" :class="m.color"><component :is="m.icon" :size="17"/></div><p class="text-2xl font-semibold">{{ m.value }}</p><p class="mt-1 text-xs text-muted">{{ m.label }}</p></article></section>

      <section v-if="reviewJobs.length" class="mb-7 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5"><div class="mb-3 flex items-center justify-between"><div><p class="text-sm font-bold text-amber-900">{{ reviewJobs.length }} application{{ reviewJobs.length>1?'s':'' }} need a nudge</p><p class="mt-0.5 text-xs text-amber-800/70">No activity for {{ settings.staleDays }}+ days</p></div><Timer class="text-amber-700" :size="22"/></div><div class="flex flex-wrap gap-2"><div v-for="job in reviewJobs" :key="job.id" class="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs shadow-sm"><strong>{{ job.company }}</strong><button class="text-moss underline" @click="update(job.id,{action:'follow-up'},'Follow-up logged')">Follow up</button><button class="text-red-600 underline" @click="move(job,'rejected')">Reject</button><button class="text-muted" aria-label="Dismiss" @click="update(job.id,{action:'dismiss-review'},'Reminder dismissed')"><X :size="14"/></button></div></div></section>

      <section class="mb-5 flex flex-col gap-3 rounded-2xl border bg-panel p-3 sm:flex-row"><label class="relative flex-1"><Search class="absolute left-3 top-2.5 text-muted" :size="18"/><input v-model="search" class="field !border-0 !bg-canvas pl-10" placeholder="Search role, company, location or tag…"></label><div class="flex gap-2 overflow-x-auto"><select v-model="platform" class="field min-w-32"><option value="all">All platforms</option><option v-for="p in platforms" :key="p">{{p}}</option></select><select v-model="workMode" class="field min-w-32"><option value="all">Any work mode</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option></select><label class="relative"><SlidersHorizontal class="absolute left-3 top-3 text-muted" :size="15"/><input v-model="dateFrom" type="date" class="field min-w-40 pl-9"></label></div></section>

      <div v-if="pending" class="py-20 text-center text-muted">Loading your pipeline…</div><div v-else-if="error" class="rounded-2xl bg-red-50 p-8 text-center text-red-700">Could not load your local data.</div>
      <section v-else class="grid auto-cols-[280px] grid-flow-col gap-4 overflow-x-auto pb-6 xl:grid-flow-row xl:grid-cols-6">
        <div v-for="status in JOB_STATUSES" :key="status" class="min-h-[400px] rounded-2xl bg-ink/[.035] p-3" @dragover.prevent @drop="drop($event,status)">
          <div class="mb-3 flex items-center justify-between px-1"><div class="flex items-center gap-2"><span class="h-2 w-2 rounded-full" :class="statusMeta[status].dot"/><h3 class="text-xs font-bold uppercase tracking-[.12em]">{{ statusMeta[status].label }}</h3></div><span class="rounded-full bg-white px-2 py-0.5 text-xs text-muted">{{ byStatus(status).length }}</span></div>
          <div class="space-y-3"><JobCard v-for="job in byStatus(status)" :key="job.id" :job="job" :needs-review="isNeedsReview(job,settings.staleDays)" :compact="settings.compactCards" @status="move(job,$event)" @edit="editing=job;showForm=true" @archive="update(job.id,{archived:true},'Archived')" @remove="removeJob(job)"/><button v-if="status==='saved'" class="w-full rounded-2xl border border-dashed p-4 text-xs font-semibold text-muted hover:border-moss hover:text-moss" @click="editing=null;showForm=true"><Plus class="mx-auto mb-1" :size="18"/> Capture a role</button></div>
        </div>
      </section>
    </main>

    <Transition name="fade"><JobFormModal v-if="showForm" :job="editing" @close="showForm=false;editing=null" @saved="saved"/></Transition>
    <Transition name="fade"><div v-if="showSettings" class="fixed inset-0 z-50 grid place-items-center bg-ink/35 p-5 backdrop-blur-sm" @mousedown.self="showSettings=false"><form class="w-full max-w-md rounded-3xl bg-panel p-7 shadow-soft" @submit.prevent="saveSettings"><div class="mb-6 flex justify-between"><div><p class="label">Preferences</p><h2 class="font-display text-3xl">Your rhythm</h2></div><button type="button" @click="showSettings=false"><X/></button></div><label><span class="label">Remind me after</span><div class="flex items-center gap-3"><input v-model.number="settings.staleDays" class="field" type="number" min="1" max="365"><span class="text-sm text-muted">days quiet</span></div></label><label class="mt-5 flex items-center justify-between rounded-xl border p-4"><span><strong class="block text-sm">Compact cards</strong><span class="text-xs text-muted">Hide secondary details</span></span><input v-model="settings.compactCards" type="checkbox" class="h-5 w-5 accent-moss"></label><div class="mt-6 flex justify-end gap-2"><button type="button" class="btn-secondary" @click="showSettings=false">Cancel</button><button class="btn-primary">Save</button></div></form></div></Transition>
    <Transition name="fade"><div v-if="showImport" class="fixed inset-0 z-50 grid place-items-center bg-ink/35 p-5 backdrop-blur-sm" @mousedown.self="showImport=false"><div class="w-full max-w-md rounded-3xl bg-panel p-7 shadow-soft"><div class="mb-6 flex justify-between"><div><p class="label">Restore data</p><h2 class="font-display text-3xl">Import backup</h2></div><button @click="showImport=false"><X/></button></div><label class="grid cursor-pointer place-items-center rounded-2xl border border-dashed p-8 text-center hover:border-moss"><Upload class="mb-3 text-moss"/><strong class="text-sm">Choose a JSON backup</strong><span class="mt-1 text-xs text-muted">Nothing changes until you confirm</span><input class="hidden" type="file" accept="application/json,.json" @change="selectImport"></label><div v-if="importPreview" class="mt-5 grid grid-cols-3 gap-2 text-center"><div class="rounded-xl bg-emerald-50 p-3"><strong class="block">{{importPreview.created}}</strong><span class="text-[10px] text-muted">NEW</span></div><div class="rounded-xl bg-blue-50 p-3"><strong class="block">{{importPreview.updated}}</strong><span class="text-[10px] text-muted">UPDATED</span></div><div class="rounded-xl bg-stone-100 p-3"><strong class="block">{{importPreview.duplicates}}</strong><span class="text-[10px] text-muted">DUPLICATE</span></div></div><button v-if="importPreview" class="btn-primary mt-5 w-full" @click="commitImport"><Check :size="16"/> Confirm import</button></div></div></Transition>
    <Transition name="fade"><div v-if="toast" class="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft"><Check :size="16" class="text-lime"/>{{toast}}</div></Transition>
  </div>
</template>

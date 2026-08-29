<script setup lang="ts">
import { X, Link2, BriefcaseBusiness, WandSparkles } from 'lucide-vue-next'
import { detectPlatform } from '~/shared/job-utils'
import type { JobApplication, JobInput, WorkMode } from '~/shared/types'

const props = defineProps<{ job?: JobApplication | null }>()
const emit = defineEmits<{ close: []; saved: [job: JobApplication] }>()
const blank = (): JobInput => ({ url: '', title: '', company: '', platform: '', location: '', workMode: 'unspecified', salary: '', notes: '', tags: [], postedAt: null })
const form = reactive<JobInput>(blank())
const tagsText = ref('')
const saving = ref(false)
const fetching = ref(false)
const error = ref('')

watch(() => props.job, value => {
  Object.assign(form, value ? { url: value.url, title: value.title, company: value.company, platform: value.platform, location: value.location, workMode: value.workMode, salary: value.salary, notes: value.notes, tags: value.tags, postedAt: value.postedAt } : blank())
  tagsText.value = value?.tags.join(', ') || ''
}, { immediate: true })
watch(() => form.url, value => { if (!props.job && value) form.platform = detectPlatform(value) })

async function fetchDetails() {
  if (!form.url) return
  fetching.value = true; error.value = ''
  try {
    const result = await $fetch<{title:string;description:string;unavailable?:boolean}>('/api/metadata', { method: 'POST', body: { url: form.url } })
    if (result.unavailable || (!result.title && !result.description)) error.value = 'This site did not share its details. You can still enter them manually.'
    else { if (!form.title) form.title = result.title; if (!form.notes) form.notes = result.description }
  } catch (e:any) { error.value = e?.data?.statusMessage || 'Could not read this job page.' }
  finally { fetching.value = false }
}

async function submit() {
  saving.value = true; error.value = ''
  try {
    const payload = { ...form, tags: tagsText.value.split(',').map(v => v.trim()).filter(Boolean), postedAt: form.postedAt || null }
    const job = await $fetch<JobApplication>(props.job ? `/api/jobs/${props.job.id}` : '/api/jobs', { method: props.job ? 'PATCH' : 'POST', body: payload })
    emit('saved', job)
  } catch (e: any) { error.value = e?.data?.statusMessage || e?.statusMessage || 'Could not save this job.' }
  finally { saving.value = false }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end justify-center bg-ink/35 p-0 backdrop-blur-sm sm:items-center sm:p-6" @mousedown.self="emit('close')">
    <form class="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-panel p-6 shadow-soft sm:max-w-2xl sm:rounded-3xl sm:p-8" @submit.prevent="submit">
      <div class="mb-7 flex items-start justify-between">
        <div><p class="mb-2 text-xs font-bold uppercase tracking-[.18em] text-rust">{{ job ? 'Edit opportunity' : 'Quick capture' }}</p><h2 class="font-display text-3xl">{{ job ? 'Keep it current.' : 'Save it before it’s gone.' }}</h2></div>
        <button type="button" class="rounded-full p-2 hover:bg-ink/5" aria-label="Close" @click="emit('close')"><X :size="20" /></button>
      </div>
      <div class="grid gap-5 sm:grid-cols-2">
        <label class="sm:col-span-2"><span class="label">Job URL</span><span class="flex gap-2"><span class="relative block flex-1"><Link2 class="absolute left-3.5 top-3 text-muted" :size="17"/><input v-model="form.url" class="field pl-10" type="url" required placeholder="https://linkedin.com/jobs/view/…"></span><button type="button" class="btn-secondary !px-3" :disabled="fetching || !form.url" title="Try to fetch page details" @click="fetchDetails"><WandSparkles :size="17"/><span class="hidden sm:inline">{{fetching?'Reading…':'Get details'}}</span></button></span></label>
        <label><span class="label">Role</span><span class="relative block"><BriefcaseBusiness class="absolute left-3.5 top-3 text-muted" :size="17"/><input v-model="form.title" class="field pl-10" required placeholder="Senior Product Designer"></span></label>
        <label><span class="label">Company</span><input v-model="form.company" class="field" required placeholder="Acme Co."></label>
        <label><span class="label">Platform</span><input v-model="form.platform" class="field" placeholder="Detected from URL"></label>
        <label><span class="label">Location</span><input v-model="form.location" class="field" placeholder="Bangkok"></label>
        <label><span class="label">Work mode</span><select v-model="form.workMode" class="field"><option value="unspecified">Not specified</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option></select></label>
        <label><span class="label">Salary</span><input v-model="form.salary" class="field" placeholder="฿70k–90k"></label>
        <label><span class="label">Posted date</span><input v-model="form.postedAt" class="field" type="date"></label>
        <label><span class="label">Tags</span><input v-model="tagsText" class="field" placeholder="Vue, fintech, priority"></label>
        <label class="sm:col-span-2"><span class="label">Notes</span><textarea v-model="form.notes" class="field min-h-24 resize-y" placeholder="Why this role, contact, requirements…" /></label>
      </div>
      <p v-if="error" class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</p>
      <div class="mt-7 flex justify-end gap-3"><button type="button" class="btn-secondary" @click="emit('close')">Cancel</button><button class="btn-primary" :disabled="saving">{{ saving ? 'Saving…' : job ? 'Save changes' : 'Add opportunity' }}</button></div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { MapPin, ExternalLink, MoreHorizontal, Clock3, Pencil, Archive, Trash2 } from 'lucide-vue-next'
import type { JobApplication, JobStatus } from '~/shared/types'
import { JOB_STATUSES, JOB_STATUS_LABELS } from '~/shared/types'
import { canTransition, daysBetween } from '~/shared/job-utils'
const props = defineProps<{ job: JobApplication; needsReview: boolean; compact?: boolean }>()
const emit = defineEmits<{ status: [status: JobStatus]; edit: []; archive: []; remove: [] }>()
const menu = ref(false)
const platformClass: Record<string,string> = { LinkedIn: 'bg-blue-50 text-blue-700', JobsDB: 'bg-violet-50 text-violet-700', JobsThai: 'bg-orange-50 text-orange-700' }
const selectableStatuses = computed(() => JOB_STATUSES.filter(status => canTransition(props.job.status, status)))
function changeStatus(event: Event) {
  emit('status', (event.target as HTMLSelectElement).value as JobStatus)
}
</script>
<template>
  <article class="group cursor-grab rounded-2xl border bg-panel p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft" draggable="true" @dragstart="$event.dataTransfer?.setData('job-id', job.id)">
    <div class="mb-3 flex items-start justify-between gap-3">
      <span class="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" :class="platformClass[job.platform] || 'bg-ink/5 text-muted'">{{ job.platform }}</span>
      <div class="relative"><button class="rounded-lg p-1 text-muted hover:bg-ink/5" aria-label="Job actions" @click="menu = !menu"><MoreHorizontal :size="18"/></button>
        <div v-if="menu" class="absolute right-0 top-8 z-20 w-36 rounded-xl border bg-white p-1.5 text-sm shadow-soft">
          <button class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-canvas" @click="emit('edit'); menu=false"><Pencil :size="14"/> Edit</button>
          <button class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-canvas" @click="emit('archive'); menu=false"><Archive :size="14"/> Archive</button>
          <button class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-red-600 hover:bg-red-50" @click="emit('remove'); menu=false"><Trash2 :size="14"/> Delete</button>
        </div>
      </div>
    </div>
    <h3 class="font-semibold leading-snug">{{ job.title }}</h3><p class="mt-1 text-sm text-muted">{{ job.company }}</p>
    <div v-if="!compact" class="mt-3 flex flex-wrap gap-2 text-xs text-muted"><span v-if="job.location" class="flex items-center gap-1"><MapPin :size="13"/>{{ job.location }}</span><span v-if="job.workMode !== 'unspecified'" class="capitalize">· {{ job.workMode }}</span><span v-if="job.salary">· {{ job.salary }}</span></div>
    <div v-if="job.tags.length && !compact" class="mt-3 flex flex-wrap gap-1.5"><span v-for="tag in job.tags" :key="tag" class="rounded-md bg-ink/5 px-2 py-1 text-[11px] text-muted">{{ tag }}</span></div>
    <div v-if="needsReview" class="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800"><Clock3 :size="14"/> Needs review · {{ daysBetween(job.lastActivityAt) }}d quiet</div>
    <div class="mt-4 flex items-center gap-2 border-t pt-3">
      <a :href="job.url" target="_blank" rel="noopener" class="flex flex-1 items-center gap-1.5 text-xs font-semibold text-moss hover:underline"><ExternalLink :size="14"/> Open & apply</a>
      <button v-if="job.status === 'saved'" class="rounded-lg bg-ink px-2.5 py-1.5 text-[11px] font-semibold text-white" @click="emit('status','applied')">Mark applied</button>
      <label v-else class="sr-only" :for="`status-${job.id}`">Change status for {{ job.title }}</label>
      <select v-if="job.status !== 'saved'" :id="`status-${job.id}`" :value="job.status" class="max-w-28 rounded-lg border bg-white px-2 py-1.5 text-[11px] font-semibold" @change="changeStatus">
        <option v-for="status in selectableStatuses" :key="status" :value="status">{{ JOB_STATUS_LABELS[status] }}</option>
      </select>
    </div>
  </article>
</template>

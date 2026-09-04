<script setup lang="ts">
import { HardDrive, LayoutDashboard, PanelLeftClose, PanelLeftOpen, Radar } from 'lucide-vue-next'

const route = useRoute()
const collapsed = useState<boolean>('sidebar-collapsed', () => false)
const navigation = [
  { label: 'Pipeline', to: '/', icon: LayoutDashboard },
  { label: 'Discover', to: '/discover', icon: Radar }
]
const isActive = (to: string) => to === '/' ? route.path === '/' : route.path.startsWith(to)

onMounted(() => {
  collapsed.value = localStorage.getItem('first-move-sidebar-collapsed') === 'true'
})
watch(collapsed, value => localStorage.setItem('first-move-sidebar-collapsed', String(value)))
</script>

<template>
  <header class="sticky top-0 z-40 flex h-[4.5rem] items-center gap-2 border-b bg-white/90 px-4 backdrop-blur-xl lg:hidden">
    <AppLogo compact />
    <nav class="ml-auto flex items-center gap-1 rounded-xl bg-ink/[.045] p-1" aria-label="Main navigation">
      <NuxtLink
        v-for="item in navigation"
        :key="item.to"
        :to="item.to"
        class="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition"
        :class="isActive(item.to) ? 'bg-ink text-white shadow-sm' : 'text-muted hover:bg-white hover:text-ink'"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        <component :is="item.icon" :size="17" />
        <span class="hidden sm:inline">{{ item.label }}</span>
      </NuxtLink>
    </nav>
    <slot name="mobile-actions" />
  </header>

  <aside
    class="fixed inset-y-0 left-0 z-40 hidden flex-col border-r bg-white transition-[width] duration-300 ease-out motion-reduce:transition-none lg:flex"
    :class="collapsed ? 'w-20' : 'w-64'"
  >
    <div class="brand-gradient-line h-[3px] shrink-0" />
    <button
      class="absolute -right-3 top-7 z-10 grid h-7 w-7 place-items-center rounded-full border bg-white text-muted shadow-card transition hover:scale-105 hover:text-ink"
      type="button"
      :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      @click="collapsed = !collapsed"
    >
      <PanelLeftOpen v-if="collapsed" :size="14" />
      <PanelLeftClose v-else :size="14" />
    </button>

    <div class="pb-7 pt-6 transition-[padding]" :class="collapsed ? 'px-[1.125rem]' : 'px-6'"><AppLogo :compact="collapsed" /></div>

    <nav class="px-3" aria-label="Main navigation">
      <p v-if="!collapsed" class="mb-2 px-3 text-xs font-bold uppercase tracking-[.16em] text-muted">Workspace</p>
      <div class="space-y-1">
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="group relative flex min-h-12 items-center rounded-xl text-sm font-semibold transition"
          :class="[
            isActive(item.to) ? 'bg-ink text-white shadow-sm' : 'text-muted hover:bg-ink/[.045] hover:text-ink',
            collapsed ? 'justify-center px-2' : 'gap-3 px-3.5'
          ]"
          :aria-current="isActive(item.to) ? 'page' : undefined"
          :title="collapsed ? item.label : undefined"
        >
          <span class="grid h-8 w-8 place-items-center rounded-lg transition" :class="isActive(item.to) ? 'bg-white/10' : 'bg-ink/[.045] group-hover:bg-white'">
            <component :is="item.icon" :size="17" />
          </span>
          <span v-if="!collapsed">{{ item.label }}</span>
          <span v-if="isActive(item.to) && !collapsed" class="ml-auto h-2 w-2 rounded-full bg-brand-cyan" />
        </NuxtLink>
      </div>
    </nav>

    <div class="mt-auto pb-4" :class="collapsed ? 'px-3' : 'px-4'">
      <div v-if="$slots.actions" class="mb-4 border-b pb-4"><slot name="actions" :collapsed="collapsed" /></div>
      <div class="flex items-center rounded-xl bg-ink/[.035] py-3" :class="collapsed ? 'justify-center px-2' : 'gap-3 px-3'" :title="collapsed ? 'Local workspace — your data stays here' : undefined">
        <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-muted shadow-sm"><HardDrive :size="16" /></span>
        <span v-if="!collapsed" class="min-w-0"><strong class="block text-xs">Local workspace</strong><span class="block truncate text-xs text-muted">Your data stays here</span></span>
      </div>
    </div>
  </aside>
</template>

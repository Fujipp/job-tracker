<script setup lang="ts">
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
</script>

<template>
  <NuxtLink to="/" class="group inline-flex min-w-0 items-center gap-3" aria-label="First Move home">
    <span class="relative grid h-11 w-11 shrink-0 place-items-center">
      <span class="absolute inset-0 rounded-[.9rem] bg-gradient-to-br from-brand-red via-brand-blue to-brand-purple opacity-0 blur-md transition group-hover:opacity-35" />
      <img src="/brand-mark.svg" alt="" class="relative h-11 w-11" width="44" height="44">
    </span>
    <span v-if="!compact" class="min-w-0">
      <strong class="block truncate font-display text-lg font-bold leading-none tracking-[-.03em]">First Move</strong>
      <span class="mt-1.5 block text-xs font-semibold uppercase tracking-[.18em] text-muted">Job tracker</span>
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { useLang, LANG_OPTIONS, type Lang } from '../composables/useLang'

const { lang, setLang } = useLang()

const pick = (code: Lang) => setLang(code)
</script>

<template>
  <div
    class="inline-flex items-center gap-1 text-sm"
    role="radiogroup"
    aria-label="Language"
  >
    <template v-for="(opt, i) in LANG_OPTIONS" :key="opt.code">
      <button
        :class="[
          'lang-chip',
          { 'lang-chip-active': lang === opt.code },
        ]"
        role="radio"
        :aria-checked="lang === opt.code"
        :aria-label="opt.fullLabel"
        @click="pick(opt.code)"
      >
        {{ opt.label }}
      </button>
      <span v-if="i < LANG_OPTIONS.length - 1" class="lang-sep" aria-hidden="true">·</span>
    </template>
  </div>
</template>

<style scoped>
.lang-chip {
  appearance: none;
  background: transparent;
  border: 0;
  padding: 0.4rem 0.5rem;
  cursor: pointer;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  color: var(--color-muted);
  transition: color 0.15s;
  min-width: 32px;
  min-height: 40px;
  line-height: 1;
}

.lang-chip:hover {
  color: var(--color-ink);
}

.lang-chip-active {
  color: var(--color-ink);
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 6px;
  text-decoration-color: var(--color-accent);
}

.lang-sep {
  /* Force Latin font even when the rest of the app is in CJK mode;
     otherwise "·" morphs into a fullwidth ideographic mid-dot. */
  font-family: 'IBM Plex Sans', ui-sans-serif, sans-serif;
  color: var(--color-rule);
  user-select: none;
  font-weight: 500;
}
</style>

import { ref, computed, watch } from 'vue'

export type Lang = 'en' | 'ms' | 'zh'

const STORAGE_KEY = 'clinic-lang'

const stored = (typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null) as Lang | null

const lang = ref<Lang>(stored && ['en', 'ms', 'zh'].includes(stored) ? stored : 'en')

watch(lang, (v) => {
  try {
    localStorage.setItem(STORAGE_KEY, v)
    document.documentElement.setAttribute('lang', v === 'zh' ? 'zh' : v === 'ms' ? 'ms' : 'en')
  } catch {}
})

type Dict = {
  queueShort: string
  enterNumber: string
  submit: string
  savedUntilMidnight: string
  nowCalling: string
  yourNumber: string
  waitTime: string
  approximately: string
  aheadOfYou: (n: number) => string
  offline: string
  yourTurn: string
  proceedToCounter: string
  clear: string
  changeNumber: string
  now: string
  minutes: string
  hours: string
}

const en: Dict = {
  queueShort: 'Queue',
  enterNumber: 'Enter your queue number',
  submit: 'Submit',
  savedUntilMidnight: 'Your number is saved on this device until midnight.',
  nowCalling: 'Now calling',
  yourNumber: 'Your number',
  waitTime: 'Wait time',
  approximately: 'Approximately',
  aheadOfYou: (n) => `${n} ${n === 1 ? 'person' : 'people'} ahead of you`,
  offline: 'Offline',
  yourTurn: 'Your turn',
  proceedToCounter: 'Please proceed to the counter',
  clear: 'Clear',
  changeNumber: 'Change my number',
  now: 'Now',
  minutes: 'min',
  hours: 'hr',
}

const ms: Dict = {
  queueShort: 'Giliran',
  enterNumber: 'Masukkan nombor giliran anda',
  submit: 'Hantar',
  savedUntilMidnight: 'Nombor anda disimpan di peranti ini sehingga tengah malam.',
  nowCalling: 'Sedang dilayan',
  yourNumber: 'Nombor anda',
  waitTime: 'Masa menunggu',
  approximately: 'Anggaran',
  aheadOfYou: (n) => `${n} orang di hadapan anda`,
  offline: 'Luar talian',
  yourTurn: 'Giliran anda',
  proceedToCounter: 'Sila ke kaunter',
  clear: 'Kosongkan',
  changeNumber: 'Tukar nombor saya',
  now: 'Sekarang',
  minutes: 'min',
  hours: 'jam',
}

const zh: Dict = {
  queueShort: '排队',
  enterNumber: '请输入您的排队号码',
  submit: '提交',
  savedUntilMidnight: '您的号码会保存至今晚十二时。',
  nowCalling: '正在叫号',
  yourNumber: '您的号码',
  waitTime: '等待时间',
  approximately: '大约',
  aheadOfYou: (n) => `前面还有 ${n} 位`,
  offline: '离线',
  yourTurn: '到您了',
  proceedToCounter: '请至柜台',
  clear: '清除',
  changeNumber: '更改号码',
  now: '现在',
  minutes: '分',
  hours: '时',
}

const dict: Record<Lang, Dict> = { en, ms, zh }

export function useLang() {
  const t = computed(() => dict[lang.value])
  const setLang = (l: Lang) => {
    lang.value = l
  }
  return { lang, t, setLang }
}

export const LANG_OPTIONS: Array<{ code: Lang; label: string; fullLabel: string }> = [
  { code: 'en', label: 'EN', fullLabel: 'English' },
  { code: 'ms', label: 'BM', fullLabel: 'Bahasa Malaysia' },
  { code: 'zh', label: '中', fullLabel: '中文' },
]

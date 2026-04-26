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
  enableNotifications: string
  notificationsActive: string
  notifBlocked: {
    buttonLabel: string
    title: string
    intro: string
    steps: {
      iosBrowser: string[]
      iosPwa: string[]
      androidPwa: string[]
      macSafari: string[]
      chrome: string[]
      generic: string[]
    }
  }
  appUpdateTitle: string
  appUpdateDescription: string
  appUpdateRefresh: string
  close: string
}

const en: Dict = {
  enterNumber: 'Enter your queue number',
  submit: 'Submit',
  savedUntilMidnight: 'Your number is saved on this device until midnight.',
  nowCalling: 'Current number',
  yourNumber: 'Your number',
  waitTime: 'Wait time',
  approximately: 'Approximately',
  aheadOfYou: (n) => `${n} ${n === 1 ? 'person' : 'people'} ahead of you`,
  offline: 'Connection lost',
  yourTurn: 'Your turn',
  proceedToCounter: 'Please proceed to the counter',
  clear: 'Done',
  changeNumber: 'Change my number',
  now: 'Now',
  minutes: 'min',
  hours: 'hr',
  enableNotifications: 'Enable alerts',
  notificationsActive: 'Alerts on',
  notifBlocked: {
    buttonLabel: 'Alerts off',
    title: 'Alerts are off',
    intro: 'Your browser is blocking alerts for this site. To turn them back on, follow the steps for your device:',
    steps: {
      iosBrowser: [
        'Open the Settings app on your iPhone or iPad.',
        'Tap Apps, then Safari, then Advanced.',
        'Tap Website Data, find this site, and swipe left to delete it.',
        'Return to Safari and reload this page — you will be asked again.',
      ],
      iosPwa: [
        'Open the Settings app on your iPhone or iPad.',
        'Tap Notifications.',
        'Find this app in the list and tap it.',
        'Turn on Allow Notifications.',
      ],
      androidPwa: [
        'Press and hold this app\'s icon on your home screen.',
        'Tap App info (or the small ⓘ icon).',
        'Tap Notifications.',
        'Turn on Allow notifications.',
      ],
      macSafari: [
        'In Safari, open the Safari menu, then Settings.',
        'Click the Websites tab.',
        'Choose Notifications from the left sidebar.',
        'Find this site and change the dropdown from Deny to Allow.',
        'Reload this page.',
      ],
      chrome: [
        'Tap the lock or info icon next to the address bar.',
        'Find Notifications in the site permissions.',
        'Change it to Allow, then reload this page.',
      ],
      generic: [
        'Open your browser site settings for this page.',
        'Find Notifications and change it to Allow.',
        'Reload this page.',
      ],
    },
  },
  appUpdateTitle: 'A new version is available',
  appUpdateDescription: 'Refresh to get the latest changes.',
  appUpdateRefresh: 'Refresh',
  close: 'Close',
}

const ms: Dict = {
  enterNumber: 'Masukkan nombor giliran anda',
  submit: 'Hantar',
  savedUntilMidnight: 'Nombor anda disimpan di peranti ini sehingga tengah malam.',
  nowCalling: 'Nombor semasa',
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
  enableNotifications: 'Buka notifikasi',
  notificationsActive: 'Notifikasi aktif',
  notifBlocked: {
    buttonLabel: 'Notifikasi tutup',
    title: 'Notifikasi ditutup',
    intro: 'Pelayar anda menyekat notifikasi untuk laman ini. Untuk mengaktifkannya semula, ikut langkah bagi peranti anda:',
    steps: {
      iosBrowser: [
        'Buka aplikasi Tetapan (Settings) pada iPhone atau iPad anda.',
        'Ketik Apps, kemudian Safari, kemudian Advanced.',
        'Ketik Website Data, cari laman ini dan leret ke kiri untuk padam.',
        'Kembali ke Safari dan muat semula halaman ini — anda akan ditanya semula.',
      ],
      iosPwa: [
        'Buka aplikasi Tetapan (Settings) pada iPhone atau iPad anda.',
        'Ketik Notifications.',
        'Cari aplikasi ini dalam senarai dan ketiknya.',
        'Hidupkan Allow Notifications.',
      ],
      androidPwa: [
        'Tekan dan tahan ikon aplikasi ini pada skrin utama anda.',
        'Ketik App info (atau ikon ⓘ kecil).',
        'Ketik Notifications.',
        'Hidupkan Allow notifications.',
      ],
      macSafari: [
        'Dalam Safari, buka menu Safari, kemudian Settings.',
        'Klik tab Websites.',
        'Pilih Notifications di sebelah kiri.',
        'Cari laman ini dan tukar dari Deny ke Allow.',
        'Muat semula halaman ini.',
      ],
      chrome: [
        'Ketik ikon kunci atau ikon maklumat di sebelah bar alamat.',
        'Cari Notifications dalam kebenaran laman.',
        'Tukar kepada Allow, kemudian muat semula halaman ini.',
      ],
      generic: [
        'Buka tetapan laman pelayar anda untuk halaman ini.',
        'Cari Notifications dan tukar kepada Allow.',
        'Muat semula halaman ini.',
      ],
    },
  },
  appUpdateTitle: 'Versi baharu tersedia',
  appUpdateDescription: 'Muat semula untuk mendapatkan kemaskini terkini.',
  appUpdateRefresh: 'Muat semula',
  close: 'Tutup',
}

const zh: Dict = {
  enterNumber: '请输入您的排队号码',
  submit: '确认',
  savedUntilMidnight: '您的号码会保存至今晚十二点。',
  nowCalling: '当前号码',
  yourNumber: '您的号码',
  waitTime: '等待时间',
  approximately: '大约',
  aheadOfYou: (n) => `前面还有 ${n} 位`,
  offline: '连接中断',
  yourTurn: '到您了',
  proceedToCounter: '请到柜台',
  clear: '完成',
  changeNumber: '更改号码',
  now: '现在',
  minutes: '分钟',
  hours: '小时',
  enableNotifications: '开启通知',
  notificationsActive: '通知已开启',
  notifBlocked: {
    buttonLabel: '通知已关闭',
    title: '通知已关闭',
    intro: '您的浏览器正在封锁本站的通知。请按照以下适合您设备的步骤重新开启：',
    steps: {
      iosBrowser: [
        '在 iPhone 或 iPad 上打开「设置」应用。',
        '点击 Apps，然后选择 Safari，再选择 Advanced。',
        '点击 Website Data，找到本站，向左滑动删除。',
        '回到 Safari 并刷新此页面 — 系统会再次询问您。',
      ],
      iosPwa: [
        '在 iPhone 或 iPad 上打开「设置」应用。',
        '点击 Notifications。',
        '在列表中找到本应用并点击。',
        '开启 Allow Notifications。',
      ],
      androidPwa: [
        '在主屏幕上长按本应用的图标。',
        '点击 App info（或小小的 ⓘ 图标）。',
        '点击 Notifications。',
        '开启 Allow notifications。',
      ],
      macSafari: [
        '在 Safari 中，打开 Safari 菜单，然后选择 Settings。',
        '点击 Websites 选项卡。',
        '在左侧选择 Notifications。',
        '找到本站，把 Deny 改为 Allow。',
        '刷新此页面。',
      ],
      chrome: [
        '点击地址栏旁边的锁形或信息图标。',
        '在站点权限中找到 Notifications。',
        '改为 Allow，然后刷新此页面。',
      ],
      generic: [
        '打开浏览器中本页面的站点设置。',
        '找到 Notifications，改为 Allow。',
        '刷新此页面。',
      ],
    },
  },
  appUpdateTitle: '有新版本可用',
  appUpdateDescription: '请刷新以获取最新内容。',
  appUpdateRefresh: '刷新',
  close: '关闭',
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

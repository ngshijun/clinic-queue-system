import { Redis } from '@upstash/redis'
import webpush from 'web-push'

const NOTIFY_THRESHOLDS = [5, 3, 1]
const TZ = 'Asia/Kuala_Lumpur'
const SUPPORTED_LANGS = ['en', 'ms', 'zh']
const DEFAULT_LANG = 'en'

const MINUTES_PER_POSITION = 5

const MIDNIGHT_FMT = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

const NOTIF_TEXT = {
  en: {
    aheadOfYou: (n) => `${n} ${n === 1 ? 'person' : 'people'} ahead of you`,
    estimatedWait: (mins) => `Estimated wait time: ${mins} min`,
  },
  ms: {
    aheadOfYou: (n) => `${n} orang di hadapan anda`,
    estimatedWait: (mins) => `Anggaran masa menunggu: ${mins} min`,
  },
  zh: {
    aheadOfYou: (n) => `前面还有 ${n} 位`,
    estimatedWait: (mins) => `预计等待时间：${mins} 分钟`,
  },
}

function buildPayload(threshold, target, lang) {
  const t = NOTIF_TEXT[lang] ?? NOTIF_TEXT[DEFAULT_LANG]
  return {
    title: t.aheadOfYou(threshold),
    body: t.estimatedWait(threshold * MINUTES_PER_POSITION),
    tag: `queue-${target}`,
    url: '/',
  }
}

let redisClient = null
let vapidConfigured = false

export function getRedis() {
  if (!redisClient) {
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
    if (!url || !token) {
      throw new Error('Redis env vars missing (expected KV_REST_API_URL/TOKEN or UPSTASH_REDIS_REST_URL/TOKEN)')
    }
    redisClient = new Redis({ url, token })
  }
  return redisClient
}

function ensureVapid() {
  if (vapidConfigured) return
  const subject = process.env.VAPID_SUBJECT
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!subject || !publicKey || !privateKey) {
    throw new Error('VAPID env vars missing (VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)')
  }
  webpush.setVapidDetails(subject, publicKey, privateKey)
  vapidConfigured = true
}

export function todayKey() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: TZ })
}

export function secondsUntilMidnight() {
  const parts = MIDNIGHT_FMT.formatToParts(new Date())
  const get = (t) => parseInt(parts.find((p) => p.type === t)?.value ?? '0', 10)
  const elapsed = get('hour') * 3600 + get('minute') * 60 + get('second')
  return Math.max(60, 86400 - elapsed)
}

export function subKey(date, patientNumber) {
  return `sub:${date}:${patientNumber}`
}

export function notifiedKey(date, patientNumber, threshold) {
  return `notified:${date}:${patientNumber}:${threshold}`
}

export function lastNumberKey(date) {
  return `last:${date}`
}

export async function saveSubscription(patientNumber, subscription, lang) {
  const redis = getRedis()
  const date = todayKey()
  const ttl = secondsUntilMidnight()
  const safeLang = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG
  const value = JSON.stringify({ subscription, lang: safeLang })
  await redis.set(subKey(date, patientNumber), value, { ex: ttl })
}

async function sendOne(redis, date, patientNumber, threshold, target) {
  const dedupeKey = notifiedKey(date, patientNumber, threshold)
  const claimed = await redis.set(dedupeKey, 1, { nx: true, ex: secondsUntilMidnight() })
  if (claimed !== 'OK') return

  const raw = await redis.get(subKey(date, patientNumber))
  if (!raw) return
  const stored = typeof raw === 'string' ? JSON.parse(raw) : raw
  if (!stored?.subscription?.endpoint) return

  const payload = buildPayload(threshold, target, stored.lang ?? DEFAULT_LANG)

  try {
    await webpush.sendNotification(stored.subscription, JSON.stringify(payload))
  } catch (err) {
    if (err?.statusCode === 404 || err?.statusCode === 410) {
      await redis.del(subKey(date, patientNumber))
    }
  }
}

// Skips Redis entirely on warm Fluid Compute instances when the queue hasn't
// advanced. SETNX dedup still guarantees correctness if the cache is wrong.
let cachedLast = { date: null, n: 0 }

// Fan-out fires once per (patientNumber, threshold) per day via Redis SETNX,
// only when the queue advances past the previous known value.
export async function fanOutForCurrent(currentNumber) {
  if (typeof currentNumber !== 'number' || currentNumber <= 0) return
  const date = todayKey()
  if (cachedLast.date === date && currentNumber <= cachedLast.n) return

  ensureVapid()
  const redis = getRedis()

  const prevRaw = await redis.get(lastNumberKey(date))
  const prev = typeof prevRaw === 'number' ? prevRaw : prevRaw ? parseInt(prevRaw, 10) : 0
  if (currentNumber <= prev) {
    cachedLast = { date, n: prev }
    return
  }

  await redis.set(lastNumberKey(date), currentNumber, { ex: secondsUntilMidnight() })
  cachedLast = { date, n: currentNumber }

  await Promise.allSettled(
    NOTIFY_THRESHOLDS.map((threshold) => {
      const target = currentNumber + threshold
      return sendOne(redis, date, target, threshold, target)
    }),
  )
}

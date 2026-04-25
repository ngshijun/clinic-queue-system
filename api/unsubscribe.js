import { getRedis, todayKey, subKey } from './_lib/push.js'

export async function POST(request) {
  try {
    const body = await request.json()
    const patientNumber = parseInt(body?.patientNumber, 10)
    if (!Number.isFinite(patientNumber) || patientNumber <= 0) {
      return Response.json({ error: 'invalid patientNumber' }, { status: 400 })
    }
    const redis = getRedis()
    await redis.del(subKey(todayKey(), patientNumber))
    return Response.json({ ok: true })
  } catch (err) {
    console.error('unsubscribe error:', err)
    return Response.json({ error: err?.message ?? 'unknown error' }, { status: 500 })
  }
}

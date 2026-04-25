import { saveSubscription } from './_lib/push.js'

export async function POST(request) {
  try {
    const body = await request.json()
    const patientNumber = parseInt(body?.patientNumber, 10)
    const subscription = body?.subscription
    const lang = typeof body?.lang === 'string' ? body.lang : undefined

    if (!Number.isFinite(patientNumber) || patientNumber <= 0) {
      return Response.json({ error: 'invalid patientNumber' }, { status: 400 })
    }
    if (!subscription || typeof subscription.endpoint !== 'string' || !subscription.keys) {
      return Response.json({ error: 'invalid subscription' }, { status: 400 })
    }

    await saveSubscription(patientNumber, subscription, lang)
    return Response.json({ ok: true })
  } catch (err) {
    console.error('subscribe error:', err)
    return Response.json({ error: err?.message ?? 'unknown error' }, { status: 500 })
  }
}

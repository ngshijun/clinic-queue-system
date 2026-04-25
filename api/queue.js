import { fanOutForCurrent, todayKey } from './_lib/push.js'

const QUEUE_URL = 'http://protege.powerapi.powersoft.asia/api/protege/get_last_queue_no'
const REGISTER_NO = '4215'

let tokenCache = { token: null, expiry: null }

async function getAuthToken() {
  if (tokenCache.token && tokenCache.expiry && new Date() < tokenCache.expiry) {
    return tokenCache.token
  }

  const tokenResponse = await fetch('http://protege.powerapi.powersoft.asia/auth/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      username: process.env.API_USERNAME,
      password: process.env.API_PASSWORD,
    }),
  })

  if (!tokenResponse.ok) {
    throw new Error(`Auth failed: ${tokenResponse.status}`)
  }

  const tokenData = await tokenResponse.json()
  tokenCache.token = tokenData.access_token
  tokenCache.expiry = new Date(Date.now() + 3600000 * 24)
  return tokenCache.token
}

async function fetchQueue(token) {
  return fetch(QUEUE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ registerno: REGISTER_NO, visitdate: todayKey() }),
  })
}

export async function GET(request) {
  try {
    let response = await fetchQueue(await getAuthToken())

    if (response.status === 401) {
      tokenCache = { token: null, expiry: null }
      response = await fetchQueue(await getAuthToken())
    }
    if (!response.ok) {
      throw new Error(`Queue API failed: ${response.status}`)
    }

    const data = await response.json()
    const queueNo = data.data[0]?.queuno || 0

    fanOutForCurrent(queueNo).catch((err) =>
      console.error('fanOut error (non-fatal):', err?.message ?? err),
    )

    return Response.json({ queueNo })
  } catch (error) {
    console.error('API Error:', error)
    return Response.json({ queueNo: 0, error: error.message }, { status: 500 })
  }
}

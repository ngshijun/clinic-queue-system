// api/queue.js
let tokenCache = {
  token: null,
  expiry: null
}

async function getAuthToken() {
  // Check if we have a valid cached token
  if (tokenCache.token && tokenCache.expiry && new Date() < tokenCache.expiry) {
    return tokenCache.token
  }

  // Get new token
  const tokenResponse = await fetch('http://protege.powerapi.powersoft.asia/auth/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      username: process.env.API_USERNAME,
      password: process.env.API_PASSWORD,
    }),
  })

  if (!tokenResponse.ok) {
    throw new Error(`Auth failed: ${tokenResponse.status}`)
  }

  const tokenData = await tokenResponse.json()
  
  // Cache the token
  tokenCache.token = tokenData.access_token
  tokenCache.expiry = new Date(Date.now() + 3600000 * 24) // 1 day from now
  
  return tokenCache.token
}

export async function GET(request) {
  try {
    const token = await getAuthToken()

    const queueResponse = await fetch('http://protege.powerapi.powersoft.asia/api/protege/get_last_queue_no', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        registerno: '4215',
        visitdate: new Date().toISOString().split('T')[0],
      }),
    })

    if (!queueResponse.ok) {
      // If unauthorized, clear cache and retry once
      if (queueResponse.status === 401) {
        tokenCache.token = null
        tokenCache.expiry = null
        const newToken = await getAuthToken()
        
        const retryResponse = await fetch('http://protege.powerapi.powersoft.asia/api/protege/get_last_queue_no', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newToken}`,
          },
          body: JSON.stringify({
            registerno: '4215',
            visitdate: new Date().toISOString().split('T')[0],
          }),
        })
        
        if (!retryResponse.ok) {
          throw new Error(`Queue API failed: ${retryResponse.status}`)
        }
        
        const retryData = await retryResponse.json()
        return Response.json({ queueNo: retryData.data[0]?.queuno || 0 })
      }
      
      throw new Error(`Queue API failed: ${queueResponse.status}`)
    }

    const data = await queueResponse.json()
    return Response.json({ queueNo: data.data[0]?.queuno || 0 })
  } catch (error) {
    console.error('API Error:', error)
    return Response.json({ queueNo: 0, error: error.message }, { status: 500 })
  }
}
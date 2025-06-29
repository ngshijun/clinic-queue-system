export async function GET(request) {
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
  const tokenData = await tokenResponse.json()
  const token = tokenData.access_token

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
  const data = await response.json()
  return Response.json({ queueNo: data.data[0]?.queuno || 0 })
}

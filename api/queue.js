export async function GET(request) {
  const response = await fetch('http://protege.powerapi.powersoft.asia/api/protege/get_last_queue_no', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.API_TOKEN}`,
    },
    body: JSON.stringify({
      registerno: '4215',
      visitdate: new Date().toISOString().split('T')[0],
    }),
  })
  const data = await response.json()
  return new Response(JSON.parse(`{ "queueNo": ${data.data[0]?.queuno || 0}`))
}

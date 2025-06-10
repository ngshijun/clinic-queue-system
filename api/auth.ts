export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const response = await fetch('http://protege.powerapi.powersoft.asia/auth/', {
      method: 'POST',
      body: req.body,
      headers: {
        'Content-type': 'multipart/form-data',
      },
    })

    const data = await response.json()
    console.log('Auth response status:', response.status)
    res.status(response.status).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch token' })
  }
}

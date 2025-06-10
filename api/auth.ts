// api/auth.js - Recommended approach
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Use server-side environment variables for security
    const username = process.env.API_USERNAME
    const password = process.env.API_PASSWORD

    if (!username || !password) {
      console.error('Missing API credentials in environment variables')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    console.log('Attempting to authenticate with external API...')

    // Create URL-encoded form data for the external API
    const params = new URLSearchParams()
    params.append('username', username)
    params.append('password', password)

    const response = await fetch('http://protege.powerapi.powersoft.asia/auth/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })

    console.log('External API response status:', response.status)

    const responseText = await response.text()
    console.log('External API response:', responseText)

    if (!response.ok) {
      console.error('External API error:', response.status, responseText)
      return res.status(response.status).json({ 
        error: 'Authentication failed',
        details: responseText
      })
    }

    // Parse response
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse auth response:', parseError)
      return res.status(500).json({ 
        error: 'Invalid response format',
        details: responseText
      })
    }

    // Return successful response
    return res.status(200).json(data)

  } catch (error) {
    console.error('Auth handler error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    })
  }
}
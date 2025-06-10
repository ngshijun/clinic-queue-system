// api/queue.js
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { registerno = '4215', visitdate } = req.body;
    
    // Get the API token from environment variables
    const apiToken = process.env.API_TOKEN;
    
    if (!apiToken) {
      return res.status(500).json({ error: 'API token not configured' });
    }

    const response = await fetch('http://protege.powerapi.powersoft.asia/api/protege/get_last_queue_no', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        registerno,
        visitdate: visitdate || new Date().toISOString().split('T')[0],
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch queue data',
      message: error.message 
    });
  }
}
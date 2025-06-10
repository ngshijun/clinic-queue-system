// api/queue.js (create this file in your project root)
export default async function handler(req, res) {
  console.log('API route called:', req.method, req.url);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Request body:', req.body);
    
    // Safely extract data from request body
    let requestData;
    try {
      requestData = req.body || {};
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const { registerno = '4215', visitdate } = requestData;
    console.log('Extracted data:', { registerno, visitdate });
    
    // Get the API token from environment variables
    const apiToken = process.env.API_TOKEN;
    console.log('API Token exists:', !!apiToken);
    
    if (!apiToken) {
      console.error('API token not found in environment variables');
      return res.status(500).json({ error: 'API token not configured' });
    }

    const requestBody = {
      registerno,
      visitdate: visitdate || new Date().toISOString().split('T')[0],
    };
    
    console.log('Making request to external API with body:', requestBody);

    const response = await fetch('http://protege.powerapi.powersoft.asia/api/protege/get_last_queue_no', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('External API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', response.status, errorText);
      throw new Error(`API responded with status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('External API response data:', data);
    
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Detailed API Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return res.status(500).json({ 
      error: 'Failed to fetch queue data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
// api/test.js - Simple test route
export default function handler(req, res) {
  console.log('Test API called');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({ 
    message: 'API is working!',
    method: req.method,
    timestamp: new Date().toISOString(),
    environment: {
      hasApiToken: !!process.env.API_TOKEN,
      nodeVersion: process.version
    }
  });
}
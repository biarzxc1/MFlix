const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Common headers for kisskh requests (without cookies)
const getKisskhHeaders = () => ({
  'sec-ch-ua-platform': '"Android"',
  'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36',
  'accept': 'application/json, text/plain, */*',
  'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
  'sec-ch-ua-mobile': '?1',
  'sec-fetch-site': 'same-origin',
  'sec-fetch-mode': 'cors',
  'sec-fetch-dest': 'empty',
  'referer': 'https://kisskh.co/',
  'accept-encoding': 'gzip, deflate, br, zstd',
  'accept-language': 'en-US,en;q=0.9',
  'priority': 'u=1, i'
});

// Axios instance with default config
const kisskhAPI = axios.create({
  baseURL: 'https://kisskh.co',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Upcoming endpoint
app.get('/api/upcoming', async (req, res) => {
  try {
    console.log('Fetching upcoming shows from kisskh.co...');
    
    const response = await kisskhAPI.get('/api/DramaList/Upcoming', {
      params: { 
        ispc: false
      },
      headers: getKisskhHeaders()
    });

    console.log('✅ Success! Received', response.data.length, 'upcoming shows');

    res.json({
      success: true,
      count: response.data.length,
      data: response.data
    });

  } catch (error) {
    console.error('❌ Error fetching upcoming shows:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to fetch upcoming shows',
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Anime endpoint
app.get('/api/anime', async (req, res) => {
  try {
    console.log('Fetching anime shows from kisskh.co...');
    
    const response = await kisskhAPI.get('/api/DramaList/Animate', {
      params: { 
        ispc: false
      },
      headers: getKisskhHeaders()
    });

    console.log('✅ Success! Received', response.data.length, 'anime shows');

    res.json({
      success: true,
      count: response.data.length,
      data: response.data
    });

  } catch (error) {
    console.error('❌ Error fetching anime shows:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to fetch anime shows',
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'MFlix-Api is running',
    timestamp: new Date().toISOString(),
    endpoints: ['/api/upcoming', '/api/anime']
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'MFlix-Api',
    version: '1.0.0',
    description: 'API for fetching drama and anime shows from kisskh.co',
    endpoints: {
      upcoming: {
        url: '/api/upcoming',
        description: 'Get upcoming shows',
        method: 'GET',
        example: `${req.protocol}://${req.get('host')}/api/upcoming`
      },
      anime: {
        url: '/api/anime',
        description: 'Get anime shows',
        method: 'GET',
        example: `${req.protocol}://${req.get('host')}/api/anime`
      },
      health: {
        url: '/health',
        description: 'Health check endpoint',
        method: 'GET',
        example: `${req.protocol}://${req.get('host')}/health`
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    requestedUrl: req.url,
    availableEndpoints: ['/', '/api/upcoming', '/api/anime', '/health']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Start server (for local development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║       🎬 MFlix-Api Running 🎬        ║
╚════════════════════════════════════════╝

📡 Port: ${PORT}
🌐 Base URL: http://localhost:${PORT}

Endpoints:
  📋 Root:     http://localhost:${PORT}/
  🎭 Upcoming: http://localhost:${PORT}/api/upcoming
  🎌 Anime:    http://localhost:${PORT}/api/anime
  ❤️  Health:  http://localhost:${PORT}/health
    `);
  });
}

// Export for Vercel
module.exports = app;

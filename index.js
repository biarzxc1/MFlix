// index.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'KissKH API Proxy',
    endpoints: {
      upcoming: '/api/DramaList/Upcoming?ispc=true',
      health: '/health'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy endpoint for upcoming dramas
app.get('/api/DramaList/Upcoming', async (req, res) => {
  try {
    const { ispc } = req.query;
    
    const response = await axios.get('https://kisskh.do/api/DramaList/Upcoming', {
      params: { ispc: ispc || 'true' },
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-encoding': 'gzip, deflate',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'referer': 'https://kisskh.do/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000,
      decompress: true,
      responseType: 'json'
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: 'Request timeout',
        message: 'The upstream server took too long to respond'
      });
    }
    
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch data',
      message: error.message,
      details: error.response?.data || null
    });
  }
});

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: [
      '/',
      '/health',
      '/api/DramaList/Upcoming'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  console.log(`🌐 Health check at http://localhost:${PORT}/health`);
});

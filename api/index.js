// api/index.js
const express = require('express');
const axios = require('axios');

const app = express();

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'KissKH API Proxy',
    endpoints: {
      upcoming: '/api/DramaList/Upcoming'
    }
  });
});

// Proxy endpoint for upcoming dramas
app.get('/api/DramaList/Upcoming', async (req, res) => {
  try {
    const { ispc } = req.query;
    
    const response = await axios.get('https://kisskh.do/api/DramaList/Upcoming', {
      params: { ispc: ispc || 'true' },
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-PH,en;q=0.9,fil;q=0.8',
        'cache-control': 'no-cache',
        'referer': 'https://kisskh.do/',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch data',
      message: error.message
    });
  }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;

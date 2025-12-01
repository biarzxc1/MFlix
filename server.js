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
  next();
});

// Common headers for kisskh requests
const getKisskhHeaders = () => ({
  'host': 'kisskh.co',
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
  'cookie': '_ga=GA1.1.2030273397.1764571795; cf_clearance=cdgBP35_ZRelLzPTdRQAb8bYS7eVXEBdTTK8TZofI_o-1764577173-1.2.1.1-nheLmoxCJZyErwZC3TvLn70rz9FSzvdvCtYt2D_05HGH1a17QPvQ5XtXGeI0152sZ5WQ8cDk6wGpvCy9F7sYuBODKzE_9T_HpMNASTwlTc2LV1HNyjMx97Bm5HXMSwmw8b5a.tHGxiNzIYigJnBjzXOG3VtK2kFB4X8mT6j2tSWIqmC_GRBXK8X9jAZd8BaTaX6WC9CiI8WvYDA9V1thbl2tIVST6O3uX1Ms6Z7RSds; g_state={"i_l":0,"i_ll":1764582782319,"i_b":"ym39g6JOMtza0dVW8GIhqso80cyyzKry55BQr8DZ5p0"}; _ga_R3CRN9FY5Q=GS2.1.s1764582783$o3$g1$t1764582787$j56$l0$h0',
  'priority': 'u=1, i'
});

// Upcoming endpoint
app.get('/api/upcoming', async (req, res) => {
  try {
    const response = await axios.get('https://kisskh.co/api/DramaList/Upcoming', {
      params: { ispc: false },
      headers: getKisskhHeaders()
    });

    res.json({
      success: true,
      count: response.data.length,
      data: response.data
    });

  } catch (error) {
    console.error('Error fetching upcoming shows:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to fetch upcoming shows',
      error: error.message
    });
  }
});

// Anime endpoint
app.get('/api/anime', async (req, res) => {
  try {
    const response = await axios.get('https://kisskh.co/api/DramaList/Animate', {
      params: { ispc: false },
      headers: getKisskhHeaders()
    });

    res.json({
      success: true,
      count: response.data.length,
      data: response.data
    });

  } catch (error) {
    console.error('Error fetching anime shows:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to fetch anime shows',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'MFlix-Api is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'MFlix-Api',
    version: '1.0.0',
    description: 'API for fetching drama and anime shows',
    endpoints: {
      upcoming: {
        url: '/api/upcoming',
        description: 'Get upcoming shows'
      },
      anime: {
        url: '/api/anime',
        description: 'Get anime shows'
      },
      health: {
        url: '/health',
        description: 'Health check endpoint'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    availableEndpoints: ['/api/upcoming', '/api/anime', '/health']
  });
});

// Start server (for local development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🎬 MFlix-Api is running on port ${PORT}`);
    console.log(`📡 Upcoming endpoint: http://localhost:${PORT}/api/upcoming`);
    console.log(`🎌 Anime endpoint: http://localhost:${PORT}/api/anime`);
  });
}

// Export for Vercel
module.exports = app;

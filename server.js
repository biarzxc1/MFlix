// server.js - MFLIX API
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Base configuration for kisskh.co API
const BASE_URL = 'https://kisskh.co';
const API_BASE = `${BASE_URL}/api`;

// Default headers matching the provided requests
const getHeaders = () => ({
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
  'accept-language': 'en-US,en;q=0.9'
});

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper function to fetch complete data from kisskh.co
async function fetchFromKissKH(endpoint, params = {}) {
  try {
    const response = await axios.get(`${API_BASE}${endpoint}`, {
      headers: getHeaders(),
      params: { ispc: false, ...params },
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    // Return complete data without any truncation
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error.message);
    throw error;
  }
}

// Root endpoint - MFLIX API Info
app.get('/', (req, res) => {
  const baseUrl = req.protocol + '://' + req.get('host');
  res.send({
    api: 'MFLIX',
    version: '1.0.0',
    description: 'Complete KDrama, Anime & Movies Streaming API',
    powered_by: 'kisskh.co',
    endpoints: {
      latest: {
        url: `${baseUrl}/api/latest`,
        method: 'GET',
        description: 'Get latest updates and new releases'
      },
      anime: {
        url: `${baseUrl}/api/anime`,
        method: 'GET',
        description: 'Get all anime shows'
      },
      upcoming: {
        url: `${baseUrl}/api/upcoming`,
        method: 'GET',
        description: 'Get upcoming shows'
      },
      mostViewed: {
        url: `${baseUrl}/api/most-viewed/1`,
        method: 'GET',
        description: 'Most viewed by category (1=Chinese, 2=Korean)',
        examples: [
          `${baseUrl}/api/most-viewed/1`,
          `${baseUrl}/api/most-viewed/2`
        ]
      },
      topRated: {
        url: `${baseUrl}/api/top-rated`,
        method: 'GET',
        description: 'Get top rated shows'
      },
      shows: {
        url: `${baseUrl}/api/shows`,
        method: 'GET',
        description: 'Get all shows'
      },
      search: {
        url: `${baseUrl}/api/search?q=one+piece`,
        method: 'GET',
        description: 'Search for shows',
        params: {
          q: 'search query'
        }
      },
      details: {
        url: `${baseUrl}/api/details/11800`,
        method: 'GET',
        description: 'Get show details by ID'
      },
      episodes: {
        url: `${baseUrl}/api/episodes/11800`,
        method: 'GET',
        description: 'Get episodes by show ID'
      }
    }
  });
});

// 1. Latest Updates / New Releases
app.get('/api/latest', async (req, res) => {
  try {
    const data = await fetchFromKissKH('/DramaList/LastUpdate');
    
    res.send({
      success: true,
      source: 'kisskh.co',
      total: data.length,
      data: data
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Failed to fetch latest updates',
      error: error.message
    });
  }
});

// 2. Anime Shows - Get ALL anime data
app.get('/api/anime', async (req, res) => {
  try {
    const data = await fetchFromKissKH('/DramaList/Animate');
    
    res.send({
      success: true,
      source: 'kisskh.co',
      total: data.length,
      data: data
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Failed to fetch anime shows',
      error: error.message
    });
  }
});

// 3. Upcoming Shows - Get ALL upcoming data
app.get('/api/upcoming', async (req, res) => {
  try {
    const data = await fetchFromKissKH('/DramaList/Upcoming');
    
    res.send({
      success: true,
      source: 'kisskh.co',
      total: data.length,
      data: data
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Failed to fetch upcoming shows',
      error: error.message
    });
  }
});

// 4. Most Viewed by Category - Get ALL most viewed data
// Categories: 1 = Chinese Drama, 2 = Korean Drama, etc.
app.get('/api/most-viewed/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const data = await fetchFromKissKH('/DramaList/MostView', { c: category });
    
    res.send({
      success: true,
      source: 'kisskh.co',
      category: category,
      categoryName: category === '1' ? 'Chinese Drama' : category === '2' ? 'Korean Drama' : `Category ${category}`,
      total: data.length,
      data: data
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Failed to fetch most viewed shows',
      error: error.message
    });
  }
});

// 5. Top Rated Shows - Get ALL top rated data
app.get('/api/top-rated', async (req, res) => {
  try {
    const data = await fetchFromKissKH('/DramaList/TopRating');
    
    res.send({
      success: true,
      source: 'kisskh.co',
      total: data.length,
      data: data
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Failed to fetch top rated shows',
      error: error.message
    });
  }
});

// 6. All Shows - Get ALL shows data
app.get('/api/shows', async (req, res) => {
  try {
    const data = await fetchFromKissKH('/DramaList/Show');
    
    res.send({
      success: true,
      source: 'kisskh.co',
      total: data.length,
      data: data
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Failed to fetch shows',
      error: error.message
    });
  }
});

// 7. Search functionality - Get ALL search results
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).send({
        success: false,
        message: 'Search query is required. Use ?q=query_text',
        example: '/api/search?q=one+piece'
      });
    }

    const data = await fetchFromKissKH('/DramaList/Search', { q: query });
    
    res.send({
      success: true,
      source: 'kisskh.co',
      query: query,
      total: data.length,
      data: data
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
});

// 8. Get Show Details by ID - Get COMPLETE show details
app.get('/api/details/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await fetchFromKissKH(`/DramaList/Drama/${id}`);
    
    res.send({
      success: true,
      source: 'kisskh.co',
      id: id,
      data: data
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Failed to fetch show details',
      error: error.message
    });
  }
});

// 9. Get Episodes for a Show - Get ALL episodes
app.get('/api/episodes/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await fetchFromKissKH(`/DramaList/Drama/${id}/episodes`);
    
    res.send({
      success: true,
      source: 'kisskh.co',
      dramaId: id,
      total: data.length,
      data: data
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Failed to fetch episodes',
      error: error.message
    });
  }
});

// 10. Browse by Category/Type - Get ALL category data
app.get('/api/category/:type', async (req, res) => {
  try {
    const type = req.params.type;
    const page = req.query.page || 1;
    
    const data = await fetchFromKissKH('/DramaList/List', { 
      type: type,
      page: page
    });
    
    res.send({
      success: true,
      source: 'kisskh.co',
      type: type,
      page: page,
      total: data.length,
      data: data
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
});

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.send({ 
    status: 'OK', 
    api: 'MFLIX',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Status endpoint
app.get('/status', (req, res) => {
  res.send({
    api: 'MFLIX',
    status: 'online',
    version: '1.0.0',
    server_time: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    source: 'kisskh.co'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).send({
    success: false,
    api: 'MFLIX',
    message: 'Internal server error',
    error: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send({
    success: false,
    api: 'MFLIX',
    message: 'Endpoint not found',
    requestedPath: req.path,
    availableEndpoints: {
      info: '/',
      health: '/health',
      status: '/status',
      latest: '/api/latest',
      anime: '/api/anime',
      upcoming: '/api/upcoming',
      mostViewed: '/api/most-viewed/:category',
      topRated: '/api/top-rated',
      shows: '/api/shows',
      search: '/api/search?q=query',
      details: '/api/details/:id',
      episodes: '/api/episodeAPIid',
      category: '/api/category/:type'
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              🎬 MFLIX API - ONLINE 🎬                    ║
║                                                           ║
║   Server Running: http://localhost:${PORT.toString().padEnd(28)}║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(31)}║
║   Source: kisskh.co                                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

📋 MFLIX API Endpoints:
   GET  /                           - API Documentation
   GET  /health                     - Health Check
   GET  /status                     - API Status
   
   📺 Content Endpoints:
   GET  /api/latest                 - Latest Updates
   GET  /api/anime                  - All Anime Shows
   GET  /api/upcoming               - Upcoming Shows
   GET  /api/most-viewed/1          - Most Viewed Chinese
   GET  /api/most-viewed/2          - Most Viewed Korean
   GET  /api/top-rated              - Top Rated Shows
   GET  /api/shows                  - All Shows
   GET  /api/search?q=query         - Search Shows
   GET  /api/details/:id            - Show Details
   GET  /api/episodes/:id           - Show Episodes
   GET  /api/category/:type         - Category Browse

🎯 All endpoints return COMPLETE data from kisskh.co
🚀 Ready to serve requests!
  `);
});

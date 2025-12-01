// api/index.js
const express = require('express');
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

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Drama API is running',
    status: 'ok',
    endpoints: {
      upcoming: '/api/DramaList/Upcoming?ispc=true',
      byId: '/api/DramaList/:id'
    }
  });
});

// Main endpoint - fetches from actual kisskh.do API with all headers
app.get('/api/DramaList/Upcoming', async (req, res) => {
  try {
    const ispc = req.query.ispc || 'true';
    const apiUrl = `https://kisskh.do/api/DramaList/Upcoming?ispc=${ispc}`;
    
    // Use all headers from the original request
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-PH,en;q=0.9,fil;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Priority': 'u=1, i',
        'Referer': 'https://kisskh.do/',
        'Sec-CH-UA': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Set cache headers similar to the original API
    res.header('Cache-Control', 'public, max-age=0');
    res.header('Content-Type', 'application/json; charset=utf-8');
    
    res.json(data);
    
  } catch (error) {
    console.error('Error fetching drama list:', error);
    res.status(500).json({ 
      error: 'Failed to fetch drama list',
      message: error.message,
      details: 'Check if kisskh.do API is accessible'
    });
  }
});

// Get drama by ID
app.get('/api/DramaList/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const apiUrl = `https://kisskh.do/api/DramaList/Upcoming?ispc=true`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-PH,en;q=0.9,fil;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Priority': 'u=1, i',
        'Referer': 'https://kisskh.do/',
        'Sec-CH-UA': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const drama = data.find(d => d.id === parseInt(id));
    
    if (drama) {
      res.header('Cache-Control', 'public, max-age=0');
      res.header('Content-Type', 'application/json; charset=utf-8');
      res.json(drama);
    } else {
      res.status(404).json({ error: 'Drama not found', id: id });
    }
    
  } catch (error) {
    console.error('Error fetching drama:', error);
    res.status(500).json({ 
      error: 'Failed to fetch drama',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    message: 'The requested endpoint does not exist'
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

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🎬 Drama API Server Running          ║
╠════════════════════════════════════════╣
║   Port: ${PORT}                       ║
║   Environment: Development             ║
╠════════════════════════════════════════╣
║   Endpoints:                           ║
║   → http://localhost:${PORT}/         ║
║   → http://localhost:${PORT}/api/DramaList/Upcoming?ispc=true
║   → http://localhost:${PORT}/health   ║
╚════════════════════════════════════════╝
    `);
  });
}

// Export for Vercel
module.exports = app;

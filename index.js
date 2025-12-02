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

// Helper function to filter drama list data
const filterDramaList = (items) => {
  return items.map(item => ({
    id: item.id,
    title: item.title,
    thumbnail: item.thumbnail,
    episodesCount: item.episodesCount,
    label: item.label,
    favoriteID: item.favoriteID
  }));
};

// Helper function to filter drama details
const filterDramaDetails = (data) => {
  return {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    description: data.description,
    releaseDate: data.releaseDate,
    country: data.country,
    status: data.status,
    type: data.type,
    episodesCount: data.episodesCount,
    episodes: data.episodes ? data.episodes.map(ep => ({
      id: ep.id,
      number: ep.number,
      sub: ep.sub
    })) : []
  };
};

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'KissKH API Proxy',
    endpoints: {
      show: '/api/DramaList/Show',
      topRating: '/api/DramaList/TopRating?ispc=true',
      mostView: '/api/DramaList/MostView?ispc=true&c=1',
      mostSearch: '/api/DramaList/MostSearch?ispc=false',
      lastUpdate: '/api/DramaList/LastUpdate?ispc=true',
      upcoming: '/api/DramaList/Upcoming?ispc=true',
      anime: '/api/DramaList/Animate?ispc=true',
      search: '/api/DramaList/Search?q=spirit&type=0',
      dramaDetails: '/api/DramaList/Drama/:id?isq=true',
      subtitles: '/api/Sub/:episodeId?kkey=KEY',
      videoStream: '/api/Video/:dramaId/:episodeNumber',
      health: '/health'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy endpoint for hero section shows
app.get('/api/DramaList/Show', async (req, res) => {
  try {
    const response = await axios.get('https://kisskh.do/api/DramaList/Show', {
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

    const filtered = response.data.map(item => ({
      id: item.id,
      title: item.title,
      thumbnail: item.thumbnail
    }));

    res.json(filtered);
  } catch (error) {
    console.error('Error fetching show data:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch show data',
      message: error.message
    });
  }
});

// Proxy endpoint for top rated shows
app.get('/api/DramaList/TopRating', async (req, res) => {
  try {
    const { ispc } = req.query;
    
    const response = await axios.get('https://kisskh.do/api/DramaList/TopRating', {
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

    res.json(filterDramaList(response.data));
  } catch (error) {
    console.error('Error fetching top rating data:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch top rating data',
      message: error.message
    });
  }
});

// Proxy endpoint for most viewed shows
app.get('/api/DramaList/MostView', async (req, res) => {
  try {
    const { ispc, c } = req.query;
    
    const response = await axios.get('https://kisskh.do/api/DramaList/MostView', {
      params: { 
        ispc: ispc || 'true',
        c: c || '1'
      },
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

    res.json(filterDramaList(response.data));
  } catch (error) {
    console.error('Error fetching most viewed data:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch most viewed data',
      message: error.message
    });
  }
});

// Proxy endpoint for most searched shows
app.get('/api/DramaList/MostSearch', async (req, res) => {
  try {
    const { ispc } = req.query;
    
    const response = await axios.get('https://kisskh.do/api/DramaList/MostSearch', {
      params: { ispc: ispc || 'false' },
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

    res.json(filterDramaList(response.data));
  } catch (error) {
    console.error('Error fetching most search data:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch most search data',
      message: error.message
    });
  }
});

// Proxy endpoint for last updated shows
app.get('/api/DramaList/LastUpdate', async (req, res) => {
  try {
    const { ispc } = req.query;
    
    const response = await axios.get('https://kisskh.do/api/DramaList/LastUpdate', {
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

    res.json(filterDramaList(response.data));
  } catch (error) {
    console.error('Error fetching last update data:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch last update data',
      message: error.message
    });
  }
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

    res.json(filterDramaList(response.data));
  } catch (error) {
    console.error('Error fetching upcoming data:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch upcoming data',
      message: error.message
    });
  }
});

// Proxy endpoint for anime list
app.get('/api/DramaList/Animate', async (req, res) => {
  try {
    const { ispc } = req.query;
    
    const response = await axios.get('https://kisskh.do/api/DramaList/Animate', {
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

    res.json(filterDramaList(response.data));
  } catch (error) {
    console.error('Error fetching anime data:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch anime data',
      message: error.message
    });
  }
});

// Proxy endpoint for search
app.get('/api/DramaList/Search', async (req, res) => {
  try {
    const { q, type } = req.query;
    
    const response = await axios.get('https://kisskh.do/api/DramaList/Search', {
      params: { 
        q: q || '',
        type: type || '0'
      },
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

    res.json(filterDramaList(response.data));
  } catch (error) {
    console.error('Error fetching search data:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch search data',
      message: error.message
    });
  }
});

// Proxy endpoint for drama details
app.get('/api/DramaList/Drama/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isq } = req.query;
    
    const response = await axios.get(`https://kisskh.do/api/DramaList/Drama/${id}`, {
      params: { isq: isq || 'true' },
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

    res.json(filterDramaDetails(response.data));
  } catch (error) {
    console.error('Error fetching drama details:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch drama details',
      message: error.message
    });
  }
});

// Proxy endpoint for subtitles
app.get('/api/Sub/:episodeId', async (req, res) => {
  try {
    const { episodeId } = req.params;
    const { kkey } = req.query;
    
    if (!kkey) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'kkey parameter is required'
      });
    }
    
    const response = await axios.get(`https://kisskh.do/api/Sub/${episodeId}`, {
      params: { kkey },
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

    const filtered = response.data.map(sub => ({
      src: sub.src,
      label: sub.label,
      language: sub.land,
      default: sub.default
    }));

    res.json(filtered);
  } catch (error) {
    console.error('Error fetching subtitles:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch subtitles',
      message: error.message
    });
  }
});

// Video stream URL generator
app.get('/api/Video/:dramaId/:episodeNumber', (req, res) => {
  try {
    const { dramaId, episodeNumber } = req.params;
    
    const streamUrl = `https://hls.cdnvideo11.shop/hls07/${dramaId}/Ep${episodeNumber}_index.m3u8`;
    
    res.json({
      dramaId,
      episodeNumber,
      streamUrl,
      type: 'hls'
    });
  } catch (error) {
    console.error('Error generating video URL:', error.message);
    res.status(500).json({
      error: 'Failed to generate video URL',
      message: error.message
    });
  }
});

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
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

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

// Upcoming dramas endpoint
app.get('/api/DramaList/Upcoming', async (req, res) => {
  try {
    const response = await axios.get('https://kisskh.do/api/DramaList/Upcoming', {
      params: {
        ispc: req.query.ispc || 'false'
      },
      headers: {
        'authority': 'kisskh.do',
        'method': 'GET',
        'path': '/api/DramaList/Upcoming?ispc=false',
        'scheme': 'https',
        'accept': 'application/json, text/plain, */*',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'cookie': 'g_state={\"i_l\":1,\"i_u\":\"17645865179417\",\"i_b\":\"HykIHnkeAjoSZArPllkmmSytVwIoQujG7779cqtBAA7v\",\"gs\":\"gAT_LY7G3I187224_1745050\",\"gs_R3CRNMYF3Q\":\"GS2.1.a17645846528a1SgGSI1764584686326265\",\"i0\"}'',
        'referer': 'https://kisskh.do/',
        'sec-ch-ua': '"Chromium";v="137", "Not(A:Brand";v="24"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      },
      timeout: 10000
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching upcoming dramas:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch upcoming dramas',
      message: error.message
    });
  }
});

// Drama details endpoint
app.get('/api/DramaList/Drama/:id', async (req, res) => {
  try {
    const response = await axios.get(`https://kisskh.do/api/DramaList/Drama/${req.params.id}`, {
      params: {
        isq: req.query.isq || ''
      },
      headers: {
        'authority': 'kisskh.do',
        'accept': 'application/json, text/plain, */*',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'cookie': 'g_state={\"i_l\":1,\"i_u\":\"17645865179417\",\"i_b\":\"HykIHnkeAjoSZArPllkmmSytVwIoQujG7779cqtBAA7v\",\"gs\":\"gAT_LY7G3I187224_1745050\",\"gs_R3CRNMYF3Q\":\"GS2.1.a17645846528a1SgGSI1764584686326265\",\"i0\"}'',
        'referer': 'https://kisskh.do/',
        'sec-ch-ua': '"Chromium";v="137", "Not(A:Brand";v="24"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      },
      timeout: 10000
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching drama details:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch drama details',
      message: error.message
    });
  }
});

// Search endpoint
app.get('/api/DramaList/Search', async (req, res) => {
  try {
    const response = await axios.get('https://kisskh.do/api/DramaList/Search', {
      params: {
        q: req.query.q || '',
        type: req.query.type || ''
      },
      headers: {
        'authority': 'kisskh.do',
        'accept': 'application/json, text/plain, */*',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'cookie': 'g_state={\"i_l\":1,\"i_u\":\"17645865179417\",\"i_b\":\"HykIHnkeAjoSZArPllkmmSytVwIoQujG7779cqtBAA7v\",\"gs\":\"gAT_LY7G3I187224_1745050\",\"gs_R3CRNMYF3Q\":\"GS2.1.a17645846528a1SgGSI1764584686326265\",\"i0\"}'',
        'referer': 'https://kisskh.do/',
        'sec-ch-ua': '"Chromium";v="137", "Not(A:Brand";v="24"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      },
      timeout: 10000
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error searching dramas:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to search dramas',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'MFlix-Api',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      'GET /api/DramaList/Upcoming?ispc=false',
      'GET /api/DramaList/Drama/:id?isq=',
      'GET /api/DramaList/Search?q=&type='
    ]
  });
});

// Export for Vercel
module.exports = app;

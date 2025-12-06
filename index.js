// index.js - MFlix API Server
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// ==================== MONGODB CONNECTION ====================
const uri = "mongodb+srv://mflixph:XaneKath1@mflixph.wngbqmu.mongodb.net/mflix?appName=mflixph";
const clientOptions = { 
  serverApi: { version: '1', strict: false, deprecationErrors: true } 
};

mongoose.connect(uri, clientOptions)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ==================== MONGOOSE SCHEMAS ====================
const animeSchema = new mongoose.Schema({
  anilistId: { type: Number, required: true, unique: true },
  title: {
    romaji: String,
    english: String,
    native: String
  },
  description: String,
  coverImage: {
    large: String,
    medium: String
  },
  bannerImage: String,
  genres: [String],
  tags: [String],
  episodes: Number,
  duration: Number,
  status: String,
  season: String,
  seasonYear: Number,
  averageScore: Number,
  popularity: Number,
  trending: Number,
  format: String,
  studios: [String],
  
  // Custom streaming data
  category: { 
    type: String, 
    enum: ['UPCOMING', 'NEWEST', 'POPULAR', 'TOP_RATED'],
    default: 'NEWEST'
  },
  servers: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    quality: String,
    isActive: { type: Boolean, default: true }
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Anime = mongoose.model('Anime', animeSchema);

// ==================== ANILIST GRAPHQL HELPER ====================
async function fetchFromAniList(query, variables = {}) {
  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables })
  });
  
  const data = await response.json();
  return data.data;
}

// ==================== API ROUTES ====================

// ==================== PUBLIC API ENDPOINTS (For Your Website) ====================

// PUBLIC: Get all anime (paginated)
// ENDPOINT: GET /api/public/anime?page=1&limit=20
app.get('/api/public/anime', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const anime = await Anime.find()
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Anime.countDocuments();
    
    res.json({
      success: true,
      data: anime,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUBLIC: Get anime by category (NEWEST, POPULAR, TOP_RATED, UPCOMING)
// ENDPOINT: GET /api/public/category/NEWEST?page=1&limit=20
app.get('/api/public/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const anime = await Anime.find({ category: category.toUpperCase() })
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Anime.countDocuments({ category: category.toUpperCase() });
    
    res.json({
      success: true,
      data: anime,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUBLIC: Get single anime by ID with servers (default server1)
// ENDPOINT: GET /api/public/anime/:id
// Response includes all anime info + servers (server1 is default)
app.get('/api/public/anime/:id', async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);
    
    if (!anime) {
      return res.status(404).json({ success: false, error: 'Anime not found' });
    }
    
    // Format response with default server
    const response = {
      success: true,
      data: {
        ...anime.toObject(),
        defaultServer: anime.servers.find(s => s.name === 'server1') || anime.servers[0]
      }
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUBLIC: Search anime by title
// ENDPOINT: GET /api/public/search?query=naruto&page=1&limit=20
// This searches YOUR database only (uploaded anime), NOT AniList
app.get('/api/public/search', async (req, res) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query parameter is required' });
    }
    
    const searchRegex = new RegExp(query, 'i');
    
    const anime = await Anime.find({
      $or: [
        { 'title.romaji': searchRegex },
        { 'title.english': searchRegex },
        { 'title.native': searchRegex }
      ]
    })
      .sort({ popularity: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Anime.countDocuments({
      $or: [
        { 'title.romaji': searchRegex },
        { 'title.english': searchRegex },
        { 'title.native': searchRegex }
      ]
    });
    
    // If no results found, return error message
    if (anime.length === 0) {
      return res.status(404).json({
        success: false,
        error: `"${query}" is not uploaded to our server. Please contact the admin to upload it.`,
        message: 'Anime not found in database',
        query: query
      });
    }
    
    res.json({
      success: true,
      data: anime,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ADMIN API ENDPOINTS ====================

// Root route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>MFlix API</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        h1 { color: #1976d2; }
        .link { display: block; padding: 10px; margin: 10px 0; background: #f5f5f5; border-radius: 5px; text-decoration: none; color: #333; }
        .link:hover { background: #e0e0e0; }
      </style>
    </head>
    <body>
      <h1>🎬 MFlix API</h1>
      <p>Welcome to the MFlix Anime Streaming API!</p>
      <a href="/admin/index.html" class="link">📊 Go to Admin Dashboard</a>
      <a href="/api/health" class="link">🏥 API Health Check</a>
      <h3>API Endpoints:</h3>
      <ul>
        <li>GET /api/search?query=naruto - Search anime</li>
        <li>GET /api/anime - Get all anime</li>
        <li>GET /api/anime/:id - Get single anime</li>
        <li>POST /api/anime - Add anime</li>
        <li>PUT /api/anime/:id/servers - Update servers</li>
        <li>DELETE /api/anime/:id - Delete anime</li>
      </ul>
    </body>
    </html>
  `);
});

// 1. ADMIN ONLY: Search anime from AniList (not your database)
// This is used by admin to find anime to add from AniList
app.get('/api/search', async (req, res) => {
  try {
    const { query, page = 1, perPage = 20 } = req.query;
    
    const gqlQuery = `
      query ($search: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
          }
          media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              medium
            }
            bannerImage
            genres
            tags {
              name
            }
            episodes
            duration
            status
            season
            seasonYear
            averageScore
            popularity
            trending
            format
            studios {
              nodes {
                name
              }
            }
          }
        }
      }
    `;
    
    const data = await fetchFromAniList(gqlQuery, { 
      search: query, 
      page: parseInt(page), 
      perPage: parseInt(perPage) 
    });
    
    const formattedData = data.Page.media.map(anime => ({
      anilistId: anime.id,
      title: anime.title,
      description: anime.description,
      coverImage: anime.coverImage,
      bannerImage: anime.bannerImage,
      genres: anime.genres,
      tags: anime.tags?.map(t => t.name) || [],
      episodes: anime.episodes,
      duration: anime.duration,
      status: anime.status,
      season: anime.season,
      seasonYear: anime.seasonYear,
      averageScore: anime.averageScore,
      popularity: anime.popularity,
      trending: anime.trending,
      format: anime.format,
      studios: anime.studios?.nodes?.map(s => s.name) || []
    }));
    
    res.json({
      success: true,
      pageInfo: data.Page.pageInfo,
      data: formattedData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Get anime by AniList ID
app.get('/api/anime/anilist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const gqlQuery = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          description
          coverImage {
            large
            medium
          }
          bannerImage
          genres
          tags {
            name
          }
          episodes
          duration
          status
          season
          seasonYear
          averageScore
          popularity
          trending
          format
          studios {
            nodes {
              name
            }
          }
        }
      }
    `;
    
    const data = await fetchFromAniList(gqlQuery, { id: parseInt(id) });
    
    if (!data.Media) {
      return res.status(404).json({ success: false, error: 'Anime not found on AniList' });
    }
    
    const anime = data.Media;
    res.json({
      success: true,
      data: {
        anilistId: anime.id,
        title: anime.title,
        description: anime.description,
        coverImage: anime.coverImage,
        bannerImage: anime.bannerImage,
        genres: anime.genres,
        tags: anime.tags?.map(t => t.name) || [],
        episodes: anime.episodes,
        duration: anime.duration,
        status: anime.status,
        season: anime.season,
        seasonYear: anime.seasonYear,
        averageScore: anime.averageScore,
        popularity: anime.popularity,
        trending: anime.trending,
        format: anime.format,
        studios: anime.studios?.nodes?.map(s => s.name) || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Add anime to database
app.post('/api/anime', async (req, res) => {
  try {
    const { anilistId, category, servers } = req.body;
    
    const gqlQuery = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title { romaji english native }
          description
          coverImage { large medium }
          bannerImage
          genres
          tags { name }
          episodes
          duration
          status
          season
          seasonYear
          averageScore
          popularity
          trending
          format
          studios { nodes { name } }
        }
      }
    `;
    
    const data = await fetchFromAniList(gqlQuery, { id: parseInt(anilistId) });
    
    if (!data.Media) {
      return res.status(404).json({ success: false, error: 'Anime not found on AniList' });
    }
    
    const anilistData = data.Media;
    
    const anime = await Anime.findOneAndUpdate(
      { anilistId: parseInt(anilistId) },
      {
        anilistId: anilistData.id,
        title: anilistData.title,
        description: anilistData.description,
        coverImage: anilistData.coverImage,
        bannerImage: anilistData.bannerImage,
        genres: anilistData.genres,
        tags: anilistData.tags?.map(t => t.name) || [],
        episodes: anilistData.episodes,
        duration: anilistData.duration,
        status: anilistData.status,
        season: anilistData.season,
        seasonYear: anilistData.seasonYear,
        averageScore: anilistData.averageScore,
        popularity: anilistData.popularity,
        trending: anilistData.trending,
        format: anilistData.format,
        studios: anilistData.studios?.nodes?.map(s => s.name) || [],
        category: category || 'NEWEST',
        servers: servers || [],
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.json({ success: true, data: anime });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Update anime servers
app.put('/api/anime/:id/servers', async (req, res) => {
  try {
    const { id } = req.params;
    const { servers } = req.body;
    
    const anime = await Anime.findByIdAndUpdate(
      id,
      { servers, updatedAt: new Date() },
      { new: true }
    );
    
    if (!anime) {
      return res.status(404).json({ success: false, error: 'Anime not found in database' });
    }
    
    res.json({ success: true, data: anime });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4b. Update entire anime (category, servers, etc.)
app.put('/api/anime/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, servers } = req.body;
    
    const updateData = { updatedAt: new Date() };
    if (category) updateData.category = category;
    if (servers) updateData.servers = servers;
    
    const anime = await Anime.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!anime) {
      return res.status(404).json({ success: false, error: 'Anime not found in database' });
    }
    
    res.json({ success: true, data: anime });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Update anime category
app.put('/api/anime/:id/category', async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;
    
    if (!['UPCOMING', 'NEWEST', 'POPULAR', 'TOP_RATED'].includes(category)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid category. Must be: UPCOMING, NEWEST, POPULAR, or TOP_RATED' 
      });
    }
    
    const anime = await Anime.findByIdAndUpdate(
      id,
      { category, updatedAt: new Date() },
      { new: true }
    );
    
    if (!anime) {
      return res.status(404).json({ success: false, error: 'Anime not found in database' });
    }
    
    res.json({ success: true, data: anime });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Get anime by category
app.get('/api/anime/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const anime = await Anime.find({ category: category.toUpperCase() })
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Anime.countDocuments({ category: category.toUpperCase() });
    
    res.json({
      success: true,
      data: anime,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Get single anime
app.get('/api/anime/:id', async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);
    
    if (!anime) {
      return res.status(404).json({ success: false, error: 'Anime not found' });
    }
    
    res.json({ success: true, data: anime });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Get all anime
app.get('/api/anime', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const anime = await Anime.find()
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Anime.countDocuments();
    
    res.json({
      success: true,
      data: anime,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. Delete anime
app.delete('/api/anime/:id', async (req, res) => {
  try {
    const anime = await Anime.findByIdAndDelete(req.params.id);
    
    if (!anime) {
      return res.status(404).json({ success: false, error: 'Anime not found' });
    }
    
    res.json({ success: true, message: 'Anime deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 10. Get trending anime
app.get('/api/trending', async (req, res) => {
  try {
    const { page = 1, perPage = 20 } = req.query;
    
    const gqlQuery = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(type: ANIME, sort: TRENDING_DESC) {
            id
            title { romaji english native }
            coverImage { large medium }
            trending
            averageScore
            popularity
            genres
          }
        }
      }
    `;
    
    const data = await fetchFromAniList(gqlQuery, { 
      page: parseInt(page), 
      perPage: parseInt(perPage) 
    });
    
    res.json({ success: true, data: data.Page.media });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'MFlix API is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║       🎬 MFlix API Server Started      ║
╠════════════════════════════════════════╣
║  Port: ${PORT}                           ║
║  Admin: http://localhost:${PORT}/admin/index.html
║  API: http://localhost:${PORT}/api         ║
║  Health: http://localhost:${PORT}/api/health
╚════════════════════════════════════════╝
  `);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
const uri = "mongodb+srv://mflixph:XaneKath1@mflixph.wngbqmu.mongodb.net/mflix?appName=mflixph";
const clientOptions = { serverApi: { version: '1', strict: false, deprecationErrors: true } };

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
    name: { type: String, required: true }, // server1, server2
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

// 1. Search anime from AniList and optionally add to database
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

// 3. Add anime to database with streaming servers
app.post('/api/anime', async (req, res) => {
  try {
    const { anilistId, category, servers } = req.body;
    
    // Fetch anime info from AniList
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
    
    // Create or update anime in database
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

// 6. Get all anime from database by category
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

// 7. Get single anime from database
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

// 8. Get all anime from database
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

// 9. Delete anime from database
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

// 10. Get trending anime from AniList
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
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 MFlix API running on port ${PORT}`);
});

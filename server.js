// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
const uri = "mongodb+srv://mflixph:XaneKath1@mflixph.wngbqmu.mongodb.net/mflix?appName=mflixph";
const clientOptions = { 
  serverApi: { version: '1', strict: false, deprecationErrors: true }
};

mongoose.connect(uri, clientOptions)
  .then(() => console.log('✅ Connected to MongoDB!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ==================== SCHEMAS ====================

// Content Schema
const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['ANIME', 'MOVIE', 'KDRAMA', 'SERIES', 'CDRAMA', 'JDRAMA'],
    required: true 
  },
  
  // AniList Data
  anilistId: { type: Number, unique: true, sparse: true },
  coverImage: String,
  bannerImage: String,
  description: String,
  genres: [String],
  tags: [String],
  episodes: Number,
  duration: Number,
  status: String,
  season: String,
  seasonYear: Number,
  averageScore: Number,
  popularity: Number,
  studios: [String],
  
  // Streaming Links
  servers: [{
    serverName: { type: String, enum: ['server1', 'server2'], required: true },
    episodes: [{
      episodeNumber: { type: Number, required: true },
      title: String,
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now }
    }]
  }],
  
  // Categories (Admin Control)
  category: { 
    type: String, 
    enum: ['newest', 'popular', 'toprated', 'none'],
    default: 'none'
  },
  
  // Hero Banner (Admin Control)
  showInBanner: { type: Boolean, default: false },
  
  // Additional Info
  rating: { type: String, default: 'PG-13' },
  releaseDate: Date,
  trailer: String,
  
  // Metadata
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Content = mongoose.model('Content', contentSchema);

// ==================== ANILIST GRAPHQL API ====================

const ANILIST_API = 'https://graphql.anilist.co';

async function searchAniList(query, type = 'ANIME') {
  const graphqlQuery = `
    query ($search: String, $type: MediaType) {
      Page(page: 1, perPage: 10) {
        media(search: $search, type: $type) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            large
            extraLarge
          }
          bannerImage
          description
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
          studios {
            nodes {
              name
            }
          }
          startDate {
            year
            month
            day
          }
          trailer {
            id
            site
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(ANILIST_API, {
      query: graphqlQuery,
      variables: { search: query, type }
    });
    return response.data.data.Page.media;
  } catch (error) {
    console.error('AniList API Error:', error.message);
    return [];
  }
}

async function getAniListDetails(id) {
  const graphqlQuery = `
    query ($id: Int) {
      Media(id: $id) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          extraLarge
        }
        bannerImage
        description
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
        studios {
          nodes {
            name
          }
        }
        startDate {
          year
          month
          day
        }
        trailer {
          id
          site
        }
      }
    }
  `;

  try {
    const response = await axios.post(ANILIST_API, {
      query: graphqlQuery,
      variables: { id }
    });
    return response.data.data.Media;
  } catch (error) {
    console.error('AniList API Error:', error.message);
    return null;
  }
}

// ==================== ADMIN API ROUTES ====================

// 1. SEARCH ANILIST
app.get('/api/admin/search/anilist', async (req, res) => {
  try {
    const { query, type = 'ANIME' } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = await searchAniList(query, type);
    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. ADD CONTENT (Admin only)
app.post('/api/admin/content', async (req, res) => {
  try {
    const { anilistId, title, type, servers } = req.body;

    let anilistData = null;
    if (anilistId) {
      anilistData = await getAniListDetails(anilistId);
    }

    const content = new Content({
      title: anilistData?.title?.english || anilistData?.title?.romaji || title,
      type: type || 'ANIME',
      anilistId: anilistData?.id,
      coverImage: anilistData?.coverImage?.extraLarge,
      bannerImage: anilistData?.bannerImage,
      description: anilistData?.description?.replace(/<[^>]*>/g, ''),
      genres: anilistData?.genres || [],
      tags: anilistData?.tags?.map(t => t.name) || [],
      episodes: anilistData?.episodes,
      duration: anilistData?.duration,
      status: anilistData?.status,
      season: anilistData?.season,
      seasonYear: anilistData?.seasonYear,
      averageScore: anilistData?.averageScore,
      popularity: anilistData?.popularity,
      studios: anilistData?.studios?.nodes?.map(s => s.name) || [],
      releaseDate: anilistData?.startDate ? 
        new Date(anilistData.startDate.year, anilistData.startDate.month - 1, anilistData.startDate.day) : null,
      trailer: anilistData?.trailer?.site === 'youtube' ? 
        `https://www.youtube.com/watch?v=${anilistData.trailer.id}` : null,
      servers: servers || [],
      category: 'none',
      showInBanner: false
    });

    await content.save();
    res.status(201).json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. ADD/UPDATE SERVER LINKS (Admin only)
app.post('/api/admin/content/:id/servers', async (req, res) => {
  try {
    const { id } = req.params;
    const { serverName, episodeNumber, episodeTitle, url } = req.body;

    if (!['server1', 'server2'].includes(serverName)) {
      return res.status(400).json({ error: 'Server must be server1 or server2' });
    }

    const content = await Content.findById(id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    let server = content.servers.find(s => s.serverName === serverName);
    if (!server) {
      server = { serverName, episodes: [] };
      content.servers.push(server);
    }

    const episodeIndex = server.episodes.findIndex(e => e.episodeNumber === episodeNumber);
    if (episodeIndex > -1) {
      server.episodes[episodeIndex].url = url;
      server.episodes[episodeIndex].title = episodeTitle;
    } else {
      server.episodes.push({
        episodeNumber,
        title: episodeTitle,
        url
      });
    }

    server.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);

    content.updatedAt = Date.now();
    await content.save();

    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. GET ALL CONTENT (Admin)
app.get('/api/admin/content', async (req, res) => {
  try {
    const { type, genre, status, featured, search, page = 1, limit = 50, category } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (featured) query.featured = featured === 'true';
    if (genre) query.genres = genre;
    if (search) query.title = new RegExp(search, 'i');
    if (category && category !== 'all') query.category = category;

    const skip = (page - 1) * limit;
    
    let sortBy = { createdAt: -1 };
    if (category === 'popular') sortBy = { views: -1 };
    if (category === 'toprated') sortBy = { averageScore: -1 };
    
    const content = await Content.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Content.countDocuments(query);

    res.json({
      success: true,
      data: content,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. UPDATE CONTENT CATEGORY (Admin only)
app.put('/api/admin/content/:id/category', async (req, res) => {
  try {
    const { category } = req.body;
    
    if (!['newest', 'popular', 'toprated', 'none'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const content = await Content.findByIdAndUpdate(
      req.params.id,
      { category, updatedAt: Date.now() },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. TOGGLE BANNER (Admin only)
app.put('/api/admin/content/:id/banner', async (req, res) => {
  try {
    const { showInBanner } = req.body;

    const content = await Content.findByIdAndUpdate(
      req.params.id,
      { showInBanner: showInBanner === true, updatedAt: Date.now() },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. UPDATE CONTENT (Admin)
app.put('/api/admin/content/:id', async (req, res) => {
  try {
    const updates = req.body;
    updates.updatedAt = Date.now();
    
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. DELETE CONTENT (Admin)
app.delete('/api/admin/content/:id', async (req, res) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ success: true, message: 'Content deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PUBLIC API ROUTES (FOR YOUR WEBSITE) ====================

// Get all content with filters
app.get('/api/content', async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    
    const content = await Content.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Content.countDocuments(query);

    res.json({
      success: true,
      data: content,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get NEWEST content (Admin-selected)
app.get('/api/newest', async (req, res) => {
  try {
    const { type, limit = 20 } = req.query;
    
    const query = { category: 'newest' };
    if (type) query.type = type;
    
    const content = await Content.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get POPULAR content (Admin-selected)
app.get('/api/popular', async (req, res) => {
  try {
    const { type, limit = 20 } = req.query;
    
    const query = { category: 'popular' };
    if (type) query.type = type;
    
    const content = await Content.find(query)
      .sort({ views: -1 })
      .limit(parseInt(limit));
    
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get TOP RATED content (Admin-selected)
app.get('/api/toprated', async (req, res) => {
  try {
    const { type, limit = 20 } = req.query;
    
    const query = { category: 'toprated' };
    if (type) query.type = type;
    
    const content = await Content.find(query)
      .sort({ averageScore: -1 })
      .limit(parseInt(limit));
    
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get BANNER/HERO content (Admin-selected)
app.get('/api/banner', async (req, res) => {
  try {
    const content = await Content.find({ showInBanner: true })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single content
app.get('/api/content/:id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    content.views += 1;
    await content.save();

    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get featured content
app.get('/api/featured', async (req, res) => {
  try {
    const content = await Content.find({ featured: true })
      .sort({ popularity: -1 })
      .limit(10);
    
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like content
app.post('/api/content/:id/like', async (req, res) => {
  try {
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ success: true, likes: content.likes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search content
app.get('/api/search', async (req, res) => {
  try {
    const { q, type, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const query = {
      title: new RegExp(q, 'i')
    };
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    
    const content = await Content.find(query)
      .sort({ popularity: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Content.countDocuments(query);

    res.json({
      success: true,
      data: content,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to MFlix API',
    version: '1.0.0',
    adminEndpoints: {
      search: 'GET /api/admin/search/anilist?query=naruto&type=ANIME',
      addContent: 'POST /api/admin/content',
      addServer: 'POST /api/admin/content/:id/servers',
      updateCategory: 'PUT /api/admin/content/:id/category',
      toggleBanner: 'PUT /api/admin/content/:id/banner',
      getAll: 'GET /api/admin/content',
      update: 'PUT /api/admin/content/:id',
      delete: 'DELETE /api/admin/content/:id'
    },
    publicEndpoints: {
      getAllContent: 'GET /api/content',
      getNewest: 'GET /api/newest',
      getPopular: 'GET /api/popular',
      getTopRated: 'GET /api/toprated',
      getBanner: 'GET /api/banner',
      getOne: 'GET /api/content/:id',
      search: 'GET /api/search?q=naruto',
      featured: 'GET /api/featured',
      like: 'POST /api/content/:id/like'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MFlix API running on port ${PORT}`);
});

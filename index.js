const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from public folder

// MongoDB Connection
const uri = "mongodb+srv://mflixph:XaneKath1@mflixph.wngbqmu.mongodb.net/?appName=mflixph";
const clientOptions = { serverApi: { version: '1', strict: false, deprecationErrors: true } };

mongoose.connect(uri, clientOptions)
  .then(() => console.log("✓ Connected to MongoDB!"))
  .catch(err => console.error("MongoDB connection error:", err));

// Content Schema
const contentSchema = new mongoose.Schema({
  anilistId: { type: Number, unique: true, sparse: true },
  title: {
    english: String,
    romaji: String,
    native: String
  },
  type: { type: String, enum: ['ANIME', 'MOVIE', 'KDRAMA', 'OTHER'] },
  description: String,
  coverImage: String,
  bannerImage: String,
  genres: [String],
  episodes: Number,
  duration: Number,
  status: String,
  season: String,
  seasonYear: Number,
  averageScore: Number,
  popularity: Number,
  trending: Number,
  category: { type: String, enum: ['UPCOMING', 'NEWEST', 'POPULAR', 'TOP_RATED'], default: 'NEWEST' },
  servers: [{
    name: { type: String, enum: ['server1', 'server2'] },
    url: String,
    episode: Number
  }],
  trailer: {
    id: String,
    site: String
  },
  releaseDate: Date,
  tags: [String],
  studios: [String],
  isAdult: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for better performance
contentSchema.index({ category: 1, createdAt: -1 });
contentSchema.index({ category: 1, popularity: -1 });
contentSchema.index({ category: 1, averageScore: -1 });
contentSchema.index({ 'title.english': 'text', 'title.romaji': 'text' });

const Content = mongoose.model('Content', contentSchema);

// AniList GraphQL API Configuration
const ANILIST_API = 'https://graphql.anilist.co';

// Helper: Query AniList API
async function queryAniList(query, variables = {}) {
  try {
    const response = await axios.post(ANILIST_API, {
      query,
      variables
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.data;
  } catch (error) {
    throw new Error(`AniList API Error: ${error.message}`);
  }
}

// ==================== PUBLIC API FOR WEBSITE ====================

// Get newest content for website
app.get('/public/newest', async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filter = { category: 'NEWEST' };
    if (type) filter.type = type.toUpperCase();
    
    const content = await Content.find(filter)
      .select('-__v')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    const total = await Content.countDocuments(filter);
    
    res.json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      data: content
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get popular content for website
app.get('/public/popular', async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filter = { category: 'POPULAR' };
    if (type) filter.type = type.toUpperCase();
    
    const content = await Content.find(filter)
      .select('-__v')
      .sort('-popularity -averageScore')
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    const total = await Content.countDocuments(filter);
    
    res.json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      data: content
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get top rated content for website
app.get('/public/top-rated', async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filter = { category: 'TOP_RATED', averageScore: { $exists: true, $ne: null } };
    if (type) filter.type = type.toUpperCase();
    
    const content = await Content.find(filter)
      .select('-__v')
      .sort('-averageScore -popularity')
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    const total = await Content.countDocuments(filter);
    
    res.json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      data: content
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get upcoming content for website
app.get('/public/upcoming', async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filter = { category: 'UPCOMING' };
    if (type) filter.type = type.toUpperCase();
    
    const content = await Content.find(filter)
      .select('-__v')
      .sort('-releaseDate -popularity')
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    const total = await Content.countDocuments(filter);
    
    res.json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      data: content
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single content info for website (for watch page)
app.get('/public/watch/:id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .select('-__v')
      .lean();
    
    if (!content) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }
    
    // Group servers by episode
    const serversByEpisode = {};
    content.servers.forEach(server => {
      if (!serversByEpisode[server.episode]) {
        serversByEpisode[server.episode] = [];
      }
      serversByEpisode[server.episode].push({
        name: server.name,
        url: server.url,
        quality: server.quality || 'HD'
      });
    });
    
    res.json({
      success: true,
      data: {
        ...content,
        serversByEpisode
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get servers for specific episode
app.get('/public/watch/:id/episode/:episode', async (req, res) => {
  try {
    const { id, episode } = req.params;
    
    const content = await Content.findById(id)
      .select('title servers episodes')
      .lean();
    
    if (!content) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }
    
    const episodeNum = parseInt(episode);
    const servers = content.servers.filter(s => s.episode === episodeNum);
    
    if (servers.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'No servers available for this episode' 
      });
    }
    
    res.json({
      success: true,
      title: content.title,
      episode: episodeNum,
      totalEpisodes: content.episodes,
      servers: servers.map(s => ({
        name: s.name,
        url: s.url,
        quality: s.quality || 'HD'
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search content for website
app.get('/public/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20, type } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, error: 'Search query is required' });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { 
      $or: [
        { 'title.english': { $regex: q, $options: 'i' } },
        { 'title.romaji': { $regex: q, $options: 'i' } }
      ]
    };
    
    if (type) filter.type = type.toUpperCase();
    
    const content = await Content.find(filter)
      .select('-__v')
      .sort('-popularity')
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    const total = await Content.countDocuments(filter);
    
    res.json({
      success: true,
      query: q,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      data: content
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get content by genre
app.get('/public/genre/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const content = await Content.find({ 
      genres: { $regex: new RegExp(genre, 'i') }
    })
      .select('-__v')
      .sort('-popularity')
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    const total = await Content.countDocuments({ 
      genres: { $regex: new RegExp(genre, 'i') }
    });
    
    res.json({
      success: true,
      genre,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      data: content
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get trending content
app.get('/public/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const content = await Content.find({ trending: { $exists: true, $gt: 0 } })
      .select('-__v')
      .sort('-trending -popularity')
      .limit(parseInt(limit))
      .lean();
    
    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get recently added
app.get('/public/recent', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const content = await Content.find()
      .select('-__v')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .lean();
    
    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ADMIN API (Protected) ====================

// Search AniList and get content info
app.get('/api/search', async (req, res) => {
  try {
    const { query, type = 'ANIME', page = 1, perPage = 20 } = req.query;
    
    const gqlQuery = `
      query ($search: String, $type: MediaType, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(search: $search, type: $type) {
            id
            title { romaji english native }
            type
            format
            description
            coverImage { large extraLarge }
            bannerImage
            genres
            episodes
            duration
            status
            season
            seasonYear
            averageScore
            popularity
            trending
            startDate { year month day }
            trailer { id site }
            tags { name }
            studios(isMain: true) { nodes { name } }
            isAdult
          }
        }
      }
    `;

    const data = await queryAniList(gqlQuery, { 
      search: query, 
      type: type.toUpperCase(),
      page: parseInt(page),
      perPage: parseInt(perPage)
    });

    res.json({
      success: true,
      results: data.Page.media
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Import content from AniList to database
app.post('/api/import', async (req, res) => {
  try {
    const { anilistId, category = 'NEWEST', servers = [] } = req.body;

    const gqlQuery = `
      query ($id: Int) {
        Media(id: $id) {
          id
          title { romaji english native }
          type
          format
          description
          coverImage { large extraLarge }
          bannerImage
          genres
          episodes
          duration
          status
          season
          seasonYear
          averageScore
          popularity
          trending
          startDate { year month day }
          trailer { id site }
          tags { name }
          studios(isMain: true) { nodes { name } }
          isAdult
        }
      }
    `;

    const data = await queryAniList(gqlQuery, { id: parseInt(anilistId) });
    const media = data.Media;

    // Map type
    let contentType = 'ANIME';
    if (media.format === 'MOVIE') contentType = 'MOVIE';

    const content = new Content({
      anilistId: media.id,
      title: {
        english: media.title.english,
        romaji: media.title.romaji,
        native: media.title.native
      },
      type: contentType,
      description: media.description?.replace(/<[^>]*>/g, ''),
      coverImage: media.coverImage?.extraLarge || media.coverImage?.large,
      bannerImage: media.bannerImage,
      genres: media.genres,
      episodes: media.episodes,
      duration: media.duration,
      status: media.status,
      season: media.season,
      seasonYear: media.seasonYear,
      averageScore: media.averageScore,
      popularity: media.popularity,
      trending: media.trending,
      category: category.toUpperCase(),
      servers: servers,
      trailer: media.trailer,
      tags: media.tags?.map(t => t.name) || [],
      studios: media.studios?.nodes?.map(s => s.name) || [],
      isAdult: media.isAdult,
      releaseDate: media.startDate?.year ? 
        new Date(media.startDate.year, (media.startDate.month || 1) - 1, media.startDate.day || 1) : 
        new Date()
    });

    await content.save();

    res.json({
      success: true,
      message: 'Content imported successfully',
      content
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Content already exists in database' 
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all content with filters
app.get('/api/content', async (req, res) => {
  try {
    const { 
      category, 
      type, 
      page = 1, 
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const filter = {};
    if (category) filter.category = category.toUpperCase();
    if (type) filter.type = type.toUpperCase();

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const content = await Content.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Content.countDocuments(filter);

    res.json({
      success: true,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      content
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get content by category
app.get('/api/content/upcoming', async (req, res) => {
  try {
    const content = await Content.find({ category: 'UPCOMING' })
      .sort('-releaseDate')
      .limit(20);
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/content/newest', async (req, res) => {
  try {
    const content = await Content.find({ category: 'NEWEST' })
      .sort('-createdAt')
      .limit(20);
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/content/popular', async (req, res) => {
  try {
    const content = await Content.find({ category: 'POPULAR' })
      .sort('-popularity')
      .limit(20);
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/content/top-rated', async (req, res) => {
  try {
    const content = await Content.find({ category: 'TOP_RATED' })
      .sort('-averageScore')
      .limit(20);
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single content by ID
app.get('/api/content/:id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update content (category, servers, etc.)
app.put('/api/content/:id', async (req, res) => {
  try {
    const { category, servers, type } = req.body;
    
    const updateData = { updatedAt: Date.now() };
    if (category) updateData.category = category.toUpperCase();
    if (servers) updateData.servers = servers;
    if (type) updateData.type = type.toUpperCase();

    const content = await Content.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!content) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    res.json({
      success: true,
      message: 'Content updated successfully',
      content
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete content
app.delete('/api/content/:id', async (req, res) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);
    if (!content) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }
    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add or update server link
app.post('/api/content/:id/servers', async (req, res) => {
  try {
    const { serverName, url, episode = 1, quality = 'HD' } = req.body;

    if (!['server1', 'server2'].includes(serverName)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Server name must be server1 or server2' 
      });
    }

    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    // Check if server already exists for this episode
    const existingServerIndex = content.servers.findIndex(
      s => s.name === serverName && s.episode === episode
    );

    if (existingServerIndex !== -1) {
      content.servers[existingServerIndex].url = url;
      content.servers[existingServerIndex].quality = quality;
    } else {
      content.servers.push({ name: serverName, url, episode, quality });
    }

    content.updatedAt = Date.now();
    await content.save();

    res.json({
      success: true,
      message: 'Server link added/updated successfully',
      content
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk add servers for multiple episodes
app.post('/api/content/:id/servers/bulk', async (req, res) => {
  try {
    const { servers } = req.body;
    
    if (!Array.isArray(servers)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Servers must be an array' 
      });
    }

    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    servers.forEach(server => {
      if (!['server1', 'server2'].includes(server.serverName)) return;
      
      const existingIndex = content.servers.findIndex(
        s => s.name === server.serverName && s.episode === server.episode
      );

      if (existingIndex !== -1) {
        content.servers[existingIndex].url = server.url;
        content.servers[existingIndex].quality = server.quality || 'HD';
      } else {
        content.servers.push({ 
          name: server.serverName, 
          url: server.url, 
          episode: server.episode,
          quality: server.quality || 'HD'
        });
      }
    });

    content.updatedAt = Date.now();
    await content.save();

    res.json({
      success: true,
      message: `${servers.length} server links added/updated successfully`,
      content
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get servers for specific content and episode
app.get('/api/content/:id/servers', async (req, res) => {
  try {
    const { episode = 1 } = req.query;
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    const servers = content.servers.filter(s => s.episode === parseInt(episode));

    res.json({
      success: true,
      episode: parseInt(episode),
      servers
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove server link
app.delete('/api/content/:id/servers/:serverId', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    content.servers = content.servers.filter(
      s => s._id.toString() !== req.params.serverId
    );
    content.updatedAt = Date.now();
    await content.save();

    res.json({
      success: true,
      message: 'Server link removed successfully',
      content
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = {
      total: await Content.countDocuments(),
      byType: {
        anime: await Content.countDocuments({ type: 'ANIME' }),
        movie: await Content.countDocuments({ type: 'MOVIE' }),
        kdrama: await Content.countDocuments({ type: 'KDRAMA' })
      },
      byCategory: {
        upcoming: await Content.countDocuments({ category: 'UPCOMING' }),
        newest: await Content.countDocuments({ category: 'NEWEST' }),
        popular: await Content.countDocuments({ category: 'POPULAR' }),
        topRated: await Content.countDocuments({ category: 'TOP_RATED' })
      }
    };
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'MFlix API is running',
    timestamp: new Date().toISOString()
  });
});

// API Documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'MFlix API',
    version: '1.0.0',
    endpoints: {
      public: {
        newest: 'GET /public/newest',
        popular: 'GET /public/popular',
        topRated: 'GET /public/top-rated',
        upcoming: 'GET /public/upcoming',
        watch: 'GET /public/watch/:id',
        episode: 'GET /public/watch/:id/episode/:episode',
        search: 'GET /public/search?q=query',
        genre: 'GET /public/genre/:genre',
        trending: 'GET /public/trending',
        recent: 'GET /public/recent'
      },
      admin: {
        search: 'GET /api/search?query=name',
        import: 'POST /api/import',
        content: 'GET /api/content',
        stats: 'GET /api/stats'
      }
    }
  });
});

// Serve admin panel at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 MFlix API running on port ${PORT}`);
  console.log(`📡 Public API: http://localhost:${PORT}/public`);
  console.log(`🔐 Admin API: http://localhost:${PORT}/api`);
});

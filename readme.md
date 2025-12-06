# MFlix Public API Documentation

Base URL: `https://mflix-api.onrender.com/api/public`

## 📚 Public Endpoints (For Your Website)

### 1. Get All Anime (Paginated)

Get a list of all anime in your database.

**Endpoint:** `GET /api/public/anime`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Example Request:**
```javascript
fetch('https://your-domain.com/api/public/anime?page=1&limit=20')
  .then(res => res.json())
  .then(data => console.log(data));
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "anilistId": 21,
      "title": {
        "romaji": "One Piece",
        "english": "One Piece",
        "native": "ワンピース"
      },
      "description": "Gol D. Roger was known as the Pirate King...",
      "coverImage": {
        "large": "https://...",
        "medium": "https://..."
      },
      "bannerImage": "https://...",
      "genres": ["Action", "Adventure", "Comedy"],
      "episodes": 1000,
      "averageScore": 87,
      "category": "POPULAR",
      "servers": [
        {
          "name": "server1",
          "url": "https://your-video-url.com/onepiece",
          "quality": "1080p",
          "isActive": true
        },
        {
          "name": "server2",
          "url": "https://backup-url.com/onepiece",
          "quality": "720p",
          "isActive": true
        }
      ]
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

---

### 2. Get Anime by Category

Get anime filtered by category (NEWEST, POPULAR, TOP_RATED, UPCOMING).

**Endpoint:** `GET /api/public/category/:category`

**Categories:**
- `NEWEST` - Recently added anime
- `POPULAR` - Popular anime
- `TOP_RATED` - Highest rated anime
- `UPCOMING` - Upcoming anime

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Example Request:**
```javascript
// Get popular anime
fetch('https://your-domain.com/api/public/category/POPULAR?page=1&limit=10')
  .then(res => res.json())
  .then(data => {
    data.data.forEach(anime => {
      console.log(anime.title.romaji);
    });
  });
```

**Example Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

---

### 3. Get Single Anime (Watch Page)

Get detailed information about a single anime including all episodes with their streaming servers. **Server 1 is set as the default server for each episode.**

**Endpoint:** `GET /api/public/anime/:id`

**Example Request:**
```javascript
fetch('https://your-domain.com/api/public/anime/507f1f77bcf86cd799439011')
  .then(res => res.json())
  .then(data => {
    const anime = data.data;
    
    // Display anime info
    console.log('Title:', anime.title.romaji);
    console.log('Total Episodes:', anime.episodes.length);
    
    // Loop through episodes
    anime.episodes.forEach(episode => {
      console.log(`Episode ${episode.episodeNumber}:`);
      
      // Use default server (server1) for video player
      const videoUrl = episode.defaultServer.url;
      console.log('Default URL:', videoUrl);
      
      // Show all available servers
      episode.servers.forEach(server => {
        console.log(`  ${server.name}: ${server.url} (${server.quality})`);
      });
    });
  });
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "anilistId": 21,
    "title": {
      "romaji": "One Piece",
      "english": "One Piece",
      "native": "ワンピース"
    },
    "description": "Gol D. Roger was known as the Pirate King...",
    "coverImage": {
      "large": "https://...",
      "medium": "https://..."
    },
    "bannerImage": "https://...",
    "genres": ["Action", "Adventure", "Comedy"],
    "tags": ["Pirates", "Shounen", "Super Power"],
    "totalEpisodes": 1000,
    "duration": 24,
    "status": "RELEASING",
    "season": "FALL",
    "seasonYear": 1999,
    "averageScore": 87,
    "popularity": 500000,
    "format": "TV",
    "studios": ["Toei Animation"],
    "category": "POPULAR",
    "episodes": [
      {
        "episodeNumber": 1,
        "servers": [
          {
            "name": "server1",
            "url": "https://your-video-url.com/onepiece/ep1",
            "isActive": true,
            "type": "direct"
          },
          {
            "name": "server2",
            "url": "https://archive.org/embed/one-piece-ep1/video.mp4",
            "isActive": true,
            "type": "embed"
          }
        ],
        "defaultServer": {
          "name": "server1",
          "url": "https://your-video-url.com/onepiece/ep1",
          "isActive": true,
          "type": "direct"
        }
      },
      {
        "episodeNumber": 2,
        "servers": [
          {
            "name": "server1",
            "url": "https://your-video-url.com/onepiece/ep2",
            "quality": "1080p",
            "isActive": true
          },
          {
            "name": "server2",
            "url": "https://backup-url.com/onepiece/ep2",
            "quality": "720p",
            "isActive": true
          }
        ],
        "defaultServer": {
          "name": "server1",
          "url": "https://your-video-url.com/onepiece/ep2",
          "quality": "1080p",
          "isActive": true
        }
      }
    ]
  }
}
```

---

### 4. Search Anime (Your Database Only)

Search anime by title in **YOUR database** (uploaded anime only, not AniList). If the anime is not found, it returns an error message asking the user to contact admin.

**Endpoint:** `GET /api/public/search`

**Query Parameters:**
- `query` (required): Search term
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Example Request:**
```javascript
fetch('https://your-domain.com/api/public/search?query=naruto&page=1&limit=10')
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      data.data.forEach(anime => {
        console.log(anime.title.romaji);
      });
    } else {
      // Anime not found in database
      console.error(data.error);
    }
  });
```

**Success Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

**Not Found Response (404):**
```json
{
  "success": false,
  "error": "\"One Piece\" is not uploaded to our server. Please contact the admin to upload it.",
  "message": "Anime not found in database",
  "query": "One Piece"
}
```

---

## 🎬 Usage Examples for Your Website

### Example 1: Homepage - Display Popular Anime

```javascript
async function loadPopularAnime() {
  const response = await fetch('https://your-domain.com/api/public/category/POPULAR?limit=12');
  const data = await response.json();
  
  const container = document.getElementById('popular-anime');
  data.data.forEach(anime => {
    container.innerHTML += `
      <div class="anime-card">
        <img src="${anime.coverImage.large}" alt="${anime.title.romaji}">
        <h3>${anime.title.romaji}</h3>
        <p>⭐ ${anime.averageScore}/100</p>
        <a href="/watch?id=${anime._id}&episode=1">Watch Now</a>
      </div>
    `;
  });
}
```

### Example 2: Watch Page - Video Player with Episodes (Embed Support)

```javascript
async function loadWatchPage(animeId, episodeNumber = 1) {
  const response = await fetch(`https://your-domain.com/api/public/anime/${animeId}`);
  const { data: anime } = await response.json();
  
  // Find the selected episode
  const episode = anime.episodes.find(ep => ep.episodeNumber === episodeNumber);
  
  if (!episode) {
    console.error('Episode not found');
    return;
  }
  
  // Display anime info
  document.getElementById('anime-title').textContent = anime.title.romaji;
  document.getElementById('anime-description').textContent = anime.description;
  document.getElementById('anime-score').textContent = anime.averageScore;
  document.getElementById('current-episode').textContent = `Episode ${episodeNumber}`;
  
  // Load video player with default server
  loadVideoPlayer(episode.defaultServer);
  
  // Create episode list
  const episodeList = document.getElementById('episode-list');
  anime.episodes.forEach(ep => {
    episodeList.innerHTML += `
      <button 
        class="episode-btn ${ep.episodeNumber === episodeNumber ? 'active' : ''}"
        onclick="loadWatchPage('${animeId}', ${ep.episodeNumber})"
      >
        Episode ${ep.episodeNumber}
      </button>
    `;
  });
  
  // Create server switcher for current episode
  const serverButtons = document.getElementById('server-switcher');
  serverButtons.innerHTML = '';
  episode.servers.forEach((server, index) => {
    serverButtons.innerHTML += `
      <button 
        class="server-btn ${index === 0 ? 'active' : ''}"
        onclick="switchServer(${JSON.stringify(server)})"
      >
        ${server.name.toUpperCase()}
        ${server.type === 'embed' ? '📺' : '🎬'}
      </button>
    `;
  });
}

// Load video player (supports both direct video and iframe embeds)
function loadVideoPlayer(server) {
  const container = document.getElementById('video-container');
  
  if (server.type === 'embed') {
    // Load as iframe embed (for sites like archive.org, etc.)
    container.innerHTML = `
      <iframe 
        src="${server.url}" 
        width="100%" 
        height="500"
        frameborder="0" 
        allowfullscreen
        webkitallowfullscreen="true" 
        mozallowfullscreen="true"
        allow="autoplay; fullscreen; picture-in-picture"
      ></iframe>
    `;
  } else {
    // Load as direct video file
    container.innerHTML = `
      <video id="video-player" width="100%" height="500" controls autoplay>
        <source src="${server.url}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    `;
  }
}

function switchServer(server) {
  loadVideoPlayer(server);
  
  // Update active button
  document.querySelectorAll('.server-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
}

// Load episode 1 by default
loadWatchPage('ANIME_ID_HERE', 1);
```

### Example 3: Search Functionality

```javascript
async function searchAnime(query) {
  try {
    const response = await fetch(`https://your-domain.com/api/public/search?query=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    const results = document.getElementById('search-results');
    results.innerHTML = '';
    
    if (data.success) {
      // Display search results
      data.data.forEach(anime => {
        results.innerHTML += `
          <div class="search-result">
            <img src="${anime.coverImage.medium}" alt="${anime.title.romaji}">
            <div>
              <h4>${anime.title.romaji}</h4>
              <p>${anime.genres.join(', ')}</p>
              <a href="/watch?id=${anime._id}">Watch</a>
            </div>
          </div>
        `;
      });
    } else {
      // Show error message if anime not found
      results.innerHTML = `
        <div class="no-results">
          <h3>Anime Not Found</h3>
          <p>${data.error}</p>
          <button onclick="contactAdmin()">Contact Admin</button>
        </div>
      `;
    }
  } catch (error) {
    console.error('Search error:', error);
  }
}

// Handle search input
document.getElementById('search-input').addEventListener('input', (e) => {
  const query = e.target.value;
  if (query.length > 2) {
    searchAnime(query);
  }
});
```

### Example 4: Categories Page

```javascript
async function loadByCategory(category) {
  const response = await fetch(`https://your-domain.com/api/public/category/${category}?limit=20`);
  const data = await response.json();
  
  displayAnimeGrid(data.data);
  setupPagination(data.pagination);
}

// Load different sections
loadByCategory('NEWEST');   // For "Recently Added" section
loadByCategory('POPULAR');  // For "Most Popular" section
loadByCategory('TOP_RATED'); // For "Top Rated" section
```

---

## 📝 Notes

1. **Server Priority**: Server 1 is always the default. Server 2 is backup.
2. **Embed Support**: Both servers support:
   - Direct video URLs (`.mp4`, `.m3u8`, etc.)
   - Iframe embeds (archive.org, Google Drive, etc.)
   - The API automatically detects embed type
3. **How to add embeds**: In admin panel, paste either:
   - Direct URL: `https://example.com/video.mp4`
   - Full iframe tag: `<iframe src="https://archive.org/embed/video.mp4"></iframe>`
   - Just the embed URL: `https://archive.org/embed/video.mp4`
4. **All endpoints return JSON** with a `success` boolean field.
5. **Error responses** include an `error` message field.
6. **Pagination** is included in list endpoints for easier navigation.
7. **CORS is enabled** so you can call from any domain.

## 🎥 Supported Video Sources

### Direct Video URLs:
- MP4 files: `https://example.com/video.mp4`
- HLS streams: `https://example.com/playlist.m3u8`
- Any direct video link

### Embed/Iframe Links:
- Archive.org: `<iframe src="https://archive.org/embed/..."></iframe>`
- Google Drive embeds
- Streamtape, Doodstream, etc.
- Any iframe-based video player

The admin panel automatically detects if you paste an iframe and extracts the embed URL!

---

## 🔒 Admin Endpoints (Private)

These endpoints are for the admin panel only:

- `GET /api/search` - **Search AniList** (to find anime to add, NOT your database)
- `POST /api/anime` - Add anime to your database
- `PUT /api/anime/:id` - Update anime
- `DELETE /api/anime/:id` - Delete anime

**Important:** 
- `/api/search` searches AniList to find anime to add (admin only)
- `/api/public/search` searches YOUR database (for your website users)

Do not use admin endpoints in your public website.

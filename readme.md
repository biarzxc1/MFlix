# KissKH API Proxy

A Node.js Express API proxy for KissKH drama streaming service with CORS support, optimized for Render deployment.

## 🚀 Features

- ✅ Full CORS support for cross-origin requests
- ✅ Clean, filtered JSON responses
- ✅ Video streaming with HLS support
- ✅ Multi-language subtitle support
- ✅ Comprehensive drama database endpoints
- ✅ Production-ready error handling

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd kisskh-api-proxy

# Install dependencies
npm install

# Run locally
npm start

# Run in development mode with auto-reload
npm run dev
```

## 🌐 Deployment (Render)

1. Push your code to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Connect your GitHub repository
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Deploy!

Your API will be live at: `https://your-app-name.onrender.com`

## 📡 API Endpoints

### Content Discovery

#### 1. Hero Section Shows
```
GET /api/DramaList/Show
```
Returns featured shows for hero banners/carousels.

**Response:**
```json
[
  {
    "id": 10741,
    "title": "Ang Mutya ng Section E 2",
    "thumbnail": "https://image-v1.pages.dev/..."
  }
]
```

---

#### 2. Top Rated Shows
```
GET /api/DramaList/TopRating?ispc=true
```
Returns highest-rated shows and movies.

**Response:**
```json
[
  {
    "id": 11999,
    "title": "Troll 2",
    "thumbnail": "https://media.themoviedb.org/...",
    "episodesCount": 1,
    "label": null,
    "favoriteID": 0
  }
]
```

---

#### 3. Most Viewed Shows
```
GET /api/DramaList/MostView?ispc=true&c=1
```

**Categories:**
- `c=1` - **Top SI Drama** (Most viewed category 1)
- `c=2` - **Top K-Drama** (Most viewed Korean dramas)

**Response:**
```json
[
  {
    "id": 975,
    "title": "True Beauty",
    "thumbnail": "https://prod-images.viu.com/...",
    "episodesCount": 16,
    "label": "",
    "favoriteID": 0
  }
]
```

**Usage Examples:**
```javascript
// Get Top SI Drama
fetch('/api/DramaList/MostView?ispc=true&c=1')

// Get Top K-Drama  
fetch('/api/DramaList/MostView?ispc=true&c=2')
```

---

#### 4. Most Searched Shows
```
GET /api/DramaList/MostSearch?ispc=false
```
Returns trending/popular search queries.

---

#### 5. Last Updated Shows
```
GET /api/DramaList/LastUpdate?ispc=true
```
Returns shows with recently added episodes.

---

#### 6. Upcoming Dramas
```
GET /api/DramaList/Upcoming?ispc=true
```
Returns upcoming/coming soon shows.

**Note:** Shows with `episodesCount: 0` haven't been released yet.

---

#### 7. Anime List
```
GET /api/DramaList/Animate?ispc=true
```
Returns anime shows.

---

#### 8. Search Shows
```
GET /api/DramaList/Search?q=spirit&type=0
```

**Parameters:**
- `q` - Search query (e.g., "spirit", "love", "demon")
- `type` - Content type (0 = all types)

**Example:**
```javascript
// Search for "love"
fetch('/api/DramaList/Search?q=love&type=0')
```

---

### Drama Details & Playback

#### 9. Drama Details
```
GET /api/DramaList/Drama/:id?isq=true
```

Returns complete information about a specific drama including episodes list.

**Response:**
```json
{
  "id": 11602,
  "title": "Spirit Fingers",
  "thumbnail": "https://image-v1.pages.dev/...",
  "description": "What do you do if you're going on 18...",
  "releaseDate": "2025-09-26T21:05:00",
  "country": "South Korea",
  "status": "Ongoing",
  "type": "TVSeries",
  "episodesCount": 12,
  "episodes": [
    {
      "id": 198706,
      "number": 12.0,
      "sub": 5
    }
  ]
}
```

**Important Fields:**
- `episodes[].id` - **Episode ID** (use this for video streaming, NOT drama ID)
- `episodes[].number` - Episode number
- `episodes[].sub` - Number of subtitle languages available

---

#### 10. Get Subtitles
```
GET /api/Sub/:episodeId?kkey=KEY
```

Returns subtitle tracks for a specific episode.

**Parameters:**
- `episodeId` - Episode ID from drama details
- `kkey` - Encryption key (required)

**Response:**
```json
[
  {
    "src": "https://sub.streamsub.top/Spirit-Fingers.2025.Ep1.en.srt.txt1",
    "label": "English",
    "language": "en",
    "default": true
  },
  {
    "src": "https://sub.streamsub.top/Spirit-Fingers.2025.Ep1.id.srt.txt1",
    "label": "Indonesia",
    "language": "id",
    "default": false
  }
]
```

**Available Languages:**
- English (en)
- Indonesia (id)
- Malay (ms)
- Arabic (ar)
- Khmer (km)
- Tagalog (fil)

---

#### 11. Video Stream URL
```
GET /api/Video/:episodeId/:episodeNumber
```

**⚠️ IMPORTANT:** Use the **Episode ID** from the drama details episodes array, **NOT the Drama ID**!

**Parameters:**
- `episodeId` - Episode ID from `/api/DramaList/Drama/:id` response
- `episodeNumber` - Episode number (e.g., 1, 2, 3)

**Response:**
```json
{
  "episodeId": "196588",
  "episodeNumber": "1",
  "streamUrl": "https://hls.cdnvideo11.shop/hls07/196588/Ep1_index.m3u8",
  "type": "hls"
}
```

**Stream Format:** HLS (HTTP Live Streaming)

---

## 🎬 Complete Video Player Integration Example

Here's how to build a complete video player with subtitles:

```javascript
// Step 1: Get drama details
const dramaId = 11602; // Spirit Fingers
const dramaResponse = await fetch(`/api/DramaList/Drama/${dramaId}?isq=true`);
const dramaData = await dramaResponse.json();

console.log(dramaData.title); // "Spirit Fingers"
console.log(dramaData.episodes); // Array of episodes

// Step 2: Select an episode (e.g., Episode 1)
const episode = dramaData.episodes.find(ep => ep.number === 1.0);
console.log(episode.id); // 196588 (THIS IS THE EPISODE ID, NOT DRAMA ID!)

// Step 3: Get video stream URL using EPISODE ID
const videoResponse = await fetch(`/api/Video/${episode.id}/${episode.number}`);
const videoData = await videoResponse.json();

console.log(videoData.streamUrl); 
// "https://hls.cdnvideo11.shop/hls07/196588/Ep1_index.m3u8"

// Step 4: Get subtitles (you'll need the kkey from the original site)
const kkey = 'YOUR_KKEY_HERE';
const subsResponse = await fetch(`/api/Sub/${episode.id}?kkey=${kkey}`);
const subtitles = await subsResponse.json();

// Step 5: Initialize video player (using video.js, hls.js, or Plyr)
const player = videojs('my-video', {
  sources: [{
    src: videoData.streamUrl,
    type: 'application/x-mpegURL' // HLS format
  }]
});

// Add subtitles
subtitles.forEach(subtitle => {
  player.addRemoteTextTrack({
    kind: 'subtitles',
    src: subtitle.src,
    srclang: subtitle.language,
    label: subtitle.label,
    default: subtitle.default
  });
});
```

### Using with Different Video Players

#### Video.js (Recommended)
```html
<link href="https://vjs.zencdn.net/8.10.0/video-js.css" rel="stylesheet" />
<script src="https://vjs.zencdn.net/8.10.0/video.min.js"></script>

<video id="my-video" class="video-js" controls preload="auto" width="640" height="360">
  <source src="YOUR_STREAM_URL" type="application/x-mpegURL">
</video>

<script>
  const player = videojs('my-video');
</script>
```

#### HLS.js
```javascript
import Hls from 'hls.js';

if (Hls.isSupported()) {
  const video = document.getElementById('video');
  const hls = new Hls();
  hls.loadSource(streamUrl);
  hls.attachMedia(video);
}
```

#### Plyr
```javascript
import Plyr from 'plyr';

const player = new Plyr('#player', {
  sources: [{
    src: streamUrl,
    type: 'video'
  }]
});
```

---

## 🔑 Understanding Key Concepts

### Episode ID vs Drama ID

**⚠️ CRITICAL:** Always use Episode ID for video streaming, not Drama ID!

```javascript
// ❌ WRONG - Using Drama ID
fetch('/api/Video/11602/1') // This won't work!

// ✅ CORRECT - Using Episode ID
const drama = await fetch('/api/DramaList/Drama/11602?isq=true').then(r => r.json());
const episodeId = drama.episodes[0].id; // 196588
fetch(`/api/Video/${episodeId}/1`) // This works!
```

### Most View Categories Explained

The `/api/DramaList/MostView` endpoint has two categories:

| Parameter | Category | Description |
|-----------|----------|-------------|
| `c=1` | **Top SI Drama** | Most viewed shows in category 1 |
| `c=2` | **Top K-Drama** | Most viewed Korean dramas |

```javascript
// Get Top SI Drama (Category 1)
fetch('/api/DramaList/MostView?ispc=true&c=1')
  .then(res => res.json())
  .then(data => console.log('Top SI Drama:', data));

// Get Top K-Drama (Category 2)
fetch('/api/DramaList/MostView?ispc=true&c=2')
  .then(res => res.json())
  .then(data => console.log('Top K-Drama:', data));
```

---

## 🛠️ Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Failed to fetch data",
  "message": "Request timeout"
}
```

**Common Error Codes:**
- `400` - Bad Request (missing required parameters)
- `404` - Not Found (invalid endpoint)
- `500` - Internal Server Error
- `504` - Gateway Timeout (upstream server timeout)

---

## 📊 Response Structure Summary

### List Endpoints (Show, TopRating, MostView, etc.)
Returns array with:
- `id` - Show identifier
- `title` - Show name
- `thumbnail` - Image URL
- `episodesCount` - Number of episodes
- `label` - Special label
- `favoriteID` - Favorite status

### Detail Endpoint (Drama/:id)
Returns object with:
- Basic info (id, title, thumbnail, description, etc.)
- `episodes` array with episode IDs

### Subtitle Endpoint (Sub/:id)
Returns array of subtitle tracks

### Video Endpoint (Video/:id/:num)
Returns HLS stream URL

---

## 🔒 Health Check

```
GET /health
```

Returns server status:
```json
{
  "status": "ok",
  "timestamp": "2025-12-02T10:00:00.000Z"
}
```

---

## 📝 Notes

1. **Always use Episode ID** (not Drama ID) for video streaming
2. **kkey parameter** is required for subtitle endpoints
3. **HLS streaming** requires compatible video player (video.js, hls.js, Plyr)
4. **CORS** is enabled for all origins
5. **Rate limiting** may apply on the upstream server

---

## 🤝 Contributing

Feel free to submit issues and pull requests!

## 📄 License

MIT License

---

## 🔗 Links

- [Video.js Documentation](https://videojs.com/)
- [HLS.js Documentation](https://github.com/video-dev/hls.js/)
- [Plyr Documentation](https://plyr.io/)
- [Render Deployment Guide](https://render.com/docs)

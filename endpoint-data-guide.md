# KissKH API Endpoints - Data Reference

## 1. Hero Section Shows
**Endpoint:** `GET /api/DramaList/Show`

**Returns:** Array of shows for hero/banner section
```json
[
  {
    "id": 10741,
    "title": "Ang Mutya ng Section E 2",
    "thumbnail": "https://image-v1.pages.dev/f83b88be-f5a8-48c6-8280-765fa2c8e955.jpg"
  }
]
```

**Fields:**
- `id` - Unique show identifier
- `title` - Show name
- `thumbnail` - Image URL for banner

---

## 2. Top Rated Shows
**Endpoint:** `GET /api/DramaList/TopRating?ispc=true`

**Returns:** Array of highest rated shows
```json
[
  {
    "id": 11999,
    "title": "Troll 2",
    "thumbnail": "https://media.themoviedb.org/t/p/w1000_and_h563_face/3pQ8xldcSuVFMvZm5Ai4GHIXhX0.jpg",
    "episodesCount": 1,
    "label": null,
    "favoriteID": 0
  }
]
```

**Fields:**
- `id` - Unique show identifier
- `title` - Show name
- `thumbnail` - Image URL
- `episodesCount` - Number of episodes
- `label` - Special label (null or text like "Special Ep")
- `favoriteID` - Favorite status (0 = not favorited)

---

## 3. Most Viewed Shows
**Endpoint:** `GET /api/DramaList/MostView?ispc=true&c=1`

**Parameters:**
- `c=1` - Category 1 (K-Dramas)
- `c=2` - Category 2 (Other content)

**Returns:** Array of most watched shows
```json
[
  {
    "id": 975,
    "title": "True Beauty",
    "thumbnail": "https://prod-images.viu.com/3659420014/f7d86cfe0584f4a1e6c933f9c903b0493179f10e",
    "episodesCount": 16,
    "label": "",
    "favoriteID": 0
  }
]
```

**Fields:** Same as Top Rated Shows

---

## 4. Most Searched Shows
**Endpoint:** `GET /api/DramaList/MostSearch?ispc=false`

**Returns:** Array of trending/popular searches
```json
[
  {
    "id": 9987,
    "title": "Ang Mutya ng Section E",
    "thumbnail": "https://image-v1.pages.dev/075de604-9e3d-43c0-b523-33f24640de12.png",
    "episodesCount": 19,
    "label": "",
    "favoriteID": 0
  }
]
```

**Fields:** Same as Top Rated Shows

---

## 5. Last Updated Shows
**Endpoint:** `GET /api/DramaList/LastUpdate?ispc=true`

**Returns:** Array of recently updated shows with new episodes
```json
[
  {
    "id": 10180,
    "title": "Love and Crown",
    "thumbnail": "https://image-v1.pages.dev/76144d97-9c89-4b88-864a-2bc834f74fc9.jpg",
    "episodesCount": 32,
    "label": "",
    "favoriteID": 0
  }
]
```

**Fields:** Same as Top Rated Shows

---

## 6. Upcoming Dramas
**Endpoint:** `GET /api/DramaList/Upcoming?ispc=true`

**Returns:** Array of upcoming/coming soon shows
```json
[
  {
    "id": 12001,
    "title": "Love upon a Time",
    "thumbnail": "https://image-v1.pages.dev/0d4190a7-75b0-43d9-b033-e017648862f9.jpg",
    "episodesCount": 0,
    "label": " Coming Soon",
    "favoriteID": 0
  }
]
```

**Fields:** Same as Top Rated Shows
**Note:** `episodesCount` is 0 for unreleased shows

---

## 7. Anime List
**Endpoint:** `GET /api/DramaList/Animate?ispc=true`

**Returns:** Array of anime shows
```json
[
  {
    "id": 4529,
    "title": "Swallowed Star Season 2+3+4",
    "thumbnail": "https://puui.wetvinfo.com/wetv/cms/6945_1696415708_19201080.jpeg",
    "episodesCount": 174,
    "label": "",
    "favoriteID": 0
  }
]
```

**Fields:** Same as Top Rated Shows

---

## 8. Search Shows
**Endpoint:** `GET /api/DramaList/Search?q=spirit&type=0`

**Parameters:**
- `q` - Search query (e.g., "spirit", "love")
- `type` - Content type (0 = all types)

**Returns:** Array of matching shows
```json
[
  {
    "id": 11602,
    "title": "Spirit Fingers",
    "thumbnail": "https://image-v1.pages.dev/2e1e1488-bba5-4af2-bebb-c8fb76af6f56.jpg",
    "episodesCount": 12,
    "label": "",
    "favoriteID": 0
  }
]
```

**Fields:** Same as Top Rated Shows

---

## 9. Drama Details
**Endpoint:** `GET /api/DramaList/Drama/:id?isq=true`

**Example:** `/api/DramaList/Drama/11602?isq=true`

**Returns:** Detailed information about a specific show
```json
{
  "id": 11602,
  "title": "Spirit Fingers",
  "thumbnail": "https://image-v1.pages.dev/2e1e1488-bba5-4af2-bebb-c8fb76af6f56.jpg",
  "description": "What do you do if you're going on 18, totally awkward...",
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

**Fields:**
- `id` - Show identifier
- `title` - Show name
- `thumbnail` - Image URL
- `description` - Full synopsis
- `releaseDate` - Release date/time
- `country` - Country of origin
- `status` - "Ongoing" or "Completed"
- `type` - "TVSeries" or "Movie"
- `episodesCount` - Total episodes
- `episodes` - Array of episode objects:
  - `id` - Episode identifier (use for subtitles)
  - `number` - Episode number
  - `sub` - Number of subtitle languages

---

## 10. Subtitles
**Endpoint:** `GET /api/Sub/:episodeId?kkey=KEY`

**Example:** `/api/Sub/196588?kkey=E0CF264F...`

**Returns:** Array of subtitle tracks
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

**Fields:**
- `src` - Subtitle file URL
- `label` - Display name (e.g., "English")
- `language` - Language code (e.g., "en", "id")
- `default` - Whether this is the default subtitle

**Available Languages:**
- English (en)
- Indonesia (id)
- Malay (ms)
- Arabic (ar)
- Khmer (km)
- Tagalog (fil)

---

## 11. Video Stream
**Endpoint:** `GET /api/Video/:dramaId/:episodeNumber`

**Example:** `/api/Video/11602/1`

**Returns:** Video streaming information
```json
{
  "dramaId": "11602",
  "episodeNumber": "1",
  "streamUrl": "https://hls.cdnvideo11.shop/hls07/11602/Ep1_index.m3u8",
  "type": "hls"
}
```

**Fields:**
- `dramaId` - Show identifier
- `episodeNumber` - Episode number
- `streamUrl` - HLS stream URL (use in video player)
- `type` - Stream type (always "hls")

---

## Summary Table

| Endpoint | Key Data Returned | Use Case |
|----------|------------------|----------|
| Show | id, title, thumbnail | Hero banners |
| TopRating | id, title, thumbnail, episodesCount, label | Top rated section |
| MostView | id, title, thumbnail, episodesCount, label | Most watched section |
| MostSearch | id, title, thumbnail, episodesCount, label | Trending searches |
| LastUpdate | id, title, thumbnail, episodesCount, label | Recently updated |
| Upcoming | id, title, thumbnail, episodesCount, label | Coming soon |
| Animate | id, title, thumbnail, episodesCount, label | Anime section |
| Search | id, title, thumbnail, episodesCount, label | Search results |
| Drama/:id | Full details + episodes array | Detail/watch page |
| Sub/:id | Subtitle tracks with URLs | Video player subtitles |
| Video/:id/:ep | HLS stream URL | Video player source |
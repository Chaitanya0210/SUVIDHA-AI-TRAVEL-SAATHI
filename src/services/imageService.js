// -----------------------------------------------------------------------------
// Real Location Image Fetcher Service (src/services/imageService.js)
// -----------------------------------------------------------------------------
const http = require('http');
const https = require('https');

// Fallback high-resolution location cover gallery for Indian travel destinations
const FALLBACK_LOCATION_IMAGES = {
  nanded: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80",
  gurudwara: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80",
  hazur: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80",
  amritsar: "https://images.unsplash.com/photo-1588096344356-9b48c3b28b6d?auto=format&fit=crop&w=800&q=80",
  golden: "https://images.unsplash.com/photo-1588096344356-9b48c3b28b6d?auto=format&fit=crop&w=800&q=80",
  manali: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
  goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
  jaipur: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80",
  varanasi: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
  kashi: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
  kerala: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
  rishikesh: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80",
  ujjain: "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=800&q=80",
  ayodhya: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
  shimla: "https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=800&q=80"
};

/**
 * Fetches real location image from Wikipedia / Wikimedia Commons API
 */
const fetchWikimediaImage = (queryTerm) => {
  return new Promise((resolve) => {
    const cleanQuery = encodeURIComponent(queryTerm.trim());
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${cleanQuery}&prop=pageimages&format=json&pithumbsize=800`;

    const req = https.get(apiUrl, { headers: { 'User-Agent': 'SuvidhaTravelSaathi/1.0' } }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          const pages = json.query?.pages;
          if (pages) {
            const pageId = Object.keys(pages)[0];
            const sourceUrl = pages[pageId]?.thumbnail?.source;
            if (sourceUrl) return resolve(sourceUrl);
          }
          resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.setTimeout(2500, () => {
      req.destroy();
      resolve(null);
    });
  });
};

/**
 * Resolves a real photo for any location / landmark name
 */
const fetchRealLocationImage = async (locationName, destName = '') => {
  if (!locationName) return FALLBACK_LOCATION_IMAGES.nanded;

  const searchQuery = `${locationName} ${destName}`.trim();

  // 1. Try Wikimedia Commons API for real landmark photo
  const wikiImage = await fetchWikimediaImage(locationName);
  if (wikiImage) return wikiImage;

  const wikiSearchImage = await fetchWikimediaImage(searchQuery);
  if (wikiSearchImage) return wikiSearchImage;

  // 2. Check matched keywords in FALLBACK_LOCATION_IMAGES
  const lower = searchQuery.toLowerCase();
  for (const key of Object.keys(FALLBACK_LOCATION_IMAGES)) {
    if (lower.includes(key)) {
      return FALLBACK_LOCATION_IMAGES[key];
    }
  }

  // 3. Unsplash Dynamic Real Image URL Fallback
  return `https://source.unsplash.com/800x500/?${encodeURIComponent(searchQuery)},india`;
};

module.exports = {
  fetchRealLocationImage,
  FALLBACK_LOCATION_IMAGES
};

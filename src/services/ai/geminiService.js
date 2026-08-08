// -----------------------------------------------------------------------------
// Gemini AI Service & Itinerary Generator (src/services/ai/geminiService.js)
// -----------------------------------------------------------------------------
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/env');
const { validateItineraryOutput } = require('./itineraryValidator');
const { optimizeRouteSequence } = require('../maps/routingService');
const { getLandmarksForDestination } = require('../../utils/indianLandmarks');
const { fetchRealLocationImage } = require('../imageService');

/**
 * Attaches geocoded activity stops, real location image, and route metrics to an itinerary day
 */
const attachGeospatialRouteToDay = async (dayItem, destCoords, attractionsList = [], dayIndex = 1, destName = '') => {
  const baseLat = destCoords.lat || 25.3176;
  const baseLng = destCoords.lng || 82.9739;

  const offsets = [
    { dLat: 0.0000, dLng: 0.0000 },
    { dLat: 0.0150, dLng: 0.0120 },
    { dLat: -0.0120, dLng: 0.0180 },
    { dLat: 0.0080, dLng: -0.0150 },
    { dLat: -0.0180, dLng: -0.0100 }
  ];

  const morningActivity = Array.isArray(dayItem.morning) ? dayItem.morning[0] : (dayItem.morning || '');
  const realDayImage = await fetchRealLocationImage(morningActivity || dayItem.title || destName, destName);

  const rawStops = [
    {
      name: dayItem.stayRecommendation || `Hotel / Homestay Stay`,
      category: 'Hotel',
      lat: parseFloat((baseLat + offsets[0].dLat).toFixed(4)),
      lng: parseFloat((baseLng + offsets[0].dLng).toFixed(4)),
      estimatedDurationMinutes: 30
    },
    {
      name: Array.isArray(dayItem.morning) ? dayItem.morning[0] : (dayItem.morning || 'Morning Sightseeing'),
      category: 'Attraction',
      lat: parseFloat((baseLat + offsets[1].dLat).toFixed(4)),
      lng: parseFloat((baseLng + offsets[1].dLng).toFixed(4)),
      estimatedDurationMinutes: 90
    },
    {
      name: Array.isArray(dayItem.afternoon) ? dayItem.afternoon[0] : (dayItem.afternoon || 'Local Dhaba Lunch'),
      category: 'Restaurant',
      lat: parseFloat((baseLat + offsets[2].dLat).toFixed(4)),
      lng: parseFloat((baseLng + offsets[2].dLng).toFixed(4)),
      estimatedDurationMinutes: 60
    },
    {
      name: Array.isArray(dayItem.evening) ? dayItem.evening[0] : (dayItem.evening || 'Evening Aarti & Market Walk'),
      category: 'Sunset Point',
      lat: parseFloat((baseLat + offsets[3].dLat).toFixed(4)),
      lng: parseFloat((baseLng + offsets[3].dLng).toFixed(4)),
      estimatedDurationMinutes: 75
    }
  ];

  const routeData = optimizeRouteSequence(rawStops);

  return {
    ...dayItem,
    imageUrl: realDayImage || dayItem.imageUrl,
    routeMetrics: {
      totalDistanceKm: routeData.totalDistanceKm,
      estimatedTravelTimeMins: routeData.estimatedTravelTimeMins,
      estimatedTransportCostInr: routeData.estimatedTransportCostInr
    },
    stops: routeData.orderedStops
  };
};

/**
 * Generates AI travel suggestions matching Madhusudan6114's repo structure
 */
const generateAiTravelSuggestions = async (userPreferences) => {
  const { vibes = ['Adventure'], budgetLevel = 'Standard', duration = 3, group = 'Solo' } = userPreferences;
  const apiKey = config.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are SUVIDHA AI Travel Saathi. Suggest 5 personalized Indian travel destination recommendations based on these preferences:
- Travel Vibe/Style: ${vibes.join(', ')}
- Budget Level: ${budgetLevel}
- Ideal Duration: ${duration} days
- Group Type: ${group}

Return PURE VALID JSON with NO code fences outside:
{
  "suggestions": [
    {
      "destination": "Destination Name",
      "country": "India",
      "stateOrRegion": "State Name",
      "category": "Beach/Mountain/Spiritual/Heritage",
      "imageUrl": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800",
      "estimatedBudget": {
        "min": 6000,
        "max": 15000,
        "currency": "INR"
      },
      "bestTimeToVisit": "October to March",
      "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
      "whyRecommended": "Specific reason why this fits the user's travel style",
      "estimatedDuration": "${duration} days",
      "difficultyLevel": "easy",
      "uniqueExperiences": ["Unique Experience 1", "Unique Experience 2"]
    }
  ],
  "personalizedTips": [
    "Useful budget optimization tip",
    "Local cultural tip"
  ]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn('⚠️ AI Travel Suggestions generation error:', e.message);
    }
  }

  // Fallback AI suggestions matching the structure
  return {
    suggestions: [
      {
        destination: "Manali",
        country: "India",
        stateOrRegion: "Himachal Pradesh",
        category: "Mountain",
        imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
        estimatedBudget: { min: 8000, max: 18000, currency: "INR" },
        bestTimeToVisit: "October to June",
        highlights: ["Solang Valley Paragliding", "Hadimba Temple", "Atal Tunnel Expedition"],
        whyRecommended: "Perfect for mountain adventures, snow views, and cafe exploration.",
        estimatedDuration: `${duration} days`,
        difficultyLevel: "moderate",
        uniqueExperiences: ["Igloo stay in winter", "Riverside trout dining in Old Manali"]
      },
      {
        destination: "Goa",
        country: "India",
        stateOrRegion: "Goa",
        category: "Beach",
        imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
        estimatedBudget: { min: 10000, max: 22000, currency: "INR" },
        bestTimeToVisit: "November to February",
        highlights: ["Baga & Palolem Beaches", "Dudhsagar Waterfalls", "Fontainhas Latin Heritage Walk"],
        whyRecommended: "Ideal for sun-kissed beaches, coastal cuisine, and relaxation.",
        estimatedDuration: `${duration} days`,
        difficultyLevel: "easy",
        uniqueExperiences: ["Scuba diving at Grand Island", "Sunset cruise on Mandovi River"]
      }
    ],
    personalizedTips: [
      "Book IRCTC train tickets 60 days in advance for lower transit costs.",
      "Carry local cash for dhaba meals and street craft markets."
    ]
  };
};

/**
 * Dynamic Activity Templates for Fallback Itinerary Generator
 */
const getActivityTemplatesForDestination = (category, vibe, destName, attraction, secondaryAttraction) => {
  const cat = `${category || ''} ${vibe || ''}`.toLowerCase();

  if (cat.includes('beach') || cat.includes('coastal')) {
    return {
      morning: [`Morning visit & water sports at ${attraction}`, `Beachcombing & coastal relaxation in ${destName}`],
      afternoon: [`Seafood & local thali lunch at beachside shack`, `Relaxed afternoon visit to ${secondaryAttraction}`],
      evening: [`Scenic sunset view at ${destName} beach & coastal promenade`, `Night market stroll & evening local seafood dinner`]
    };
  }

  if (cat.includes('mountain') || cat.includes('hill') || cat.includes('trek')) {
    return {
      morning: [`Morning nature trail & excursion to ${attraction}`, `Panoramas & mountain viewpoint exploration in ${destName}`],
      afternoon: [`Authentic Himachali / Mountain Dhaba lunch`, `Stroll through ${secondaryAttraction} & local craft market`],
      evening: [`Sunset view over snow peaks / pine valleys`, `Cozy bonfire / cafe dinner in ${destName}`]
    };
  }

  if (cat.includes('heritage') || cat.includes('fort') || cat.includes('palace')) {
    return {
      morning: [`Morning heritage tour & exploration of ${attraction}`, `Marvel at ancient architecture & royal palaces in ${destName}`],
      afternoon: [`Traditional Thali lunch at local heritage restaurant`, `Afternoon visit to ${secondaryAttraction}`],
      evening: [`Sunset viewpoint at hilltop fort / lake`, `Evening shopping at handicraft bazaar & traditional dinner`]
    };
  }

  if (cat.includes('spiritual') || cat.includes('teerth') || destName.toLowerCase().includes('nanded') || destName.toLowerCase().includes('varanasi') || destName.toLowerCase().includes('amritsar')) {
    const eveningGhat = destName.toLowerCase().includes('nanded') ? 'Godavari Ghat' : (destName.toLowerCase().includes('varanasi') ? 'Dashashwamedh Ghat' : (destName.toLowerCase().includes('amritsar') ? 'Golden Temple Parikrama' : 'Sacred River Ghat'));
    return {
      morning: [`Holy Darshan & morning prayers at ${attraction}`, `Explore surrounding sacred complexes & heritage premises in ${destName}`],
      afternoon: [`Authentic local Prasad / Dhaba lunch`, `Peaceful afternoon visit to ${secondaryAttraction}`],
      evening: [`Evening Aarti & sunset view at ${eveningGhat}`, `Dinner at recommended local food trail spot in ${destName}`]
    };
  }

  // Default General Explorer Template
  return {
    morning: [`Morning visit to ${attraction}`, `Explore top local sight and surrounding viewpoints in ${destName}`],
    afternoon: [`Enjoy authentic local lunch at popular Dhaba/Thali spot`, `Relaxed afternoon exploration of ${secondaryAttraction}`],
    evening: [`Sunset view & evening city walk in ${destName}`, `Dinner at recommended local food trail spot`]
  };
};

/**
 * Generates an AI-powered structured travel itinerary with geospatial route optimization & real location images
 */
const generateStructuredAiItinerary = async ({ userPreferences, candidateDestination }) => {
  const {
    duration = 3,
    budgetLevel = 'Standard',
    group = 'Solo',
    vibes = ['Spiritual']
  } = userPreferences;

  const destName = candidateDestination.name || candidateDestination.destinationName || 'Nanded';
  const apiKey = config.GEMINI_API_KEY;

  // Resolve landmarks knowledge base for destination
  const landmarkInfo = getLandmarksForDestination(destName);
  const attractions = candidateDestination.topAttractions || (landmarkInfo ? landmarkInfo.topAttractions : null) || [`Famous ${destName} Landmark`, `Heritage Site in ${destName}`, `Local Market in ${destName}`];
  const destCoords = candidateDestination.coordinates || (landmarkInfo ? landmarkInfo.coordinates : { lat: 19.1383, lng: 77.3210 });
  const coverImage = candidateDestination.imageUrl || (landmarkInfo ? landmarkInfo.imageUrl : await fetchRealLocationImage(destName));

  let itineraryPlan = null;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are SUVIDHA AI Travel Saathi, an expert Indian travel planner. 
Generate a structured ${duration}-day trip itinerary for "${destName}" (${candidateDestination.stateOrRegion || 'India'}) for a ${group} group with a ${budgetLevel} budget seeking a ${vibes.join(', ')} experience.

CRITICAL INSTRUCTION FOR LANDMARKS & ATTRACTIONS:
You MUST include the exact real-world iconic, historical, and religious landmarks of "${destName}".
Target Known Landmarks for ${destName}: ${attractions.join(', ')}.
For example, if destination is Nanded, you MUST explicitly include Takht Sachkhand Sri Hazur Abchalnagar Sahib Gurudwara & Gurudwara Shikar Ghat Sahib in the morning/afternoon schedule! If destination is Goa, include Baga Beach & Dudhsagar Waterfalls! If destination is Manali, include Solang Valley & Hadimba Temple!
Do NOT write generic placeholders like "City Center" or "Local Sightseeing". Name exact real-world monuments, temples, gurudwaras, forts, or beaches!

INSTRUCTIONS:
1. Respect the target duration (${duration} days), group type (${group}), and budget level (${budgetLevel}).
2. Return STRICTLY PURE VALID JSON with NO markdown formatting, no code blocks, and no extra text outside the JSON object.

JSON SCHEMA REQUIREMENT:
{
  "destination": "${destName}",
  "imageUrl": "${coverImage}",
  "summary": "A concise 2-sentence summary highlighting why ${destName} was selected and its famous landmarks.",
  "matchReasoning": "Detailed explanation of how this trip satisfies the user's ${vibes.join(', ')} preferences.",
  "estimatedCost": {
    "accommodation": 6000,
    "transportation": 3500,
    "food": 4000,
    "activities": 2500,
    "miscellaneous": 1000,
    "total": 17000
  },
  "days": [
    {
      "day": 1,
      "title": "Day 1 Theme Title with exact landmark name",
      "imageUrl": "${coverImage}",
      "morning": ["Morning visit to famous landmark in ${destName}"],
      "afternoon": ["Afternoon activity & local lunch recommendation"],
      "evening": ["Evening sightseeing or Aarti/Market walk"],
      "stayRecommendation": "Recommended hotel/guesthouse/yatri niwas type",
      "foodSpot": "Recommended local Dhaba or Guru Ka Langar spot"
    }
  ],
  "travelTips": [
    "Useful local travel tip 1"
  ]
}`;

      const apiPromise = model.generateContent(prompt);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out after 10000ms')), 10000)
      );

      const result = await Promise.race([apiPromise, timeoutPromise]);
      const textResponse = result.response.text();

      const cleanedJsonText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanedJsonText);

      const validation = validateItineraryOutput(parsedData, duration, destName);
      if (validation.isValid) {
        itineraryPlan = validation.sanitized;
      }
    } catch (error) {
      console.warn(`⚠️ Gemini AI execution error (${error.message}), falling back to deterministic itinerary generator.`);
    }
  }

  if (!itineraryPlan) {
    itineraryPlan = await createIndianFallbackItinerary({ userPreferences, candidateDestination });
  }

  // Attach geospatial route optimization & real location image to each day of the itinerary
  if (itineraryPlan && Array.isArray(itineraryPlan.days)) {
    itineraryPlan.days = await Promise.all(
      itineraryPlan.days.map((day, idx) =>
        attachGeospatialRouteToDay(day, destCoords, attractions, idx + 1, destName)
      )
    );
  }

  return itineraryPlan;
};

/**
 * Deterministic Indian Fallback Itinerary Generator with Dynamic Destination Templates
 */
const createIndianFallbackItinerary = async ({ userPreferences, candidateDestination }) => {
  const duration = userPreferences.duration || candidateDestination.idealDurationDays || 3;
  const budgetLevel = userPreferences.budgetLevel || candidateDestination.budgetLevel || 'Standard';
  const group = userPreferences.group || 'Solo';
  const vibes = userPreferences.vibes || candidateDestination.travelVibes || ['Spiritual'];

  const destName = candidateDestination.name || candidateDestination.destinationName || 'Nanded';
  const category = candidateDestination.category || vibes[0] || 'Tourism';
  const landmarkInfo = getLandmarksForDestination(destName);

  const coverImage = candidateDestination.imageUrl || (landmarkInfo ? landmarkInfo.imageUrl : await fetchRealLocationImage(destName));

  const attractions = (candidateDestination.topAttractions && candidateDestination.topAttractions.length > 0)
    ? candidateDestination.topAttractions
    : (landmarkInfo ? landmarkInfo.topAttractions : [`Famous ${destName} Landmark`, `Heritage Site in ${destName}`, `Local Market in ${destName}`]);

  const dailyBaseCost = candidateDestination.estimatedCostPerDayInr || 2500;
  const totalCost = dailyBaseCost * duration;
  const estimatedCost = {
    accommodation: Math.round(totalCost * 0.40),
    transportation: Math.round(totalCost * 0.20),
    food: Math.round(totalCost * 0.20),
    activities: Math.round(totalCost * 0.12),
    miscellaneous: Math.round(totalCost * 0.08),
    total: totalCost
  };

  const daysArray = [];

  for (let i = 1; i <= duration; i++) {
    const mainAttraction = attractions[(i - 1) % attractions.length];
    const secondaryAttraction = attractions[i % attractions.length] || mainAttraction;
    const dayImg = await fetchRealLocationImage(mainAttraction, destName);

    const schedule = getActivityTemplatesForDestination(category, vibes[0], destName, mainAttraction, secondaryAttraction);

    daysArray.push({
      day: i,
      title: `Day ${i}: ${mainAttraction} & ${destName} Exploration`,
      imageUrl: dayImg || coverImage,
      morning: schedule.morning,
      afternoon: schedule.afternoon,
      evening: schedule.evening,
      stayRecommendation: landmarkInfo ? landmarkInfo.stayRecommendation : (budgetLevel === 'Pocket-Friendly' ? 'Clean Yatri Niwas / Homestay' : '3-Star Standard Hotel / Guest House'),
      foodSpot: landmarkInfo ? landmarkInfo.foodSpot : `Famous ${destName} Local Thali & Street Food Trail`
    });
  }

  return {
    destination: destName,
    imageUrl: coverImage,
    summary: `${destName} is an exceptional ${category} destination in ${candidateDestination.stateOrRegion || 'India'}, world-famous for ${attractions[0]} and scenic cultural experiences.`,
    matchReasoning: `This itinerary scores ${candidateDestination.matchScore || 95}% compatibility with your preferences, highlighting ${attractions[0]} and fitting comfortably within your ${budgetLevel} budget.`,
    estimatedCost,
    days: daysArray,
    travelTips: [
      `Main landmark highlight: ${attractions[0]}`,
      'Respect local traditions, dress appropriately when visiting holy places, and follow local guidelines.',
      'Carry cash for local transport, street food, and craft markets.'
    ]
  };
};

module.exports = {
  generateStructuredAiItinerary,
  createIndianFallbackItinerary,
  generateAiTravelSuggestions
};

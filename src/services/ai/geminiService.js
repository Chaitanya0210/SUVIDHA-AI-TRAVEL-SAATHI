// -----------------------------------------------------------------------------
// Gemini AI Service & Itinerary Generator (src/services/ai/geminiService.js)
// -----------------------------------------------------------------------------
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/env');
const { validateItineraryOutput } = require('./itineraryValidator');
const { optimizeRouteSequence } = require('../maps/routingService');
const { getLandmarksForDestination } = require('../../utils/indianLandmarks');

/**
 * Attaches geocoded activity stops and optimized route metrics to an itinerary day
 */
const attachGeospatialRouteToDay = (dayItem, destCoords, attractionsList = [], dayIndex = 1) => {
  const baseLat = destCoords.lat || 25.3176;
  const baseLng = destCoords.lng || 82.9739;

  // Offsets for distinct stop locations around the destination
  const offsets = [
    { dLat: 0.0000, dLng: 0.0000 },
    { dLat: 0.0150, dLng: 0.0120 },
    { dLat: -0.0120, dLng: 0.0180 },
    { dLat: 0.0080, dLng: -0.0150 },
    { dLat: -0.0180, dLng: -0.0100 }
  ];

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
 * Generates an AI-powered structured travel itinerary with geospatial route optimization
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
For example, if destination is Nanded, you MUST explicitly include Takht Sachkhand Sri Hazur Abchalnagar Sahib Gurudwara and Gurudwara Shikar Ghat Sahib in the morning/afternoon schedule!
Do NOT write generic placeholders like "City Center" or "Local Sightseeing". Name exact real-world monuments, temples, gurudwaras, forts, or beaches!

INSTRUCTIONS:
1. Respect the target duration (${duration} days), group type (${group}), and budget level (${budgetLevel}).
2. Return STRICTLY PURE VALID JSON with NO markdown formatting, no code blocks, and no extra text outside the JSON object.

JSON SCHEMA REQUIREMENT:
{
  "destination": "${destName}",
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
    itineraryPlan = createIndianFallbackItinerary({ userPreferences, candidateDestination });
  }

  // Attach geospatial route optimization to each day of the itinerary
  if (itineraryPlan && Array.isArray(itineraryPlan.days)) {
    itineraryPlan.days = itineraryPlan.days.map((day, idx) =>
      attachGeospatialRouteToDay(day, destCoords, attractions, idx + 1)
    );
  }

  return itineraryPlan;
};

/**
 * Deterministic Indian Fallback Itinerary Generator with Real Landmarks
 */
const createIndianFallbackItinerary = ({ userPreferences, candidateDestination }) => {
  const duration = userPreferences.duration || candidateDestination.idealDurationDays || 3;
  const budgetLevel = userPreferences.budgetLevel || candidateDestination.budgetLevel || 'Standard';
  const group = userPreferences.group || 'Solo';
  const vibes = userPreferences.vibes || candidateDestination.travelVibes || ['Spiritual'];

  const destName = candidateDestination.name || candidateDestination.destinationName || 'Nanded';
  const landmarkInfo = getLandmarksForDestination(destName);

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

    daysArray.push({
      day: i,
      title: `Day ${i}: ${mainAttraction} & ${destName} Exploration`,
      morning: [`Darshan & morning visit to ${mainAttraction}`, `Explore surrounding historical heritage & sacred premises in ${destName}`],
      afternoon: [`Enjoy authentic local lunch at ${landmarkInfo ? landmarkInfo.foodSpot : 'popular Dhaba/Thali center'}`, `Relaxed afternoon visit to ${secondaryAttraction}`],
      evening: [`Sunset view at Godavari Ghat & evening Aarti/Prayer`, `Dinner at recommended local food trail spot in ${destName}`],
      stayRecommendation: landmarkInfo ? landmarkInfo.stayRecommendation : (budgetLevel === 'Pocket-Friendly' ? 'Clean Yatri Niwas / Homestay' : '3-Star Standard Hotel / Guest House'),
      foodSpot: landmarkInfo ? landmarkInfo.foodSpot : `Famous ${destName} Local Thali & Street Food Trail`
    });
  }

  return {
    destination: destName,
    summary: `${destName} is an exceptional spiritual and historical destination in ${candidateDestination.stateOrRegion || 'Maharashtra, India'}, world-famous for ${attractions[0]} and sacred cultural heritage.`,
    matchReasoning: `This itinerary scores ${candidateDestination.matchScore || 95}% compatibility with your preferences, highlighting ${attractions[0]} and fitting comfortably within your ${budgetLevel} budget.`,
    estimatedCost,
    days: daysArray,
    travelTips: [
      `Main landmark highlight: ${attractions[0]}`,
      'Dress modestly and cover your head when visiting holy Gurudwaras and sacred temples.',
      'Carry cash for local prasad, rickshaws, and craft markets.'
    ]
  };
};

module.exports = {
  generateStructuredAiItinerary,
  createIndianFallbackItinerary,
  generateAiTravelSuggestions
};

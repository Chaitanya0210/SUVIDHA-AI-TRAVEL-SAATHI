// -----------------------------------------------------------------------------
// Gemini AI Service & Itinerary Generator (src/services/ai/geminiService.js)
// -----------------------------------------------------------------------------
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/env');
const { validateItineraryOutput } = require('./itineraryValidator');
const { optimizeRouteSequence } = require('../maps/routingService');

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
 * Generates an AI-powered structured travel itinerary with geospatial route optimization
 */
const generateStructuredAiItinerary = async ({ userPreferences, candidateDestination }) => {
  const {
    duration = 3,
    budgetLevel = 'Standard',
    group = 'Solo',
    vibes = ['Spiritual']
  } = userPreferences;

  const destName = candidateDestination.name || candidateDestination.destinationName || 'Varanasi';
  const apiKey = config.GEMINI_API_KEY;
  const destCoords = candidateDestination.coordinates || { lat: 25.3176, lng: 82.9739 };

  let itineraryPlan = null;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are SUVIDHA AI Travel Saathi, an expert Indian travel planner. 
Generate a structured ${duration}-day trip itinerary for "${destName}" (${candidateDestination.stateOrRegion || 'India'}) for a ${group} group with a ${budgetLevel} budget seeking a ${vibes.join(', ')} experience.

Structured Candidate Destination Context:
- Match Score: ${candidateDestination.matchScore || 90}%
- State/Region: ${candidateDestination.stateOrRegion || 'India'}
- Category: ${candidateDestination.category || 'Tourism'}
- Estimated Daily Base Cost: ₹${candidateDestination.estimatedCostPerDayInr || 2500} INR
- Top Attractions: ${(candidateDestination.topAttractions || []).join(', ')}
- Suitable For: ${(candidateDestination.suitableFor || []).join(', ')}
- Food Options: ${(candidateDestination.foodOptions || []).join(', ')}

INSTRUCTIONS:
1. Use the provided structured candidate facts. Do not invent non-existent geographical facts.
2. Respect the target duration (${duration} days), group type (${group}), and budget level (${budgetLevel}).
3. Return STRICTLY PURE VALID JSON with NO markdown formatting, no code blocks, and no extra text outside the JSON object.

JSON SCHEMA REQUIREMENT:
{
  "destination": "${destName}",
  "summary": "A concise 2-sentence summary highlighting why ${destName} was selected.",
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
      "title": "Day 1 Theme Title",
      "morning": ["Morning activity description 1"],
      "afternoon": ["Afternoon activity & local lunch recommendation"],
      "evening": ["Evening sightseeing or Aarti/Sunset viewing"],
      "stayRecommendation": "Recommended hotel/guesthouse type",
      "foodSpot": "Recommended local Dhaba or restaurant spot"
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
      attachGeospatialRouteToDay(day, destCoords, candidateDestination.topAttractions || [], idx + 1)
    );
  }

  return itineraryPlan;
};

/**
 * Deterministic Indian Fallback Itinerary Generator
 */
const createIndianFallbackItinerary = ({ userPreferences, candidateDestination }) => {
  const duration = userPreferences.duration || candidateDestination.idealDurationDays || 3;
  const budgetLevel = userPreferences.budgetLevel || candidateDestination.budgetLevel || 'Standard';
  const group = userPreferences.group || 'Solo';
  const vibes = userPreferences.vibes || candidateDestination.travelVibes || ['Spiritual'];

  const destName = candidateDestination.name || candidateDestination.destinationName || 'Varanasi';
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

  const attractions = candidateDestination.topAttractions || ['Local Sightseeing', 'Heritage Walk', 'Local Market'];
  const daysArray = [];

  for (let i = 1; i <= duration; i++) {
    const attraction = attractions[(i - 1) % attractions.length];
    daysArray.push({
      day: i,
      title: `Day ${i}: Discovering ${attraction} & Local Highlights`,
      morning: [`Morning visit to ${attraction} in ${destName}`, 'Explore surrounding scenic viewpoints & heritage architecture'],
      afternoon: [`Enjoy authentic local lunch at popular Dhaba/Thali center`, 'Relaxed stroll through old town craft markets'],
      evening: [`Sunset view & local evening cultural experience`, 'Dinner at recommended local food trail spot'],
      stayRecommendation: budgetLevel === 'Pocket-Friendly' ? 'Clean Yatri Niwas / Homestay' : budgetLevel === 'Royal-Luxury' ? '5-Star Heritage Palace / Luxury Resort' : '3-Star Standard Hotel / Guest House',
      foodSpot: `Famous ${destName} Local Thali & Street Food Trail`
    });
  }

  return {
    destination: destName,
    summary: `${destName} is an exceptional ${candidateDestination.category || 'destination'} in ${candidateDestination.stateOrRegion || 'India'}, offering a memorable ${vibes.join(' & ')} experience tailored for ${group} travelers.`,
    matchReasoning: `This itinerary scores ${candidateDestination.matchScore || 90}% compatibility with your preferences, fitting comfortably within your ${budgetLevel} budget.`,
    estimatedCost,
    days: daysArray,
    travelTips: [
      `Best mode of local transit: ${candidateDestination.averageLocalTransportCostInr ? `Local auto/cab (approx ₹${candidateDestination.averageLocalTransportCostInr}/day)` : 'Local E-Rickshaw / Auto'}`,
      'Carry cash for local street food vendors and temple entry fees.',
      `Best seasons to visit: ${(candidateDestination.bestSeasons || ['Winter', 'Autumn']).join(', ')}.`
    ]
  };
};

module.exports = {
  generateStructuredAiItinerary,
  createIndianFallbackItinerary
};

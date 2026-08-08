// -----------------------------------------------------------------------------
// Gemini AI Service & Itinerary Generator (src/services/ai/geminiService.js)
// -----------------------------------------------------------------------------
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/env');
const { validateItineraryOutput } = require('./itineraryValidator');

/**
 * Generates an AI-powered structured travel itinerary by combining structured candidate recommendations with Gemini AI reasoning.
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
  "matchReasoning": "Detailed explanation of how this trip satisfies the user's ${vibes.join(', ')} preferences and ${group} group type.",
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
      "morning": ["Morning activity description 1", "Morning activity description 2"],
      "afternoon": ["Afternoon activity & local lunch recommendation"],
      "evening": ["Evening sightseeing or Aarti/Sunset viewing"],
      "stayRecommendation": "Recommended hotel/guesthouse type",
      "foodSpot": "Recommended local Dhaba or restaurant spot"
    }
  ],
  "travelTips": [
    "Useful local travel tip 1",
    "Useful local travel tip 2"
  ]
}`;

      // Call Gemini API with 10-second timeout guard
      const apiPromise = model.generateContent(prompt);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out after 10000ms')), 10000)
      );

      const result = await Promise.race([apiPromise, timeoutPromise]);
      const textResponse = result.response.text();

      const cleanedJsonText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanedJsonText);

      // Validate output schema
      const validation = validateItineraryOutput(parsedData, duration, destName);
      if (validation.isValid) {
        return validation.sanitized;
      } else {
        console.warn(`⚠️ Gemini output failed validation (${validation.reason}), using structured fallback.`);
      }
    } catch (error) {
      console.warn(`⚠️ Gemini AI execution error (${error.message}), falling back to deterministic itinerary generator.`);
    }
  } else {
    console.log('ℹ️ GEMINI_API_KEY not configured. Utilizing deterministic Indian fallback itinerary engine.');
  }

  // Fallback Engine
  return createIndianFallbackItinerary({ userPreferences, candidateDestination });
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

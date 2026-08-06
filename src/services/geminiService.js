// -----------------------------------------------------------------------------
// Gemini AI Service & Intelligent Itinerary Generator (src/services/geminiService.js)
// -----------------------------------------------------------------------------
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Generates an AI-powered structured travel itinerary.
 * Uses Google Gemini API if GEMINI_API_KEY is available, or fallback engine.
 */
const generateAiItinerary = async ({ destination, durationDays = 3, budgetLevel = 'Mid-Range', travelVibe = 'Adventure', groupType = 'Solo' }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a world-class travel guide. Create a detailed ${durationDays}-day travel itinerary for "${destination}" catering to a ${groupType} traveler with a ${budgetLevel} budget seeking a ${travelVibe} vibe.
      
      Respond STRICTLY in pure valid JSON without markdown wrapping or code blocks, using this structure:
      {
        "destinationName": "${destination}",
        "country": "Country Name",
        "durationDays": ${durationDays},
        "budgetLevel": "${budgetLevel}",
        "travelVibe": "${travelVibe}",
        "estimatedTotalCost": 350,
        "currency": "USD",
        "aiRationale": "Why this trip is perfect for your travel style...",
        "coordinates": { "lat": 26.9124, "lng": 75.7873 },
        "itinerary": [
          {
            "day": 1,
            "theme": "Arrival & Initial Exploration",
            "morning": "Detailed morning activity description",
            "afternoon": "Detailed afternoon activity description",
            "evening": "Detailed evening activity description",
            "stay": "Recommended hotel/hostel type",
            "estimatedDayCost": 100
          }
        ]
      }`;

      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();
      
      // Clean JSON formatting if enclosed in ```json ... ```
      const cleanedJsonText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanedJsonText);
      return parsedData;

    } catch (error) {
      console.warn(`⚠️ Gemini API call failed or unconfigured, switching to Intelligent Local Fallback Engine: ${error.message}`);
    }
  }

  // -----------------------------------------------------------------------------
  // Intelligent Local Fallback Engine (Runs seamlessly when API Key is absent)
  // -----------------------------------------------------------------------------
  return createFallbackItinerary({ destination, durationDays, budgetLevel, travelVibe, groupType });
};

// Local Itinerary Generator for seamless offline / zero-key support
const createFallbackItinerary = ({ destination, durationDays, budgetLevel, travelVibe, groupType }) => {
  const costMultiplier = budgetLevel === 'Budget' ? 40 : budgetLevel === 'Luxury' ? 250 : 110;
  const estimatedTotalCost = durationDays * costMultiplier;

  const daysArray = [];
  const activitiesByVibe = {
    Adventure: [
      { morning: "Sunrise trek or cable car ride to viewpoint", afternoon: "Zip-lining or water rafting adventure", evening: "Local night market exploration & campfire dinner" },
      { morning: "Guided mountain biking tour", afternoon: "Paragliding or cliff-jumping spot visit", evening: "Unwind at a local rooftop craft brewery" },
      { morning: "Nature reserve trail hike", afternoon: "Kayaking or lake navigation", evening: "Stargazing at scenic high point" }
    ],
    Nature: [
      { morning: "Early morning botanical garden & bird watching", afternoon: "Waterfall picnic and scenic nature trail", evening: "Sunset viewpoint walk with local tea" },
      { morning: "National park wildlife safari", afternoon: "River cruise and eco-lodge tour", evening: "Relaxing spa session amidst greenery" },
      { morning: "Organic farm tour & fresh breakfast", afternoon: "Hidden lake exploration", evening: "Outdoor photography session at dusk" }
    ],
    Heritage: [
      { morning: "Historic fort & palace architecture tour", afternoon: "Ancient museum & heritage walkthrough", evening: "Cultural folk music & dance performance" },
      { morning: "Old town heritage bazaar discovery", afternoon: "Traditional artisan & pottery workshop", evening: "Historic mansion dinner experience" },
      { morning: "Archaeological monument exploration", afternoon: "Local heritage library & souvenir shopping", evening: "Light and sound show at heritage site" }
    ],
    Relaxation: [
      { morning: "Mindful yoga & beachside meditation", afternoon: "Aromatherapy thermal spa treatment", evening: "Sunset beach walk & seafood dinner" },
      { morning: "Leisurely brunch at seaside cafe", afternoon: "Poolside relaxing & reading session", evening: "Catamaran sunset sailboat cruise" },
      { morning: "Quiet park stroll & artisan coffee", afternoon: "Resort cabana lounging", evening: "Fine dining candlelit dinner" }
    ]
  };

  const selectedVibeList = activitiesByVibe[travelVibe] || activitiesByVibe.Adventure;

  for (let i = 1; i <= durationDays; i++) {
    const actIndex = (i - 1) % selectedVibeList.length;
    const act = selectedVibeList[actIndex];
    daysArray.push({
      day: i,
      theme: `Day ${i}: ${travelVibe} & Highlight Discovery`,
      morning: `${act.morning} in ${destination}`,
      afternoon: `${act.afternoon} tailored for ${groupType} travelers`,
      evening: `${act.evening}`,
      stay: budgetLevel === 'Budget' ? 'Boutique Hostel / Homestay' : budgetLevel === 'Luxury' ? '5-Star Luxury Resort & Spa' : '4-Star Central Heritage Hotel',
      estimatedDayCost: costMultiplier
    });
  }

  // Pre-mapped destination coordinates for interactive OpenStreetMap pins
  const coordsMap = {
    'manali': { lat: 32.2432, lng: 77.1892, country: 'India' },
    'goa': { lat: 15.2993, lng: 74.1240, country: 'India' },
    'jaipur': { lat: 26.9124, lng: 75.7873, country: 'India' },
    'kerala': { lat: 10.8505, lng: 76.2711, country: 'India' },
    'kyoto': { lat: 35.0116, lng: 135.7681, country: 'Japan' },
    'santorini': { lat: 36.3932, lng: 25.4615, country: 'Greece' },
    'banff': { lat: 51.1784, lng: -115.5708, country: 'Canada' },
    'zurich': { lat: 47.3769, lng: 8.5417, country: 'Switzerland' }
  };

  const key = destination.toLowerCase().trim();
  const matchedCoords = coordsMap[key] || { lat: 20.5937, lng: 78.9629, country: 'Global Location' };

  return {
    destinationName: destination,
    country: matchedCoords.country,
    durationDays: durationDays,
    budgetLevel: budgetLevel,
    travelVibe: travelVibe,
    estimatedTotalCost: estimatedTotalCost,
    currency: "USD",
    aiRationale: `This ${durationDays}-day ${travelVibe.toLowerCase()} trip to ${destination} is specially calculated for a ${budgetLevel.toLowerCase()} budget. It balances thrilling highlights, cultural spots, and optimum daily pacing.`,
    coordinates: { lat: matchedCoords.lat, lng: matchedCoords.lng },
    itinerary: daysArray
  };
};

module.exports = { generateAiItinerary };

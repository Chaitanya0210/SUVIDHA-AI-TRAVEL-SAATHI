// -----------------------------------------------------------------------------
// Gemini AI Service & Indian Itinerary Generator (src/services/geminiService.js)
// -----------------------------------------------------------------------------
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Generates an AI-powered structured travel itinerary tailored specifically for Indian travelers.
 * Uses Google Gemini API if GEMINI_API_KEY is available, or Indian fallback engine.
 */
const generateAiItinerary = async ({ destination, durationDays = 3, budgetLevel = 'Standard', travelVibe = 'Spiritual', groupType = 'Family' }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are an expert Indian travel saathi (guide) specializing in Bharat travel. Create a detailed ${durationDays}-day travel itinerary for "${destination}" catering to a ${groupType} traveling in India with a ${budgetLevel} budget seeking a ${travelVibe} experience.
      
      Respond STRICTLY in pure valid JSON without markdown wrapping or code blocks, using this exact structure:
      {
        "destinationName": "${destination}",
        "stateOrRegion": "State/Region in India",
        "country": "India",
        "durationDays": ${durationDays},
        "budgetLevel": "${budgetLevel}",
        "travelVibe": "${travelVibe}",
        "estimatedTotalCostInr": 12500,
        "currency": "INR",
        "aiRationale": "Why this trip is perfect for your travel style in India...",
        "transportAdvice": "Best mode of transport (e.g. Vande Bharat Express, Sleeper Train, State Bus, Cab)",
        "foodAdvice": "Top local food spots (e.g., Pure Veg Dhabas, Famous Street Food Street, Local Thali)",
        "coordinates": { "lat": 25.3176, "lng": 82.9739 },
        "itinerary": [
          {
            "day": 1,
            "theme": "Arrival & Temple/Sightseeing Exploration",
            "morning": "Detailed morning activity",
            "afternoon": "Detailed afternoon activity & lunch at famous local dhaba",
            "evening": "Aarti or evening sunset view",
            "stay": "Recommended hotel/guesthouse",
            "estimatedDayCostInr": 3500
          }
        ]
      }`;

      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();
      
      const cleanedJsonText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanedJsonText);
      return parsedData;

    } catch (error) {
      console.warn(`⚠️ Gemini API call failed or unconfigured, switching to Indian Fallback Engine: ${error.message}`);
    }
  }

  // -----------------------------------------------------------------------------
  // Indian Fallback Engine (Runs seamlessly with ₹ INR currency calibration)
  // -----------------------------------------------------------------------------
  return createIndianFallbackItinerary({ destination, durationDays, budgetLevel, travelVibe, groupType });
};

// Local Indian Itinerary Generator
const createIndianFallbackItinerary = ({ destination, durationDays, budgetLevel, travelVibe, groupType }) => {
  // ₹ INR Multiplier
  const costMultiplier = budgetLevel === 'Pocket-Friendly' ? 1400 : budgetLevel === 'Royal-Luxury' ? 12000 : 3800;
  const estimatedTotalCostInr = durationDays * costMultiplier;

  const daysArray = [];
  const activitiesByVibe = {
    Spiritual: [
      { morning: "Early morning holy dip & sunrise temple visit", afternoon: "Explore sacred ghats & traditional South/North Indian Thali lunch", evening: "Attend evening Ganga/Narmada/Yamuna Aarti with diya ceremony" },
      { morning: "Guided heritage walk through old city bazaars", afternoon: "Visit historic ashrams & meditation hall", evening: "Local sweets (Kachori, Jalebi, Lassi) tasting trail" },
      { morning: "Peaceful morning chants session", afternoon: "Visit nearby hilltop shrine or museum", evening: "Souvenir shopping for idols, brassware & silk sarees" }
    ],
    "Himalayan Trek": [
      { morning: "Early morning trek to scenic snow viewpoint", afternoon: "Local Pahadi lunch & riverside tea break", evening: "Campfire evening with live acoustic music" },
      { morning: "Visit Solang/Rohtang/Pass & adventure activity", afternoon: "Explore Old town cafes & momo stalls", evening: "Relaxing stroll along Mall Road" },
      { morning: "Nature trail walk through pine forests", afternoon: "Visit ancient wooden temple & local hot springs", evening: "Sunset viewing at mountain ridge" }
    ],
    Heritage: [
      { morning: "Guided tour of grand fort & royal palace halls", afternoon: "Royal Rajasthani Thali / local cuisine feast", evening: "Cultural folk music, Kalbeliya dance & puppet show" },
      { morning: "Explore pink/blue city architecture & stepwells (Baori)", afternoon: "Visit local handicraft, bandhani & gemstone bazaars", evening: "Sunset tea at fort rooftop looking over city lights" },
      { morning: "Visit royal cenotaphs & museum collection", afternoon: "Traditional pottery & Block printing workshop", evening: "Heritage haveli dinner experience" }
    ],
    Beaches: [
      { morning: "Sunrise walk along golden sandy beach", afternoon: "Shack lunch with fresh seafood/coastal curry & coconut water", evening: "Sunset beach sports & flea market browsing" },
      { morning: "Water sports adventure (Banana boat, Jet Ski, Parasailing)", afternoon: "Explore Portuguese heritage churches & Latin Quarter", evening: "Beachfront sunset music & seafood dinner" },
      { morning: "Dolphin watching boat trip / Island cruise", afternoon: "Relaxing hammock session at quiet beach", evening: "Night market shopping & coastal cafe trail" }
    ]
  };

  const selectedVibeList = activitiesByVibe[travelVibe] || activitiesByVibe.Spiritual;

  for (let i = 1; i <= durationDays; i++) {
    const actIndex = (i - 1) % selectedVibeList.length;
    const act = selectedVibeList[actIndex];
    daysArray.push({
      day: i,
      theme: `Day ${i}: ${travelVibe} & Local Discovery`,
      morning: `${act.morning} in ${destination}`,
      afternoon: `${act.afternoon} (Recommended for ${groupType} travel)`,
      evening: `${act.evening}`,
      stay: budgetLevel === 'Pocket-Friendly' ? 'Clean Yatri Niwas / Boutique Homestay' : budgetLevel === 'Royal-Luxury' ? '5-Star Heritage Palace / Luxury Resort' : '3-Star Standard Hotel / AC Guest House',
      estimatedDayCostInr: costMultiplier
    });
  }

  // Coordinates for top Indian destinations
  const coordsMap = {
    'varanasi': { lat: 25.3176, lng: 82.9739, state: 'Uttar Pradesh' },
    'kashi': { lat: 25.3176, lng: 82.9739, state: 'Uttar Pradesh' },
    'rishikesh': { lat: 30.0869, lng: 78.2676, state: 'Uttarakhand' },
    'manali': { lat: 32.2432, lng: 77.1892, state: 'Himachal Pradesh' },
    'jaipur': { lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
    'udaipur': { lat: 24.5854, lng: 73.7125, state: 'Rajasthan' },
    'goa': { lat: 15.2993, lng: 74.1240, state: 'Goa' },
    'kerala': { lat: 9.4981, lng: 76.3388, state: 'Kerala' },
    'alleppey': { lat: 9.4981, lng: 76.3388, state: 'Kerala' },
    'leh': { lat: 34.1526, lng: 77.5771, state: 'Ladakh' },
    'ladakh': { lat: 34.1526, lng: 77.5771, state: 'Ladakh' },
    'amritsar': { lat: 31.6340, lng: 74.8723, state: 'Punjab' },
    'andaman': { lat: 11.6233, lng: 92.7265, state: 'Andaman & Nicobar' }
  };

  const key = destination.toLowerCase().trim();
  const matchedCoords = coordsMap[key] || { lat: 20.5937, lng: 78.9629, state: 'India' };

  return {
    destinationName: destination,
    stateOrRegion: matchedCoords.state,
    country: "India",
    durationDays: durationDays,
    budgetLevel: budgetLevel,
    travelVibe: travelVibe,
    estimatedTotalCostInr: estimatedTotalCostInr,
    currency: "INR",
    aiRationale: `This ${durationDays}-day ${travelVibe.toLowerCase()} trip to ${destination} is specially crafted for ${groupType} traveling in India on a ${budgetLevel.toLowerCase()} budget. It includes local dhaba food trails, IRCTC/cab transport options, and spiritual/cultural highlights.`,
    transportAdvice: "Vande Bharat Express / IRCTC AC Train or Direct State AC Bus recommended for seamless travel.",
    foodAdvice: "Must try local Pure Veg Dhabas, Street food chaat, & authentic Thali meals.",
    coordinates: { lat: matchedCoords.lat, lng: matchedCoords.lng },
    itinerary: daysArray
  };
};

module.exports = { generateAiItinerary };

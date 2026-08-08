// -----------------------------------------------------------------------------
// AI Planner Controller (src/controllers/aiPlannerController.js)
// -----------------------------------------------------------------------------
const Destination = require('../models/Destination');
const { generateStructuredAiItinerary } = require('../services/ai/geminiService');
const { getPersonalizedRecommendations } = require('../services/recommendationService');
const { getLandmarksForDestination } = require('../utils/indianLandmarks');
const { initialDestinations } = require('../utils/seeder');
const { ValidationError } = require('../utils/appError');

/**
 * Handles AI trip planning generation
 */
const planTripWithAi = async (req, res, next) => {
  try {
    const { destination, durationDays, budgetLevel, travelVibe, groupType, budget } = req.body;

    const duration = parseInt(durationDays, 10) || 3;
    if (isNaN(duration) || duration < 1 || duration > 30) {
      return next(new ValidationError('Duration must be between 1 and 30 days.'));
    }

    const userPreferences = {
      budget: budget ? parseFloat(budget) : null,
      budgetLevel: budgetLevel || 'Standard',
      duration,
      group: groupType || 'Solo',
      vibes: travelVibe ? [travelVibe] : ['Adventure']
    };

    let candidateDestination = null;

    // 1. Check if user explicitly entered/selected a destination name
    if (destination && destination.trim() !== '') {
      const cleanDestName = destination.trim();
      const cleanRegex = new RegExp(cleanDestName.replace(/[()]/g, ''), 'i');

      // Check real-world Indian landmark knowledge dictionary first
      const landmarkData = getLandmarksForDestination(cleanDestName);

      // Direct MongoDB database search
      const dbMatch = await Destination.findOne({
        $or: [
          { name: cleanRegex },
          { city: cleanRegex },
          { stateOrRegion: cleanRegex },
          { category: cleanRegex }
        ]
      });

      if (dbMatch) {
        candidateDestination = dbMatch.toObject();
        if (landmarkData && landmarkData.topAttractions) {
          candidateDestination.topAttractions = Array.from(new Set([...landmarkData.topAttractions, ...(candidateDestination.topAttractions || [])]));
          candidateDestination.coordinates = landmarkData.coordinates || candidateDestination.coordinates;
        }
        candidateDestination.matchScore = 95;
      } else if (landmarkData) {
        // Construct structured candidate from landmark dictionary (e.g. Nanded, Amritsar, Ayodhya, Ujjain)
        candidateDestination = {
          name: landmarkData.name,
          destinationName: landmarkData.name,
          stateOrRegion: landmarkData.stateOrRegion,
          city: landmarkData.name,
          category: landmarkData.category || travelVibe || 'Spiritual',
          description: `Expedition to iconic ${landmarkData.name} featuring ${landmarkData.topAttractions[0]}.`,
          budgetLevel: budgetLevel || 'Standard',
          estimatedCostPerDayInr: budgetLevel === 'Pocket-Friendly' ? 1800 : (budgetLevel === 'Royal-Luxury' ? 12000 : 3200),
          travelVibes: [travelVibe || 'Spiritual'],
          suitableFor: [groupType || 'Family'],
          foodOptions: ['Pure Veg', 'Local Dhaba', 'Jain'],
          bestSeasons: ['Winter', 'Autumn', 'Spring'],
          idealDurationDays: duration,
          topAttractions: landmarkData.topAttractions,
          coordinates: landmarkData.coordinates,
          matchScore: 96
        };
      } else {
        // Construct structured candidate for custom user destination
        candidateDestination = {
          name: cleanDestName,
          destinationName: cleanDestName,
          stateOrRegion: 'India',
          city: cleanDestName,
          category: travelVibe || 'Sightseeing',
          description: `Custom AI-planned expedition to ${cleanDestName}.`,
          budgetLevel: budgetLevel || 'Standard',
          estimatedCostPerDayInr: budgetLevel === 'Pocket-Friendly' ? 1800 : (budgetLevel === 'Royal-Luxury' ? 12000 : 3500),
          travelVibes: [travelVibe || 'Adventure'],
          suitableFor: [groupType || 'Solo'],
          foodOptions: ['Local Dhaba', 'Pure Veg', 'Street Food'],
          bestSeasons: ['All Seasons'],
          idealDurationDays: duration,
          topAttractions: [
            `${cleanDestName} Main Famous Landmark / Temple`,
            `${cleanDestName} Heritage & Cultural Spot`,
            `${cleanDestName} Local Market & Food Trail`
          ],
          coordinates: { lat: 20.5937, lng: 78.9629 },
          matchScore: 92
        };
      }
    }

    // 2. If no target destination provided, use top recommended candidate
    if (!candidateDestination) {
      const recResult = await getPersonalizedRecommendations(userPreferences);
      const topRec = recResult.recommendations[0];

      if (topRec) {
        candidateDestination = {
          ...topRec.destination,
          matchScore: topRec.matchScore,
          matchExplanation: topRec.matchExplanation
        };
      } else {
        candidateDestination = initialDestinations[0];
      }
    }

    // Call Gemini AI Service with targeted candidate context
    const itineraryPlan = await generateStructuredAiItinerary({
      userPreferences,
      candidateDestination
    });

    res.status(200).json({
      success: true,
      data: {
        destinationName: itineraryPlan.destination || candidateDestination.name,
        destination: itineraryPlan.destination || candidateDestination.name,
        summary: itineraryPlan.summary,
        matchReasoning: itineraryPlan.matchReasoning,
        matchScore: candidateDestination.matchScore || 90,
        estimatedCost: itineraryPlan.estimatedCost,
        days: itineraryPlan.days,
        travelTips: itineraryPlan.travelTips || [],
        durationDays: duration,
        budgetLevel: userPreferences.budgetLevel,
        travelVibe: userPreferences.vibes[0],
        estimatedTotalCostInr: itineraryPlan.estimatedCost ? itineraryPlan.estimatedCost.total : duration * 3000,
        currency: 'INR',
        coordinates: candidateDestination.coordinates || { lat: 20.5937, lng: 78.9629 },
        itinerary: itineraryPlan.days
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Recommends matched destinations based on query attributes
 */
const getRecommendedDestinations = async (req, res, next) => {
  try {
    const { budget, vibe, season } = req.query;

    const userPreferences = {
      budget: budget ? parseFloat(budget) : null,
      vibes: vibe ? [vibe] : [],
      season
    };

    const recResult = await getPersonalizedRecommendations(userPreferences);
    res.status(200).json({
      success: true,
      data: recResult
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  planTripWithAi,
  getRecommendedDestinations
};

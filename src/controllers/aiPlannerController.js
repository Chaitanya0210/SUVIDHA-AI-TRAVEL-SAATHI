// -----------------------------------------------------------------------------
// AI Planner Controller (src/controllers/aiPlannerController.js)
// -----------------------------------------------------------------------------
const { generateStructuredAiItinerary } = require('../services/ai/geminiService');
const { getPersonalizedRecommendations } = require('../services/recommendationService');
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

    // Candidate Generation via Recommendation Engine
    const recResult = await getPersonalizedRecommendations(userPreferences);
    let candidateDestination = null;

    if (destination && destination.trim() !== '') {
      const foundMatch = recResult.recommendations.find(r =>
        r.destination.name.toLowerCase().includes(destination.trim().toLowerCase())
      );
      if (foundMatch) {
        candidateDestination = {
          ...foundMatch.destination,
          matchScore: foundMatch.matchScore,
          matchExplanation: foundMatch.matchExplanation
        };
      }
    }

    if (!candidateDestination) {
      // Pick top recommendation candidate
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

    // Call Gemini AI Service with candidate context
    const itineraryPlan = await generateStructuredAiItinerary({
      userPreferences,
      candidateDestination
    });

    res.status(200).json({
      success: true,
      data: {
        destinationName: itineraryPlan.destination,
        summary: itineraryPlan.summary,
        matchReasoning: itineraryPlan.matchReasoning,
        matchScore: candidateDestination.matchScore || 90,
        estimatedCost: itineraryPlan.estimatedCost,
        days: itineraryPlan.days,
        travelTips: itineraryPlan.travelTips || [],
        // Legacy properties for backward compatibility
        durationDays: duration,
        budgetLevel: userPreferences.budgetLevel,
        travelVibe: userPreferences.vibes[0],
        estimatedTotalCostInr: itineraryPlan.estimatedCost ? itineraryPlan.estimatedCost.total : duration * 3000,
        currency: 'INR',
        itinerary: itineraryPlan.days
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Recommends matched destinations based on quiz attributes with percentage match scores
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
      results: recResult.recommendations.length,
      data: recResult.recommendations.map(r => ({
        ...r.destination,
        matchPercentage: r.matchScore,
        matchExplanation: r.matchExplanation
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  planTripWithAi,
  getRecommendedDestinations
};

// -----------------------------------------------------------------------------
// AI Planner Controller (src/controllers/aiPlannerController.js)
// -----------------------------------------------------------------------------
const { generateAiItinerary } = require('../services/geminiService');
const { initialDestinations } = require('../utils/seeder');
const AppError = require('../utils/appError');

/**
 * Handles AI trip planning generation
 */
const planTripWithAi = async (req, res, next) => {
  try {
    const { destination, durationDays, budgetLevel, travelVibe, groupType } = req.body;

    if (!destination || destination.trim() === '') {
      return next(new AppError('Please provide a destination name.', 400));
    }

    const itineraryPlan = await generateAiItinerary({
      destination,
      durationDays: parseInt(durationDays, 10) || 3,
      budgetLevel: budgetLevel || 'Standard',
      travelVibe: travelVibe || 'Adventure',
      groupType: groupType || 'Solo'
    });

    res.status(200).json({
      status: 'success',
      data: itineraryPlan
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

    const scoredList = initialDestinations.map(dest => {
      let score = 50; // base score

      if (budget && dest.budgetLevel.toLowerCase() === budget.toLowerCase()) score += 20;
      if (vibe && dest.travelVibes.some(v => v.toLowerCase() === vibe.toLowerCase())) score += 20;
      if (season && dest.bestSeasons.some(s => s.toLowerCase() === season.toLowerCase() || s === 'All Year')) score += 10;

      return {
        ...dest,
        matchPercentage: Math.min(score, 99)
      };
    });

    // Sort by match percentage descending
    scoredList.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.status(200).json({
      status: 'success',
      results: scoredList.length,
      data: scoredList
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  planTripWithAi,
  getRecommendedDestinations
};

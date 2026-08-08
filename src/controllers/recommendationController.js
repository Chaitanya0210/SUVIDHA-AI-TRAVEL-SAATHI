// -----------------------------------------------------------------------------
// Recommendation Controller (src/controllers/recommendationController.js)
// -----------------------------------------------------------------------------
const { getPersonalizedRecommendations } = require('../services/recommendationService');
const { generateAiTravelSuggestions } = require('../services/ai/geminiService');
const { ValidationError } = require('../utils/appError');

/**
 * Handles POST /api/v1/recommendations request
 */
const generateRecommendations = async (req, res, next) => {
  try {
    const {
      budget,
      budgetLevel,
      duration,
      group,
      vibes,
      season,
      foodPreferences,
      sort,
      page,
      limit
    } = req.body;

    // Sanitize and normalize input preferences
    const parsedDuration = duration ? parseInt(duration, 10) : 3;
    if (isNaN(parsedDuration) || parsedDuration < 1 || parsedDuration > 30) {
      return next(new ValidationError('Duration must be between 1 and 30 days.'));
    }

    const parsedBudget = budget ? parseFloat(budget) : null;
    if (budget !== undefined && (isNaN(parsedBudget) || parsedBudget <= 0)) {
      return next(new ValidationError('Budget must be a positive number in ₹ INR.'));
    }

    const preferences = {
      budget: parsedBudget,
      budgetLevel: budgetLevel || 'Standard',
      duration: parsedDuration,
      group: group ? group.trim() : 'Solo',
      vibes: Array.isArray(vibes) ? vibes : (vibes ? [vibes] : ['Adventure']),
      season: season ? season.trim() : null,
      foodPreferences: Array.isArray(foodPreferences) ? foodPreferences : [],
      sort: sort || 'match',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10
    };

    // 1. Get deterministic multi-attribute candidate recommendations & score breakdowns
    const result = await getPersonalizedRecommendations(preferences);

    // 2. Get AI-generated travel suggestions matching Madhusudan6114's repo structure
    const aiSuggestions = await generateAiTravelSuggestions(preferences);

    res.status(200).json({
      success: true,
      data: {
        results: result.totalResults,
        page: result.page,
        limit: result.limit,
        recommendations: result.recommendations,
        aiSuggestions: aiSuggestions ? aiSuggestions.suggestions : [],
        personalizedTips: aiSuggestions ? aiSuggestions.personalizedTips : []
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateRecommendations
};

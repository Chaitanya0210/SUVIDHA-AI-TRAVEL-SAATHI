// -----------------------------------------------------------------------------
// Deterministic Recommendation & Multi-Attribute Scoring Engine (src/services/recommendationService.js)
// -----------------------------------------------------------------------------
const Destination = require('../models/Destination');
const Interaction = require('../models/Interaction');
const { initialDestinations } = require('../utils/seeder');
const mongoose = require('mongoose');

// Default Component Weights (Sum to 1.0 / 100%)
const DEFAULT_WEIGHTS = {
  vibe: 0.30,
  budget: 0.20,
  duration: 0.15,
  group: 0.10,
  season: 0.10,
  food: 0.05,
  popularity: 0.05,
  rating: 0.05
};

/**
 * Aggregates user interaction history to extract inferred historical preferences
 */
const getUserHistoricalProfile = async (userId, sessionId) => {
  if (mongoose.connection.readyState !== 1) return null;

  try {
    const queryConditions = [];
    if (userId) queryConditions.push({ userId });
    if (sessionId) queryConditions.push({ sessionId });

    if (queryConditions.length === 0) return null;

    const recentInteractions = await Interaction.find({ $or: queryConditions })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    if (!recentInteractions || recentInteractions.length === 0) return null;

    const vibeCounts = {};
    const categoryCounts = {};
    const budgetCounts = {};

    recentInteractions.forEach(item => {
      const meta = item.metadata || {};
      if (meta.vibe) vibeCounts[meta.vibe] = (vibeCounts[meta.vibe] || 0) + 1;
      if (Array.isArray(meta.vibes)) {
        meta.vibes.forEach(v => { vibeCounts[v] = (vibeCounts[v] || 0) + 1; });
      }
      if (meta.category) categoryCounts[meta.category] = (categoryCounts[meta.category] || 0) + 1;
      if (meta.budgetLevel) budgetCounts[meta.budgetLevel] = (budgetCounts[meta.budgetLevel] || 0) + 1;
    });

    const getTopKeys = (map, topN = 3) =>
      Object.keys(map).sort((a, b) => map[b] - map[a]).slice(0, topN);

    return {
      topVibes: getTopKeys(vibeCounts, 3),
      topCategories: getTopKeys(categoryCounts, 2),
      preferredBudgetLevel: getTopKeys(budgetCounts, 1)[0] || null
    };
  } catch (err) {
    console.warn('⚠️ Interaction profile aggregation error:', err.message);
    return null;
  }
};

/**
 * Calculates deterministic match score & component breakdown for a destination
 */
const calculateDestinationScore = (destination, preferences, historicalProfile = null, weights = DEFAULT_WEIGHTS) => {
  const {
    budget,
    budgetLevel,
    duration = 3,
    group = 'Solo',
    vibes = [],
    season,
    foodPreferences = []
  } = preferences;

  // 1. Vibe Score (30%)
  let vibeScore = 80;
  if (Array.isArray(vibes) && vibes.length > 0) {
    const destVibesLower = (destination.travelVibes || []).map(v => v.toLowerCase());
    const matchedCount = vibes.filter(v => destVibesLower.includes(v.toLowerCase())).length;
    vibeScore = Math.min(100, Math.round((matchedCount / vibes.length) * 100));
    if (matchedCount === 0) vibeScore = 30;
  }

  // 2. Budget Score (20%)
  let budgetScore = 80;
  const destDailyCost = destination.estimatedCostPerDayInr || destination.estimatedCostPerDay || 2500;

  if (budget && typeof budget === 'number' && budget > 0) {
    const targetDailyCost = budget / (duration || 1);
    if (destDailyCost <= targetDailyCost) {
      budgetScore = Math.min(100, 100 - Math.round(((targetDailyCost - destDailyCost) / targetDailyCost) * 15));
    } else {
      const overratio = (destDailyCost - targetDailyCost) / targetDailyCost;
      budgetScore = Math.max(10, Math.round(100 - (overratio * 100)));
    }
  } else if (budgetLevel) {
    const levelMap = {
      'pocket-friendly': 'pocket-friendly',
      'budget': 'pocket-friendly',
      'standard': 'standard',
      'mid-range': 'standard',
      'royal-luxury': 'royal-luxury',
      'luxury': 'royal-luxury'
    };
    const reqLevel = levelMap[budgetLevel.toLowerCase()] || 'standard';
    const destLevel = levelMap[(destination.budgetLevel || '').toLowerCase()] || 'standard';
    budgetScore = reqLevel === destLevel ? 100 : 65;
  }

  // 3. Duration Score (15%)
  const destIdealDays = destination.idealDurationDays || destination.idealDuration || 3;
  const diffDays = Math.abs(destIdealDays - duration);
  const durationScore = Math.max(20, 100 - (diffDays * 20));

  // 4. Group Suitability Score (10%)
  let groupScore = 70;
  if (group) {
    const suitableList = (destination.suitableFor || ['Solo', 'Couple', 'Friends', 'Family']).map(g => g.toLowerCase());
    groupScore = suitableList.includes(group.toLowerCase()) ? 100 : 50;
  }

  // 5. Season Score (10%)
  let seasonScore = 80;
  if (season) {
    const bestSeasonsLower = (destination.bestSeasons || ['All Year']).map(s => s.toLowerCase());
    seasonScore = (bestSeasonsLower.includes(season.toLowerCase()) || bestSeasonsLower.includes('all year')) ? 100 : 45;
  }

  // 6. Food Options Score (5%)
  let foodScore = 85;
  if (Array.isArray(foodPreferences) && foodPreferences.length > 0) {
    const foodOptsLower = (destination.foodOptions || ['Pure Veg', 'Non-Veg']).map(f => f.toLowerCase());
    const matchedFood = foodPreferences.filter(f => foodOptsLower.includes(f.toLowerCase())).length;
    foodScore = Math.min(100, Math.round((matchedFood / foodPreferences.length) * 100));
  }

  // 7. Popularity Score (5%)
  const popularityScore = destination.popularityScore || 85;

  // 8. Rating Score (5%)
  const ratingScore = Math.min(100, Math.round(((destination.rating || 4.8) / 5.0) * 100));

  // Explicit Score Calculation
  const explicitScore =
    (vibeScore * weights.vibe) +
    (budgetScore * weights.budget) +
    (durationScore * weights.duration) +
    (groupScore * weights.group) +
    (seasonScore * weights.season) +
    (foodScore * weights.food) +
    (popularityScore * weights.popularity) +
    (ratingScore * weights.rating);

  // 9. Personalization Boost from Interaction History (15% Max Boost)
  let personalizationScore = 70;
  let historyBonusExplanation = null;

  if (historicalProfile) {
    let pScore = 50;
    const destVibesLower = (destination.travelVibes || []).map(v => v.toLowerCase());
    const matchedHistVibes = (historicalProfile.topVibes || []).filter(v => destVibesLower.includes(v.toLowerCase()));

    if (matchedHistVibes.length > 0) {
      pScore += (matchedHistVibes.length * 20);
      historyBonusExplanation = `✓ Aligns with your favorite ${matchedHistVibes.join(' & ')} travel history`;
    }

    if (historicalProfile.topCategories && historicalProfile.topCategories.includes(destination.category)) {
      pScore += 15;
    }

    personalizationScore = Math.min(100, pScore);
  }

  // Final Blended Score (Explicit Current Preference 85% Weight, History 15% Weight)
  const finalWeightedScore = historicalProfile
    ? (explicitScore * 0.85) + (personalizationScore * 0.15)
    : explicitScore;

  const matchScore = Math.min(99, Math.max(10, Math.round(finalWeightedScore)));

  const scoreBreakdown = {
    vibe: vibeScore,
    budget: budgetScore,
    duration: durationScore,
    group: groupScore,
    season: seasonScore,
    food: foodScore,
    popularity: popularityScore,
    rating: ratingScore,
    personalization: personalizationScore
  };

  const matchExplanation = generateMatchExplanation(destination, preferences, scoreBreakdown, matchScore, historyBonusExplanation);

  return {
    matchScore,
    scoreBreakdown,
    matchExplanation
  };
};

/**
 * Generates deterministic natural language rationale explanation
 */
const generateMatchExplanation = (destination, preferences, scoreBreakdown, matchScore, historyBonusExplanation = null) => {
  const explanations = [];

  explanations.push(`${matchScore}% Overall Compatibility`);

  if (historyBonusExplanation) {
    explanations.push(historyBonusExplanation);
  }

  if (scoreBreakdown.vibe >= 80) {
    explanations.push(`Strong alignment with your requested travel vibes (${(destination.travelVibes || []).slice(0, 3).join(', ')}).`);
  }

  if (scoreBreakdown.budget >= 85) {
    explanations.push(`Fits comfortably within your specified budget (₹${destination.estimatedCostPerDayInr || 2500}/day est.).`);
  }

  if (scoreBreakdown.group >= 90 && preferences.group) {
    explanations.push(`Highly recommended for ${preferences.group} travelers.`);
  }

  if (scoreBreakdown.duration >= 85 && preferences.duration) {
    explanations.push(`Ideal ${destination.idealDurationDays || 3}-day trip length matches your ${preferences.duration}-day duration.`);
  }

  if (destination.rating >= 4.8) {
    explanations.push(`Top rated destination with a ${destination.rating}/5.0 traveler score.`);
  }

  return explanations;
};

/**
 * Queries candidates and returns ranked recommendations with match scores & explanations
 */
const getPersonalizedRecommendations = async (preferences) => {
  const { category, budgetLevel, sort = 'match', limit = 10, page = 1, userId, sessionId } = preferences;

  // Retrieve user's historical interaction profile
  const historicalProfile = await getUserHistoricalProfile(userId, sessionId);

  let candidates = [];
  try {
    let query = {};
    if (category) query.category = category;
    if (budgetLevel) query.budgetLevel = budgetLevel;

    candidates = await Destination.find(query).lean();
  } catch (err) {
    console.warn('⚠️ MongoDB query error, using local candidates seed.');
    candidates = initialDestinations;
  }

  if (!candidates || candidates.length === 0) {
    candidates = initialDestinations;
  }

  const scoredRecommendations = candidates.map(dest => {
    const scoringResult = calculateDestinationScore(dest, preferences, historicalProfile);
    return {
      destination: dest,
      matchScore: scoringResult.matchScore,
      scoreBreakdown: scoringResult.scoreBreakdown,
      matchExplanation: scoringResult.matchExplanation
    };
  });

  if (sort === 'budget_asc') {
    scoredRecommendations.sort((a, b) => (a.destination.estimatedCostPerDayInr || 0) - (b.destination.estimatedCostPerDayInr || 0));
  } else if (sort === 'rating_desc') {
    scoredRecommendations.sort((a, b) => (b.destination.rating || 0) - (a.destination.rating || 0));
  } else if (sort === 'popularity_desc') {
    scoredRecommendations.sort((a, b) => (b.destination.popularityScore || 0) - (a.destination.popularityScore || 0));
  } else {
    scoredRecommendations.sort((a, b) => b.matchScore - a.matchScore);
  }

  const skip = (page - 1) * limit;
  const paginatedResults = scoredRecommendations.slice(skip, skip + limit);

  return {
    totalResults: scoredRecommendations.length,
    page,
    limit,
    personalized: !!historicalProfile,
    recommendations: paginatedResults
  };
};

module.exports = {
  calculateDestinationScore,
  generateMatchExplanation,
  getPersonalizedRecommendations,
  getUserHistoricalProfile
};

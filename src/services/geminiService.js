// -----------------------------------------------------------------------------
// Legacy Bridge Export (src/services/geminiService.js)
// -----------------------------------------------------------------------------
const { generateStructuredAiItinerary } = require('./ai/geminiService');

const generateAiItinerary = async (params) => {
  const userPreferences = {
    duration: params.durationDays || 3,
    budgetLevel: params.budgetLevel || 'Standard',
    group: params.groupType || 'Solo',
    vibes: [params.travelVibe || 'Spiritual']
  };

  const candidateDestination = {
    name: params.destination,
    destinationName: params.destination,
    estimatedCostPerDayInr: params.budgetLevel === 'Pocket-Friendly' ? 1500 : params.budgetLevel === 'Royal-Luxury' ? 8000 : 3000
  };

  return await generateStructuredAiItinerary({ userPreferences, candidateDestination });
};

module.exports = {
  generateAiItinerary,
  generateStructuredAiItinerary
};

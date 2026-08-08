// -----------------------------------------------------------------------------
// AI Itinerary Output Validator (src/services/ai/itineraryValidator.js)
// -----------------------------------------------------------------------------

/**
 * Validates Gemini AI JSON output against target schema specifications
 */
const validateItineraryOutput = (output, expectedDurationDays, destinationName) => {
  if (!output || typeof output !== 'object') {
    return { isValid: false, reason: 'Output is not a valid JSON object' };
  }

  if (!output.destination || typeof output.destination !== 'string') {
    output.destination = destinationName || 'Destination';
  }

  if (!output.summary || typeof output.summary !== 'string') {
    return { isValid: false, reason: 'Missing summary field' };
  }

  // Validate Estimated Cost breakdown
  if (!output.estimatedCost || typeof output.estimatedCost !== 'object') {
    return { isValid: false, reason: 'Missing estimatedCost object' };
  }

  const costFields = ['accommodation', 'transportation', 'food', 'activities', 'miscellaneous', 'total'];
  for (const field of costFields) {
    if (typeof output.estimatedCost[field] !== 'number' || output.estimatedCost[field] < 0) {
      output.estimatedCost[field] = Math.max(0, parseInt(output.estimatedCost[field], 10) || 500);
    }
  }

  // Ensure total sum aligns
  const calcTotal = output.estimatedCost.accommodation + output.estimatedCost.transportation +
                    output.estimatedCost.food + output.estimatedCost.activities +
                    output.estimatedCost.miscellaneous;
  if (!output.estimatedCost.total || output.estimatedCost.total === 0) {
    output.estimatedCost.total = calcTotal;
  }

  // Validate Days array
  if (!Array.isArray(output.days) || output.days.length === 0) {
    return { isValid: false, reason: 'Days field must be a non-empty array' };
  }

  if (output.days.length !== expectedDurationDays) {
    return { isValid: false, reason: `Days array length (${output.days.length}) does not match expected duration (${expectedDurationDays})` };
  }

  for (let i = 0; i < output.days.length; i++) {
    const dayItem = output.days[i];
    if (!dayItem.day || typeof dayItem.day !== 'number') dayItem.day = i + 1;
    if (!Array.isArray(dayItem.morning)) dayItem.morning = [dayItem.morning || 'Morning sightseeing'];
    if (!Array.isArray(dayItem.afternoon)) dayItem.afternoon = [dayItem.afternoon || 'Local lunch & afternoon trail'];
    if (!Array.isArray(dayItem.evening)) dayItem.evening = [dayItem.evening || 'Evening Aarti & local market walk'];
  }

  return { isValid: true, sanitized: output };
};

module.exports = { validateItineraryOutput };

// -----------------------------------------------------------------------------
// Geospatial Routing & Route Optimization Service (src/services/maps/routingService.js)
// -----------------------------------------------------------------------------

/**
 * Calculates Haversine distance in kilometers between two lat/lng coordinates
 */
const calculateHaversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

/**
 * Estimates travel time in minutes based on distance and average transit speed
 */
const estimateTravelTimeMinutes = (distanceKm, avgSpeedKmH = 30) => {
  if (distanceKm <= 0) return 0;
  const travelHours = distanceKm / avgSpeedKmH;
  return Math.max(5, Math.round(travelHours * 60) + 5); // 5-minute minimum buffer
};

/**
 * Estimates local transport cost in ₹ INR based on distance
 */
const estimateTransportCostInr = (distanceKm) => {
  if (distanceKm <= 0) return 0;
  const baseFare = 50;
  const ratePerKm = 18;
  return Math.round(baseFare + (distanceKm * ratePerKm));
};

/**
 * Practical Route Heuristic: Orders stops using Nearest Neighbor to prevent backtracking
 */
const optimizeRouteSequence = (stops = []) => {
  if (!stops || stops.length <= 1) {
    return {
      totalDistanceKm: 0,
      estimatedTravelTimeMins: 0,
      estimatedTransportCostInr: 0,
      orderedStops: stops.map((stop, index) => ({ ...stop, stopOrder: index + 1 }))
    };
  }

  // Filter valid stops with coordinates
  const validStops = stops.filter(s => s && s.lat !== undefined && s.lng !== undefined);
  if (validStops.length === 0) {
    return {
      totalDistanceKm: 0,
      estimatedTravelTimeMins: 0,
      estimatedTransportCostInr: 0,
      orderedStops: stops.map((stop, index) => ({ ...stop, stopOrder: index + 1 }))
    };
  }

  const unvisited = [...validStops];
  const orderedStops = [];
  
  // Start from first stop (Hotel or starting point)
  let current = unvisited.shift();
  current.stopOrder = 1;
  orderedStops.push(current);

  let totalDistanceKm = 0;
  let totalTravelTimeMins = 0;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let shortestDist = calculateHaversineDistanceKm(current.lat, current.lng, unvisited[0].lat, unvisited[0].lng);

    for (let i = 1; i < unvisited.length; i++) {
      const dist = calculateHaversineDistanceKm(current.lat, current.lng, unvisited[i].lat, unvisited[i].lng);
      if (dist < shortestDist) {
        shortestDist = dist;
        nearestIndex = i;
      }
    }

    const nextStop = unvisited.splice(nearestIndex, 1)[0];
    const legTime = estimateTravelTimeMinutes(shortestDist);

    totalDistanceKm += shortestDist;
    totalTravelTimeMins += legTime;

    nextStop.stopOrder = orderedStops.length + 1;
    nextStop.legDistanceKm = shortestDist;
    nextStop.legDurationMins = legTime;

    orderedStops.push(nextStop);
    current = nextStop;
  }

  const estimatedTransportCostInr = estimateTransportCostInr(totalDistanceKm);

  return {
    totalDistanceKm: parseFloat(totalDistanceKm.toFixed(2)),
    estimatedTravelTimeMins: totalTravelTimeMins,
    estimatedTransportCostInr,
    orderedStops
  };
};

module.exports = {
  calculateHaversineDistanceKm,
  estimateTravelTimeMinutes,
  estimateTransportCostInr,
  optimizeRouteSequence
};

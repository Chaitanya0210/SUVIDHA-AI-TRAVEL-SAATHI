// -----------------------------------------------------------------------------
// Destination Controller (src/controllers/destinationController.js)
// -----------------------------------------------------------------------------
const Destination = require('../models/Destination');

// Sample initial database seed list
const initialDestinations = [
  {
    name: "Manali",
    country: "India",
    stateOrRegion: "Himachal Pradesh",
    category: "Mountain",
    description: "Nestled in the Himalayas, Manali offers breathtaking snow peaks, lush pine valleys, Solang Valley adventure sports, and scenic cafe culture.",
    imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    budgetLevel: "Budget",
    estimatedCostPerDay: 45,
    travelVibes: ["Adventure", "Nature", "Relaxation"],
    bestSeasons: ["Summer", "Winter"],
    idealDurationDays: 4,
    rating: 4.8,
    coordinates: { lat: 32.2432, lng: 77.1892 },
    topAttractions: ["Solang Valley", "Hadimba Temple", "Rohtang Pass", "Old Manali Cafes"],
    featured: true
  },
  {
    name: "Goa",
    country: "India",
    stateOrRegion: "Goa",
    category: "Beach",
    description: "Famous for sun-kissed golden beaches, Portuguese heritage architecture, vibrant nightlife, water sports, and laid-back coastal vibes.",
    imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    budgetLevel: "Mid-Range",
    estimatedCostPerDay: 65,
    travelVibes: ["Relaxation", "Nightlife", "Beach", "Foodie"],
    bestSeasons: ["Winter", "Autumn"],
    idealDurationDays: 5,
    rating: 4.7,
    coordinates: { lat: 15.2993, lng: 74.1240 },
    topAttractions: ["Baga Beach", "Dudhsagar Waterfalls", "Fort Aguada", "Panjim Latin Quarter"],
    featured: true
  },
  {
    name: "Jaipur",
    country: "India",
    stateOrRegion: "Rajasthan",
    category: "Heritage",
    description: "The famed Pink City of India, known for grand hilltop forts, royal palaces, vibrant handicraft bazaars, and rich Rajputana heritage.",
    imageUrl: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80",
    budgetLevel: "Budget",
    estimatedCostPerDay: 50,
    travelVibes: ["Heritage", "Foodie", "Shopping"],
    bestSeasons: ["Winter", "Spring"],
    idealDurationDays: 3,
    rating: 4.9,
    coordinates: { lat: 26.9124, lng: 75.7873 },
    topAttractions: ["Amer Fort", "Hawa Mahal", "City Palace", "Jantar Mantar"],
    featured: true
  },
  {
    name: "Kerala Backwaters",
    country: "India",
    stateOrRegion: "Kerala",
    category: "Nature",
    description: "God's Own Country, offering tranquil houseboat cruises through palm-fringed canals, Ayurvedic wellness retreats, and spice plantations.",
    imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    budgetLevel: "Mid-Range",
    estimatedCostPerDay: 80,
    travelVibes: ["Nature", "Relaxation", "Romance"],
    bestSeasons: ["Winter", "Autumn"],
    idealDurationDays: 5,
    rating: 4.9,
    coordinates: { lat: 10.8505, lng: 76.2711 },
    topAttractions: ["Alleppey Houseboats", "Munnar Tea Gardens", "Periyar National Park"],
    featured: true
  },
  {
    name: "Kyoto",
    country: "Japan",
    stateOrRegion: "Kansai",
    category: "Historic",
    description: "Japan's cultural heartland featuring thousands of classical Buddhist temples, serene bamboo groves, traditional wooden tea houses, and geishas.",
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    budgetLevel: "Luxury",
    estimatedCostPerDay: 180,
    travelVibes: ["Heritage", "Nature", "Foodie"],
    bestSeasons: ["Spring", "Autumn"],
    idealDurationDays: 4,
    rating: 4.9,
    coordinates: { lat: 35.0116, lng: 135.7681 },
    topAttractions: ["Fushimi Inari Shrine", "Arashiyama Bamboo Grove", "Kinkaku-ji (Golden Pavilion)"],
    featured: true
  },
  {
    name: "Santorini",
    country: "Greece",
    stateOrRegion: "Cyclades",
    category: "Island",
    description: "Iconic Aegean island known for cliffside whitewashed villages, blue-domed churches, dramatic volcanic sunsets, and crystal waters.",
    imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
    budgetLevel: "Luxury",
    estimatedCostPerDay: 220,
    travelVibes: ["Romance", "Relaxation", "Foodie"],
    bestSeasons: ["Summer", "Spring"],
    idealDurationDays: 4,
    rating: 4.8,
    coordinates: { lat: 36.3932, lng: 25.4615 },
    topAttractions: ["Oia Sunset Viewpoint", "Red Beach", "Akrotiri Archaeological Site"],
    featured: true
  }
];

// Seed initial database destinations if empty
const seedDestinations = async (req, res) => {
  try {
    let count = 0;
    try {
      count = await Destination.countDocuments();
    } catch (e) {
      console.warn("DB query error in seed check");
    }

    if (count === 0) {
      await Destination.insertMany(initialDestinations);
      if (res) return res.status(201).json({ message: "Successfully seeded initial destinations", data: initialDestinations });
    } else {
      if (res) return res.status(200).json({ message: "Database already populated", count });
    }
  } catch (error) {
    if (res) res.status(500).json({ error: error.message });
  }
};

// Get all destinations with search & filters
const getAllDestinations = async (req, res) => {
  try {
    const { search, category, budget, vibe } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (budget) query.budgetLevel = budget;
    if (vibe) query.travelVibes = vibe;

    let destinations = [];
    try {
      destinations = await Destination.find(query);
    } catch (e) {
      // In-memory fallback filtering if DB is offline
      destinations = initialDestinations.filter(d => {
        if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.country.toLowerCase().includes(search.toLowerCase())) return false;
        if (category && d.category !== category) return false;
        if (budget && d.budgetLevel !== budget) return false;
        if (vibe && !d.travelVibes.includes(vibe)) return false;
        return true;
      });
    }

    res.status(200).json({
      status: 'success',
      results: destinations.length,
      data: destinations
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get single destination details by ID or Name
const getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;
    let destination = null;

    try {
      destination = await Destination.findById(id);
    } catch (e) {
      destination = initialDestinations.find(d => d.name.toLowerCase() === id.toLowerCase() || d._id === id);
    }

    if (!destination) {
      return res.status(404).json({ status: 'error', message: 'Destination not found' });
    }

    res.status(200).json({ status: 'success', data: destination });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  seedDestinations,
  getAllDestinations,
  getDestinationById,
  initialDestinations
};

// -----------------------------------------------------------------------------
// Destination Controller (src/controllers/destinationController.js) - Indian Destinations
// -----------------------------------------------------------------------------
const Destination = require('../models/Destination');

// Iconic Indian destinations list pre-seeded with ₹ INR costs
const initialDestinations = [
  {
    name: "Varanasi (Kashi)",
    country: "India",
    stateOrRegion: "Uttar Pradesh",
    category: "Spiritual",
    description: "The spiritual heart of India on the banks of the sacred Ganges river. Famous for Ganga Aarti at Dashashwamedh Ghat, ancient temples, and silk weaving.",
    imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
    budgetLevel: "Pocket-Friendly",
    estimatedCostPerDayInr: 1500,
    travelVibes: ["Spiritual", "Heritage", "Foodie", "Family"],
    bestSeasons: ["Winter", "Autumn"],
    idealDurationDays: 3,
    rating: 4.9,
    coordinates: { lat: 25.3176, lng: 82.9739 },
    topAttractions: ["Kashi Vishwanath Temple", "Dashashwamedh Ghat Ganga Aarti", "Sarnath", "Assi Ghat"],
    featured: true
  },
  {
    name: "Manali",
    country: "India",
    stateOrRegion: "Himachal Pradesh",
    category: "Hill Station",
    description: "Nestled in the Himalayas, Manali offers breathtaking snow peaks, lush pine valleys, Solang Valley paragliding, and cozy Old Manali cafe culture.",
    imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    budgetLevel: "Standard",
    estimatedCostPerDayInr: 2800,
    travelVibes: ["Himalayan Trek", "Adventure", "Nature", "Honeymoon"],
    bestSeasons: ["Summer", "Winter"],
    idealDurationDays: 4,
    rating: 4.8,
    coordinates: { lat: 32.2432, lng: 77.1892 },
    topAttractions: ["Solang Valley", "Hadimba Temple", "Atal Tunnel", "Old Manali Cafes"],
    featured: true
  },
  {
    name: "Jaipur (Pink City)",
    country: "India",
    stateOrRegion: "Rajasthan",
    category: "Heritage",
    description: "The royal Pink City of Rajasthan, famous for grand hilltop Amer Fort, Hawa Mahal, Johari Bazaar street shopping, and authentic Rajasthani Thalis.",
    imageUrl: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80",
    budgetLevel: "Standard",
    estimatedCostPerDayInr: 3200,
    travelVibes: ["Heritage", "Foodie", "Shopping", "Family"],
    bestSeasons: ["Winter", "Spring"],
    idealDurationDays: 3,
    rating: 4.9,
    coordinates: { lat: 26.9124, lng: 75.7873 },
    topAttractions: ["Amer Fort", "Hawa Mahal", "City Palace", "Nahargarh Fort Sunset"],
    featured: true
  },
  {
    name: "Goa",
    country: "India",
    stateOrRegion: "Goa",
    category: "Beach",
    description: "India's beach paradise, featuring golden sun-kissed beaches, water sports, Portuguese Latin Quarter architecture, coastal seafood, and lively nightlife.",
    imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    budgetLevel: "Standard",
    estimatedCostPerDayInr: 3800,
    travelVibes: ["Beach", "Relaxation", "Nightlife", "Foodie"],
    bestSeasons: ["Winter", "Autumn"],
    idealDurationDays: 5,
    rating: 4.7,
    coordinates: { lat: 15.2993, lng: 74.1240 },
    topAttractions: ["Baga Beach", "Dudhsagar Waterfalls", "Fontainhas Latin Quarter", "Fort Aguada"],
    featured: true
  },
  {
    name: "Kerala Backwaters & Munnar",
    country: "India",
    stateOrRegion: "Kerala",
    category: "Backwaters",
    description: "God's Own Country, featuring traditional houseboat cruises in Alleppey backwaters, sprawling tea gardens of Munnar, and Ayurvedic wellness.",
    imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    budgetLevel: "Standard",
    estimatedCostPerDayInr: 4200,
    travelVibes: ["Nature", "Relaxation", "Honeymoon", "Family"],
    bestSeasons: ["Winter", "Monsoon"],
    idealDurationDays: 5,
    rating: 4.9,
    coordinates: { lat: 9.4981, lng: 76.3388 },
    topAttractions: ["Alleppey Houseboats", "Munnar Tea Plantations", "Periyar National Park"],
    featured: true
  },
  {
    name: "Leh Ladakh",
    country: "India",
    stateOrRegion: "Ladakh",
    category: "Hill Station",
    description: "The Land of High Passes. Epic mountain desert landscapes, Pangong Tso crystal lake, Nubra Valley sand dunes, and famous bike expedition routes.",
    imageUrl: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80",
    budgetLevel: "Royal-Luxury",
    estimatedCostPerDayInr: 6500,
    travelVibes: ["Himalayan Trek", "Adventure", "Nature"],
    bestSeasons: ["Summer"],
    idealDurationDays: 7,
    rating: 4.9,
    coordinates: { lat: 34.1526, lng: 77.5771 },
    topAttractions: ["Pangong Tso Lake", "Nubra Valley", "Khardung La Pass", "Magnetic Hill"],
    featured: true
  },
  {
    name: "Rishikesh",
    country: "India",
    stateOrRegion: "Uttarakhand",
    category: "Spiritual",
    description: "Yoga Capital of the World on the foothills of Himalayas. Renowned for White Water River Rafting, Parmarth Niketan Ganga Aarti, and riverside cafes.",
    imageUrl: "https://images.unsplash.com/photo-1598977123118-4e30ba3c4f5b?auto=format&fit=crop&w=800&q=80",
    budgetLevel: "Pocket-Friendly",
    estimatedCostPerDayInr: 1800,
    travelVibes: ["Spiritual", "Adventure", "Nature"],
    bestSeasons: ["Spring", "Autumn"],
    idealDurationDays: 3,
    rating: 4.8,
    coordinates: { lat: 30.0869, lng: 78.2676 },
    topAttractions: ["Laxman Jhula", "White Water Rafting", "Beatles Ashram", "Parmarth Ganga Aarti"],
    featured: true
  },
  {
    name: "Amritsar (Golden Temple)",
    country: "India",
    stateOrRegion: "Punjab",
    category: "Spiritual",
    description: "Home to the revered Harmandir Sahib (Golden Temple), world's largest community kitchen (Langar), Wagah Border ceremony, and legendary Punjabi food.",
    imageUrl: "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=800&q=80",
    budgetLevel: "Pocket-Friendly",
    estimatedCostPerDayInr: 1600,
    travelVibes: ["Spiritual", "Heritage", "Foodie", "Family"],
    bestSeasons: ["Winter", "Autumn"],
    idealDurationDays: 2,
    rating: 4.9,
    coordinates: { lat: 31.6340, lng: 74.8723 },
    topAttractions: ["Golden Temple", "Wagah Border Ceremony", "Jallianwala Bagh", "Amritsari Kulcha Trail"],
    featured: true
  }
];

// Seed initial database destinations
const seedDestinations = async (req, res) => {
  try {
    // Clear and re-seed for clean Indian data update
    await Destination.deleteMany({});
    await Destination.insertMany(initialDestinations);
    if (res) return res.status(201).json({ message: "Successfully seeded Indian destinations", data: initialDestinations });
  } catch (error) {
    if (res) res.status(500).json({ error: error.message });
  }
};

const getAllDestinations = async (req, res) => {
  try {
    const { search, category, budget, vibe } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { stateOrRegion: { $regex: search, $options: 'i' } },
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
      destinations = initialDestinations.filter(d => {
        if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.stateOrRegion.toLowerCase().includes(search.toLowerCase())) return false;
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

const getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;
    let destination = null;

    try {
      destination = await Destination.findById(id);
    } catch (e) {
      destination = initialDestinations.find(d => d.name.toLowerCase() === id.toLowerCase());
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

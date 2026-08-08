// -----------------------------------------------------------------------------
// Indian Landmark Knowledge Base (src/utils/indianLandmarks.js)
// -----------------------------------------------------------------------------

/**
 * Known real-world attractions and location images for Indian cities & regions
 */
const INDIAN_LANDMARKS = {
  nanded: {
    name: "Nanded",
    stateOrRegion: "Maharashtra",
    category: "Spiritual & Historical",
    imageUrl: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 19.1383, lng: 77.3210 },
    topAttractions: [
      "Takht Sachkhand Sri Hazur Abchalnagar Sahib Gurudwara",
      "Gurudwara Shikar Ghat Sahib",
      "Nanded Fort & Godavari River View",
      "Kaleshwar Temple & Vishnupuri Dam",
      "Gurudwara Nagina Ghat Sahib"
    ],
    locationImages: [
      "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80"
    ],
    stayRecommendation: "Yatri Niwas near Hazur Sahib / Hotel Kaveri",
    foodSpot: "Hazur Sahib Guru Ka Langar & Nanded Maharashtrian Dhaba"
  },
  amritsar: {
    name: "Amritsar",
    stateOrRegion: "Punjab",
    category: "Spiritual & Historical",
    imageUrl: "https://images.unsplash.com/photo-1588096344356-9b48c3b28b6d?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 31.6340, lng: 74.8723 },
    topAttractions: [
      "Sri Harmandir Sahib (Golden Temple)",
      "Jallianwala Bagh Memorial",
      "Wagah Border Retreat Ceremony",
      "Gobindgarh Fort",
      "Partition Museum & Heritage Street"
    ],
    locationImages: [
      "https://images.unsplash.com/photo-1588096344356-9b48c3b28b6d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80"
    ],
    stayRecommendation: "Guesthouse near Golden Temple / Hotel Ramada",
    foodSpot: "Kesar Da Dhaba & Amritsari Kulcha Land"
  },
  ujjain: {
    name: "Ujjain",
    stateOrRegion: "Madhya Pradesh",
    category: "Spiritual",
    imageUrl: "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 23.1765, lng: 75.7885 },
    topAttractions: [
      "Mahakaleshwar Jyotirlinga Temple & Bhasma Aarti",
      "Ram Ghat Shipra River Evening Aarti",
      "Kal Bhairav Temple",
      "Harsiddhi Mata Shaktipeeth Temple",
      "Vedh Shala (Jantar Mantar Observatory)"
    ],
    locationImages: [
      "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=800&q=80"
    ],
    stayRecommendation: "Hotel near Mahakal Corridor / Bhakta Niwas",
    foodSpot: "Famous Ujjain Poha Jalebi & Malwa Thali Dhaba"
  },
  ayodhya: {
    name: "Ayodhya",
    stateOrRegion: "Uttar Pradesh",
    category: "Spiritual",
    imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 26.7922, lng: 82.1998 },
    topAttractions: [
      "Shri Ram Janmabhoomi Mandir",
      "Hanuman Garhi Temple",
      "Kanak Bhawan",
      "Saryu River Ghat Aarti & Deepotsav",
      "Guptar Ghat"
    ],
    locationImages: [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80"
    ],
    stayRecommendation: "Yatri Niwas near Ram Path / Hotel Ayodhya",
    foodSpot: "Shri Ram Thali & Local Ayodhya Awadhi Dhaba"
  },
  varanasi: {
    name: "Varanasi (Kashi)",
    stateOrRegion: "Uttar Pradesh",
    category: "Spiritual",
    imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 25.3176, lng: 82.9739 },
    topAttractions: [
      "Kashi Vishwanath Temple & Corridor",
      "Dashashwamedh Ghat Evening Ganga Aarti",
      "Sarnath Ancient Stupa & Museum",
      "Assi Ghat Morning Subah-e-Banaras Yoga & Aarti",
      "Manikarnika & Harishchandra Ghats"
    ],
    locationImages: [
      "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80"
    ],
    stayRecommendation: "Heritage Hotel on Ghats / Yatri Niwas",
    foodSpot: "Kashi Chat Bhandar & Blue Lassi Shop"
  },
  manali: {
    name: "Manali",
    stateOrRegion: "Himachal Pradesh",
    category: "Hill Station",
    imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 32.2432, lng: 77.1892 },
    topAttractions: [
      "Solang Valley Snow Point & Paragliding",
      "Hadimba Devi Wooden Temple",
      "Atal Tunnel & Sissu Lahaul Valley",
      "Old Manali Cafe & Handicraft Trail",
      "Vashisht Hot Springs"
    ],
    locationImages: [
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80"
    ],
    stayRecommendation: "Riverside Resort / Mountain Homestay",
    foodSpot: "Old Manali Trout Fish & Himachali Dham Dhaba"
  },
  goa: {
    name: "Goa",
    stateOrRegion: "Goa",
    category: "Beach",
    imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 15.2993, lng: 74.1240 },
    topAttractions: [
      "Baga & Calangute Beach Water Sports",
      "Dudhsagar Four-Tier Waterfalls",
      "Fontainhas Latin Heritage Quarter Walk",
      "Fort Aguada & Lighthouse",
      "Basilica of Bom Jesus (Old Goa)"
    ],
    locationImages: [
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80"
    ],
    stayRecommendation: "Coastal Beach Resort / Boutique Villa",
    foodSpot: "Goan Fish Thali Shack & Portuguese Bakery"
  },
  jaipur: {
    name: "Jaipur (Pink City)",
    stateOrRegion: "Rajasthan",
    category: "Heritage",
    imageUrl: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 26.9124, lng: 75.7873 },
    topAttractions: [
      "Amer Fort & Sheesh Mahal",
      "Hawa Mahal (Palace of Winds)",
      "City Palace & Jantar Mantar Observatory",
      "Nahargarh Fort Sunset Viewpoint",
      "Johari & Bapu Bazaar Shopping Trail"
    ],
    locationImages: [
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80"
    ],
    stayRecommendation: "Heritage Haveli / Hotel Palace",
    foodSpot: "LMB Johari Bazaar & Rawat Pyaz Kachori"
  },
  rishikesh: {
    name: "Rishikesh",
    stateOrRegion: "Uttarakhand",
    category: "Spiritual & Adventure",
    imageUrl: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 30.0869, lng: 78.2676 },
    topAttractions: [
      "Triveni Ghat Evening Maha Aarti",
      "Laxman Jhula & Ram Jhula Suspension Bridges",
      "Beatles Ashram (Chaurasi Kutia)",
      "Shivpuri White Water River Rafting",
      "Neelkanth Mahadev Temple"
    ],
    locationImages: [
      "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80"
    ],
    stayRecommendation: "Riverside Yoga Ashram / Camping Resort",
    foodSpot: "Chotiwala Restaurant & Freedom Cafe Rishikesh"
  },
  kerala: {
    name: "Kerala Backwaters & Munnar",
    stateOrRegion: "Kerala",
    category: "Nature & Backwaters",
    imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 9.4981, lng: 76.3388 },
    topAttractions: [
      "Alleppey Houseboat Backwater Cruise",
      "Munnar Tea Gardens & Eravikulam Park",
      "Varkala Cliff Beach & Sunset View",
      "Fort Kochi Chinese Fishing Nets & Heritage Walk",
      "Kathakali Cultural Dance Center"
    ],
    locationImages: [
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80"
    ],
    stayRecommendation: "Traditional Alleppey Houseboat / Tea Estate Resort",
    foodSpot: "Kerala Sadya Thali & Karimeen Pollichathu Shack"
  }
};

/**
 * Resolves exact or fuzzy landmark details for any input Indian destination name
 */
const getLandmarksForDestination = (inputDestName) => {
  if (!inputDestName) return null;
  const cleanKey = inputDestName.trim().toLowerCase();

  for (const key of Object.keys(INDIAN_LANDMARKS)) {
    if (cleanKey.includes(key) || key.includes(cleanKey)) {
      return INDIAN_LANDMARKS[key];
    }
  }

  return null;
};

module.exports = {
  INDIAN_LANDMARKS,
  getLandmarksForDestination
};

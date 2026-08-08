// -----------------------------------------------------------------------------
// Indian Landmark Knowledge Base (src/utils/indianLandmarks.js)
// -----------------------------------------------------------------------------

/**
 * Known real-world attractions and landmarks for Indian cities & regions
 */
const INDIAN_LANDMARKS = {
  nanded: {
    name: "Nanded",
    stateOrRegion: "Maharashtra",
    category: "Spiritual & Historical",
    coordinates: { lat: 19.1383, lng: 77.3210 },
    topAttractions: [
      "Takht Sachkhand Sri Hazur Abchalnagar Sahib Gurudwara",
      "Gurudwara Shikar Ghat Sahib",
      "Nanded Fort & Godavari River View",
      "Kaleshwar Temple & Vishnupuri Dam",
      "Gurudwara Nagina Ghat Sahib"
    ],
    stayRecommendation: "Yatri Niwas near Hazur Sahib / Hotel Kaveri",
    foodSpot: "Hazur Sahib Guru Ka Langar & Nanded Maharashtrian Dhaba"
  },
  amritsar: {
    name: "Amritsar",
    stateOrRegion: "Punjab",
    category: "Spiritual & Historical",
    coordinates: { lat: 31.6340, lng: 74.8723 },
    topAttractions: [
      "Sri Harmandir Sahib (Golden Temple)",
      "Jallianwala Bagh Memorial",
      "Wagah Border Retreat Ceremony",
      "Gobindgarh Fort",
      "Partition Museum & Heritage Street"
    ],
    stayRecommendation: "Guesthouse near Golden Temple / Hotel Ramada",
    foodSpot: "Kesar Da Dhaba & Amritsari Kulcha Land"
  },
  ujjain: {
    name: "Ujjain",
    stateOrRegion: "Madhya Pradesh",
    category: "Spiritual",
    coordinates: { lat: 23.1765, lng: 75.7885 },
    topAttractions: [
      "Mahakaleshwar Jyotirlinga Temple & Bhasma Aarti",
      "Ram Ghat Shipra River Evening Aarti",
      "Kal Bhairav Temple",
      "Harsiddhi Mata Shaktipeeth Temple",
      "Vedh Shala (Jantar Mantar Observatory)"
    ],
    stayRecommendation: "Hotel near Mahakal Corridor / Bhakta Niwas",
    foodSpot: "Famous Ujjain Poha Jalebi & Malwa Thali Dhaba"
  },
  ayodhya: {
    name: "Ayodhya",
    stateOrRegion: "Uttar Pradesh",
    category: "Spiritual",
    coordinates: { lat: 26.7922, lng: 82.1998 },
    topAttractions: [
      "Shri Ram Janmabhoomi Mandir",
      "Hanuman Garhi Temple",
      "Kanak Bhawan",
      "Saryu River Ghat Aarti & Deepotsav",
      "Guptar Ghat"
    ],
    stayRecommendation: "Yatri Niwas near Ram Path / Hotel Ayodhya",
    foodSpot: "Shri Ram Thali & Local Ayodhya Awadhi Dhaba"
  },
  varanasi: {
    name: "Varanasi (Kashi)",
    stateOrRegion: "Uttar Pradesh",
    category: "Spiritual",
    coordinates: { lat: 25.3176, lng: 82.9739 },
    topAttractions: [
      "Kashi Vishwanath Temple & Corridor",
      "Dashashwamedh Ghat Evening Ganga Aarti",
      "Sarnath Ancient Stupa & Museum",
      "Assi Ghat Morning Subah-e-Banaras Yoga & Aarti",
      "Manikarnika & Harishchandra Ghats"
    ],
    stayRecommendation: "Heritage Hotel on Ghats / Yatri Niwas",
    foodSpot: "Kashi Chat Bhandar & Blue Lassi Shop"
  },
  manali: {
    name: "Manali",
    stateOrRegion: "Himachal Pradesh",
    category: "Hill Station",
    coordinates: { lat: 32.2432, lng: 77.1892 },
    topAttractions: [
      "Solang Valley Snow Point & Paragliding",
      "Hadimba Devi Wooden Temple",
      "Atal Tunnel & Sissu Lahaul Valley",
      "Old Manali Cafe & Handicraft Trail",
      "Vashisht Hot Springs"
    ],
    stayRecommendation: "Riverside Resort / Mountain Homestay",
    foodSpot: "Old Manali Trout Fish & Himachali Dham Dhaba"
  },
  goa: {
    name: "Goa",
    stateOrRegion: "Goa",
    category: "Beach",
    coordinates: { lat: 15.2993, lng: 74.1240 },
    topAttractions: [
      "Baga & Calangute Beach Water Sports",
      "Dudhsagar Four-Tier Waterfalls",
      "Fontainhas Latin Heritage Quarter Walk",
      "Fort Aguada & Lighthouse",
      "Basilica of Bom Jesus (Old Goa)"
    ],
    stayRecommendation: "Coastal Beach Resort / Boutique Villa",
    foodSpot: "Goan Fish Thali Shack & Portuguese Bakery"
  },
  jaipur: {
    name: "Jaipur (Pink City)",
    stateOrRegion: "Rajasthan",
    category: "Heritage",
    coordinates: { lat: 26.9124, lng: 75.7873 },
    topAttractions: [
      "Amer Fort & Sheesh Mahal",
      "Hawa Mahal (Palace of Winds)",
      "City Palace & Jantar Mantar Observatory",
      "Nahargarh Fort Sunset Viewpoint",
      "Johari & Bapu Bazaar Shopping Trail"
    ],
    stayRecommendation: "Heritage Haveli / Hotel Palace",
    foodSpot: "LMB Johari Bazaar & Rawat Pyaz Kachori"
  },
  rishikesh: {
    name: "Rishikesh",
    stateOrRegion: "Uttarakhand",
    category: "Spiritual & Adventure",
    coordinates: { lat: 30.0869, lng: 78.2676 },
    topAttractions: [
      "Triveni Ghat Evening Maha Aarti",
      "Laxman Jhula & Ram Jhula Suspension Bridges",
      "Beatles Ashram (Chaurasi Kutia)",
      "Shivpuri White Water River Rafting",
      "Neelkanth Mahadev Temple"
    ],
    stayRecommendation: "Riverside Yoga Ashram / Camping Resort",
    foodSpot: "Chotiwala Restaurant & Freedom Cafe Rishikesh"
  },
  haridwar: {
    name: "Haridwar",
    stateOrRegion: "Uttarakhand",
    category: "Spiritual",
    coordinates: { lat: 29.9457, lng: 78.1642 },
    topAttractions: [
      "Har Ki Pauri Holy Ganga Aarti",
      "Mansa Devi Temple Cable Car Ride",
      "Chandi Devi Temple Hilltop",
      "Maya Devi Shaktipeeth Temple",
      "Daksheshwar Mahadev Temple Kankhal"
    ],
    stayRecommendation: "Dharamshala near Har Ki Pauri / Riverside Hotel",
    foodSpot: "Mathura Walo Ki Pracheen Dukan & Pandit Ji Poori"
  },
  shirdi: {
    name: "Shirdi",
    stateOrRegion: "Maharashtra",
    category: "Spiritual",
    coordinates: { lat: 19.7667, lng: 74.4767 },
    topAttractions: [
      "Shri Saibaba Samadhi Mandir",
      "Dwarkamai Mosque & Sacred Dhuni",
      "Chavadi & Lendi Baug Gardens",
      "Khandoba Raya Temple",
      "Shani Shingnapur Day Excursion"
    ],
    stayRecommendation: "Sansthan Bhakta Niwas / Sai Palace Hotel",
    foodSpot: "Sai Sansthan Prasadalaya & Maharashtrian Dhaba"
  },
  kerala: {
    name: "Kerala Backwaters & Munnar",
    stateOrRegion: "Kerala",
    category: "Nature & Backwaters",
    coordinates: { lat: 9.4981, lng: 76.3388 },
    topAttractions: [
      "Alleppey Houseboat Backwater Cruise",
      "Munnar Tea Gardens & Eravikulam Park",
      "Varkala Cliff Beach & Sunset View",
      "Fort Kochi Chinese Fishing Nets & Heritage Walk",
      "Kathakali Cultural Dance Center"
    ],
    stayRecommendation: "Traditional Alleppey Houseboat / Tea Estate Resort",
    foodSpot: "Kerala Sadya Thali & Karimeen Pollichathu Shack"
  },
  agra: {
    name: "Agra",
    stateOrRegion: "Uttar Pradesh",
    category: "Heritage",
    coordinates: { lat: 27.1767, lng: 78.0081 },
    topAttractions: [
      "Taj Mahal Sunrise Monument View",
      "Agra Red Fort & Royal Palaces",
      "Mehtab Bagh Taj Sunset Viewpoint",
      "Fatehpur Sikri Buland Darwaza",
      "Itimad-ud-Daulah (Baby Taj)"
    ],
    stayRecommendation: "Taj View Hotel / Boutique Homestay",
    foodSpot: "Panchhi Petha Store & Pinch of Spice Agra"
  },
  shimla: {
    name: "Shimla",
    stateOrRegion: "Himachal Pradesh",
    category: "Hill Station",
    coordinates: { lat: 31.1048, lng: 77.1734 },
    topAttractions: [
      "The Ridge & Mall Road Promenade",
      "Jakhu Hanuman Temple & Giant Statue",
      "Kufri Snow Adventure Point",
      "Christ Church & Scandal Point",
      "Kalka-Shimla Heritage Toy Train"
    ],
    stayRecommendation: "Colonial Heritage Hotel / Pine Cottage",
    foodSpot: "Indian Coffee House Mall Road & Local Dhaba"
  },
  puri: {
    name: "Puri",
    stateOrRegion: "Odisha",
    category: "Spiritual & Beach",
    coordinates: { lat: 19.8135, lng: 85.8312 },
    topAttractions: [
      "Shree Jagannath Temple",
      "Puri Golden Beach & Sand Art",
      "Konark Sun Temple (Black Pagoda)",
      "Chilika Lake Dolphin Sanctuary & Sea Mouth",
      "Swargadwar Handicrafts Market"
    ],
    stayRecommendation: "Beachfront Resort / Bhakta Niwas",
    foodSpot: "Jagannath Temple Mahaprasad & Odia Seafood Dhaba"
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

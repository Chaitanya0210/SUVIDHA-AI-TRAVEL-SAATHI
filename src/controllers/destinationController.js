// -----------------------------------------------------------------------------
// Destination Controller (src/controllers/destinationController.js)
// -----------------------------------------------------------------------------
const Destination = require('../models/Destination');
const { seedDatabase, initialDestinations } = require('../utils/seeder');
const AppError = require('../utils/appError');

/**
 * Seed initial database destinations via API (forced reload)
 */
const seedDestinations = async (req, res, next) => {
  try {
    await seedDatabase(true);
    res.status(201).json({
      status: 'success',
      message: "Successfully seeded Indian destinations",
      data: initialDestinations
    });
  } catch (error) {
    next(new AppError(`Seeding failed: ${error.message}`, 500));
  }
};

/**
 * Get all destinations with search & filters
 */
const getAllDestinations = async (req, res, next) => {
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
    } catch (dbError) {
      console.warn('⚠️ MongoDB unavailable, falling back to local memory filtering.', dbError.message);
      // Operational fallback for in-memory read-only support
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
    next(error);
  }
};

/**
 * Get single destination details by name or ID
 */
const getDestinationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let destination = null;

    try {
      destination = await Destination.findById(id);
    } catch (e) {
      destination = initialDestinations.find(d => d.name.toLowerCase() === id.toLowerCase());
    }

    if (!destination) {
      return next(new AppError('Destination not found', 404));
    }

    res.status(200).json({ status: 'success', data: destination });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  seedDestinations,
  getAllDestinations,
  getDestinationById,
  initialDestinations
};

// -----------------------------------------------------------------------------
// Declarative Input Validation Middleware (src/middleware/validate.js)
// -----------------------------------------------------------------------------
const { ValidationError } = require('../utils/appError');

const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && re.test(email.trim());
};

const validateRegisterInput = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return next(new ValidationError('Name must be at least 2 characters long.'));
  }
  if (!email || !isValidEmail(email)) {
    return next(new ValidationError('Please provide a valid email address.'));
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return next(new ValidationError('Password must be at least 6 characters long.'));
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  next();
};

const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !isValidEmail(email)) {
    return next(new ValidationError('Please provide a valid email address.'));
  }
  if (!password || typeof password !== 'string' || password.length === 0) {
    return next(new ValidationError('Please provide your password.'));
  }

  req.body.email = email.trim().toLowerCase();
  next();
};

const validateAiPlannerInput = (req, res, next) => {
  const { destination, durationDays, budgetLevel, travelVibe, groupType } = req.body;

  if (!destination || typeof destination !== 'string' || destination.trim().length < 2) {
    return next(new ValidationError('Please specify a valid destination name (minimum 2 characters).'));
  }

  const days = parseInt(durationDays, 10);
  if (isNaN(days) || days < 1 || days > 30) {
    return next(new ValidationError('Duration must be between 1 and 30 days.'));
  }

  const validBudgets = ['Pocket-Friendly', 'Standard', 'Royal-Luxury', 'Budget', 'Mid-Range', 'Luxury'];
  if (budgetLevel && !validBudgets.includes(budgetLevel)) {
    return next(new ValidationError(`Budget level must be one of: ${validBudgets.join(', ')}`));
  }

  req.body.destination = destination.trim();
  req.body.durationDays = days;
  next();
};

const validateDestinationsQuery = (req, res, next) => {
  const { page, limit, search } = req.query;

  if (page) {
    const pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      return next(new ValidationError('Page parameter must be a positive integer.'));
    }
    req.query.page = pageNum;
  }

  if (limit) {
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return next(new ValidationError('Limit parameter must be an integer between 1 and 100.'));
    }
    req.query.limit = limitNum;
  }

  if (search && typeof search === 'string') {
    req.query.search = search.trim();
  }

  next();
};

const validateSubscriptionUpgrade = (req, res, next) => {
  const { plan } = req.body;
  const validPlans = ['monthly', 'annual'];

  if (plan && !validPlans.includes(plan)) {
    return next(new ValidationError(`Subscription plan must be one of: ${validPlans.join(', ')}`));
  }

  next();
};

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  validateAiPlannerInput,
  validateDestinationsQuery,
  validateSubscriptionUpgrade
};

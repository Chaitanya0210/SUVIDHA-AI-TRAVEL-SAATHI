// -----------------------------------------------------------------------------
// Automated Integration & Verification Test Suite (tests/apiTests.js)
// -----------------------------------------------------------------------------
const http = require('http');

const BASE_URL = 'http://localhost:5000';

const makeRequest = (path, method = 'GET', data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 Starting SUVIDHA AI TRAVEL SAATHI Automated Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✅ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Health Endpoint Test
    console.log('1. Testing Health Checks...');
    const healthRes = await makeRequest('/api/v1/health');
    assert(healthRes.status === 200 && healthRes.body.success === true, 'GET /api/v1/health returns 200 OK & success');

    // 2. Destinations List Test
    console.log('\n2. Testing Destination APIs...');
    const destRes = await makeRequest('/api/v1/destinations');
    assert(destRes.status === 200 && destRes.body.results > 0, 'GET /api/v1/destinations returns seeded Indian destinations');

    // 3. User Authentication Test
    console.log('\n3. Testing Auth Endpoints...');
    const loginRes = await makeRequest('/api/v1/auth/login', 'POST', { email: 'demo@suvidha.com', password: 'password123' });
    assert(loginRes.status === 200 && loginRes.body.success === true && !!loginRes.body.data.accessToken, 'POST /api/v1/auth/login issues JWT access token');

    const invalidAuthRes = await makeRequest('/api/v1/auth/register', 'POST', { email: 'invalid-email', password: '123' });
    assert(invalidAuthRes.status === 400 && invalidAuthRes.body.error.code === 'VALIDATION_ERROR', 'POST /api/v1/auth/register rejects invalid email format');

    // 4. Recommendation Engine Test (Chunk 3 & 6)
    console.log('\n4. Testing Recommendation Engine...');
    const recRes = await makeRequest('/api/v1/recommendations', 'POST', {
      budget: 20000,
      duration: 4,
      group: 'couple',
      vibes: ['nature', 'adventure']
    });
    assert(recRes.status === 200 && recRes.body.success === true && recRes.body.data.recommendations.length > 0, 'POST /api/v1/recommendations ranks candidates with matchScores');

    // 5. AI Planner Engine Test (Chunk 4 & 5)
    console.log('\n5. Testing AI Planner & Route Engine...');
    const planRes = await makeRequest('/api/v1/ai-planner/generate-plan', 'POST', {
      destination: 'Manali',
      durationDays: 3,
      budgetLevel: 'Standard',
      travelVibe: 'Himalayan Trek',
      groupType: 'Couple'
    });
    assert(planRes.status === 200 && planRes.body.success === true && planRes.body.data.days.length === 3, 'POST /api/v1/ai-planner/generate-plan produces 3-day plan with route metrics');
    assert(!!planRes.body.data.days[0].routeMetrics && planRes.body.data.days[0].stops.length > 0, 'Itinerary days contain routeMetrics and ordered stops');

    // 6. Interaction Tracking Test (Chunk 6)
    console.log('\n6. Testing Interaction Tracking...');
    const interRes = await makeRequest('/api/v1/interactions', 'POST', {
      action: 'wishlist_add',
      destinationName: 'Manali',
      userId: 'test_user_suite_1',
      metadata: { vibe: 'Nature' }
    });
    assert(interRes.status === 201 && interRes.body.success === true, 'POST /api/v1/interactions records user action');

    // 7. Input Validation Boundary Test
    console.log('\n7. Testing Input Validation Boundaries...');
    const invalidPlanRes = await makeRequest('/api/v1/ai-planner/generate-plan', 'POST', {
      destination: 'Manali',
      durationDays: 45
    });
    assert(invalidPlanRes.status === 400 && invalidPlanRes.body.error.code === 'VALIDATION_ERROR', 'Rejects durationDays > 30 with VALIDATION_ERROR');

  } catch (err) {
    console.error('⚠️ Test suite execution error:', err.message);
    failed++;
  }

  console.log(`\n=======================================================`);
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`=======================================================\n`);

  process.exit(failed > 0 ? 1 : 0);
};

runTests();

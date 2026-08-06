// -----------------------------------------------------------------------------
// SUVIDHA AI TRAVEL SAATHI - Main Application Frontend JS (main.js)
// -----------------------------------------------------------------------------

let map = null;
let currentMarker = null;
let destinationsData = [];
let wishlist = JSON.parse(localStorage.getItem('suvidha_wishlist') || '[]');
let isRegisterMode = false;

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  loadDestinations();
  updateWishlistCount();
  checkUserSession();

  const aiForm = document.getElementById('ai-planner-form');
  if (aiForm) {
    aiForm.addEventListener('submit', handleAiPlannerSubmit);
  }

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const filtered = destinationsData.filter(d =>
        d.name.toLowerCase().includes(searchTerm) ||
        (d.stateOrRegion && d.stateOrRegion.toLowerCase().includes(searchTerm)) ||
        d.description.toLowerCase().includes(searchTerm)
      );
      renderDestinationsGrid(filtered);
    });
  }
});

// -----------------------------------------------------------------------------
// Leaflet OpenStreetMap Initialization
// -----------------------------------------------------------------------------
function initMap() {
  // Center map over India (Lat: 20.5937, Lng: 78.9629)
  map = L.map('map').setView([20.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  currentMarker = L.marker([25.3176, 82.9739]).addTo(map)
    .bindPopup('<b>SUVIDHA AI BHARAT SAATHI</b><br>Varanasi (Kashi) - Sacred Ganga Ghats & Temples')
    .openPopup();
}

function updateMapMarker(lat, lng, title, text) {
  if (!map) return;
  map.setView([lat, lng], 11, { animate: true });
  if (currentMarker) {
    map.removeLayer(currentMarker);
  }
  currentMarker = L.marker([lat, lng]).addTo(map)
    .bindPopup(`<b>${title}</b><br>${text}`)
    .openPopup();
}

// -----------------------------------------------------------------------------
// Fetch & Render Destinations
// -----------------------------------------------------------------------------
async function loadDestinations() {
  try {
    const res = await fetch('/api/destinations');
    const json = await res.json();
    if (json.status === 'success') {
      destinationsData = json.data;
      renderDestinationsGrid(destinationsData);
    }
  } catch (error) {
    console.error('Error fetching destinations:', error);
    showToast('Could not load destinations from server', 'error');
  }
}

function renderDestinationsGrid(items) {
  const grid = document.getElementById('destinations-grid');
  if (!grid) return;

  if (!items || items.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">No Indian destinations match your filter criteria.</div>`;
    return;
  }

  grid.innerHTML = items.map(d => {
    const isBookmarked = wishlist.some(item => item.name === d.name);
    const costInr = d.estimatedCostPerDayInr || d.estimatedCostPerDay || 2500;

    return `
      <div class="glass-panel card">
        <div class="card-img-wrap">
          <img src="${d.imageUrl}" alt="${d.name}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800'">
          <span class="card-badge">${d.category}</span>
          ${d.matchPercentage ? `<span class="card-match-badge">${d.matchPercentage}% Match</span>` : ''}
        </div>
        <div class="card-body">
          <div class="card-title-wrap">
            <h3 class="card-title">${d.name}</h3>
            <span class="card-rating"><i class="fa-solid fa-star"></i> ${d.rating || 4.8}</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--accent-cyan); font-weight: 600; margin-bottom: 0.4rem;">
            📍 ${d.stateOrRegion || 'India'}, India
          </div>
          <p class="card-desc">${d.description}</p>
          
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1rem;">
            ${(d.travelVibes || []).map(v => `<span style="font-size: 0.75rem; background: rgba(255,255,255,0.06); padding: 0.2rem 0.6rem; border-radius: 12px; color: var(--accent-amber);">${v}</span>`).join('')}
          </div>

          <div class="card-meta">
            <div class="card-price">₹${costInr.toLocaleString('en-IN')} <span>/ day est.</span></div>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-secondary" onclick="toggleBookmark('${d.name}')" title="Bookmark">
                <i class="fa-${isBookmarked ? 'solid' : 'regular'} fa-bookmark" style="color: var(--accent-amber);"></i>
              </button>
              <button class="btn btn-primary" onclick="viewDestinationDetail('${d.name}')">Plan Trip</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function filterDestinations(category, element) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  if (element) element.classList.add('active');

  if (category === 'all') {
    renderDestinationsGrid(destinationsData);
  } else {
    const filtered = destinationsData.filter(d => d.category === category);
    renderDestinationsGrid(filtered);
  }
}

// -----------------------------------------------------------------------------
// AI Planner Submission Handler
// -----------------------------------------------------------------------------
async function handleAiPlannerSubmit(e) {
  e.preventDefault();

  const destination = document.getElementById('destination-input').value;
  const durationDays = document.getElementById('duration-select').value;
  const budgetLevel = document.getElementById('budget-select').value;
  const travelVibe = document.getElementById('vibe-select').value;
  const groupType = document.getElementById('group-select').value;

  const btn = document.getElementById('generate-btn');
  const originalBtnText = btn.innerHTML;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Bharat AI Saathi Planning...`;
  btn.disabled = true;

  try {
    const response = await fetch('/api/ai-planner/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination, durationDays, budgetLevel, travelVibe, groupType })
    });

    const json = await response.json();

    if (json.status === 'success') {
      const plan = json.data;
      renderItineraryView(plan);
      if (plan.coordinates) {
        updateMapMarker(plan.coordinates.lat, plan.coordinates.lng, plan.destinationName, `Custom ${plan.durationDays}-Day ${plan.travelVibe} Trip`);
      }
      showToast(`Generated ₹ INR Trip Plan for ${plan.destinationName}!`, 'success');
      
      document.getElementById('workspace').scrollIntoView({ behavior: 'smooth' });
    } else {
      showToast(json.message || 'Failed to generate itinerary', 'error');
    }
  } catch (error) {
    console.error('AI Planning Error:', error);
    showToast('Error generating AI plan. Please check server.', 'error');
  } finally {
    btn.innerHTML = originalBtnText;
    btn.disabled = false;
  }
}

function renderItineraryView(plan) {
  const output = document.getElementById('itinerary-output');
  if (!output) return;

  const totalCostInr = plan.estimatedTotalCostInr || plan.estimatedTotalCost || (plan.durationDays * 3500);

  output.innerHTML = `
    <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
        <h2 style="font-size: 1.6rem;">🇮🇳 ${plan.destinationName}, ${plan.stateOrRegion || 'India'}</h2>
        <span style="background: var(--gradient-main); color: #000; padding: 0.25rem 0.75rem; border-radius: 12px; font-weight: 700; font-size: 0.85rem;">
          ${plan.durationDays} Days • ${plan.budgetLevel}
        </span>
      </div>
      <p style="color: var(--text-secondary); margin-top: 0.5rem; font-size: 0.95rem;">${plan.aiRationale}</p>
      
      <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; margin-top: 1rem; background: rgba(255,255,255,0.04); padding: 0.8rem 1rem; border-radius: 8px;">
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">ESTIMATED TOTAL COST</span>
          <strong style="color: var(--accent-emerald); font-size: 1.3rem;">₹${totalCostInr.toLocaleString('en-IN')} INR</strong>
        </div>
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">TRAVEL VIBE</span>
          <strong style="color: var(--accent-amber); font-size: 1.05rem;">${plan.travelVibe}</strong>
        </div>
      </div>

      ${plan.transportAdvice ? `
        <div style="margin-top: 0.75rem; font-size: 0.85rem; background: rgba(6, 182, 212, 0.1); border-left: 3px solid var(--accent-cyan); padding: 0.5rem 0.8rem; border-radius: 4px;">
          <strong>🚂 Transport Advice:</strong> ${plan.transportAdvice}
        </div>
      ` : ''}

      ${plan.foodAdvice ? `
        <div style="margin-top: 0.5rem; font-size: 0.85rem; background: rgba(245, 158, 11, 0.1); border-left: 3px solid var(--accent-amber); padding: 0.5rem 0.8rem; border-radius: 4px;">
          <strong>🍲 Food & Dhaba Trail:</strong> ${plan.foodAdvice}
        </div>
      ` : ''}
    </div>

    <div>
      <h3 style="font-size: 1.2rem; margin-bottom: 1rem;">Day-by-Day Itinerary Schedule</h3>
      ${plan.itinerary.map(day => `
        <div class="itinerary-day-card">
          <div class="itinerary-day-title">${day.theme}</div>
          <div class="itinerary-slot"><strong>🌅 Morning:</strong> ${day.morning}</div>
          <div class="itinerary-slot"><strong>☀️ Afternoon:</strong> ${day.afternoon}</div>
          <div class="itinerary-slot"><strong>🌙 Evening:</strong> ${day.evening}</div>
          <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px dashed var(--border-color); font-size: 0.85rem; color: var(--text-muted); display: flex; justify-content: space-between; flex-wrap: wrap;">
            <span><strong>Stay Recommendation:</strong> ${day.stay}</span>
            <span style="color: var(--accent-emerald); font-weight: 600;">~₹${(day.estimatedDayCostInr || day.estimatedDayCost || 2500).toLocaleString('en-IN')}/day</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// -----------------------------------------------------------------------------
// Destination Detail Modal View
// -----------------------------------------------------------------------------
function viewDestinationDetail(name) {
  const dest = destinationsData.find(d => d.name === name);
  if (!dest) return;

  const costInr = dest.estimatedCostPerDayInr || dest.estimatedCostPerDay || 2500;

  const content = document.getElementById('modal-content-body');
  content.innerHTML = `
    <button class="close-btn" onclick="closeModal('detail-modal')">&times;</button>
    <img src="${dest.imageUrl}" alt="${dest.name}" style="width: 100%; height: 220px; object-fit: cover; border-radius: 12px; margin-bottom: 1rem;">
    <h2 style="font-size: 1.8rem; margin-bottom: 0.2rem;">${dest.name}</h2>
    <div style="color: var(--accent-cyan); font-weight: 600; margin-bottom: 0.8rem;">📍 ${dest.stateOrRegion}, India</div>
    <p style="color: var(--text-secondary); margin-bottom: 1rem;">${dest.description}</p>
    
    <div style="display: flex; gap: 1rem; margin-bottom: 1rem; background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 10px; flex-wrap: wrap;">
      <div><strong>Category:</strong> ${dest.category}</div>
      <div><strong>Best Season:</strong> ${dest.bestSeasons ? dest.bestSeasons.join(', ') : 'Winter, Autumn'}</div>
      <div><strong>Est Cost:</strong> ₹${costInr.toLocaleString('en-IN')}/day</div>
    </div>

    <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Top Attractions</h3>
    <ul style="padding-left: 1.2rem; margin-bottom: 1.5rem; color: var(--text-secondary);">
      ${(dest.topAttractions || ['Main Temple & Ghat Walk', 'Historic Fort & Museum', 'Local Market & Street Food']).map(a => `<li>${a}</li>`).join('')}
    </ul>

    <button class="btn btn-primary" onclick="closeModal('detail-modal'); document.getElementById('destination-input').value='${dest.name}'; handleAiPlannerSubmit(new Event('submit'));" style="width: 100%; justify-content: center;">
      <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Custom ₹ INR Plan for ${dest.name}
    </button>
  `;

  document.getElementById('detail-modal').classList.add('active');
  if (dest.coordinates) {
    updateMapMarker(dest.coordinates.lat, dest.coordinates.lng, dest.name, dest.description);
  }
}

// -----------------------------------------------------------------------------
// Wishlist & User State
// -----------------------------------------------------------------------------
function toggleBookmark(name) {
  const dest = destinationsData.find(d => d.name === name);
  if (!dest) return;

  const index = wishlist.findIndex(item => item.name === name);
  if (index >= 0) {
    wishlist.splice(index, 1);
    showToast(`Removed ${name} from Wishlist`, 'info');
  } else {
    wishlist.push(dest);
    showToast(`Added ${name} to Wishlist!`, 'success');
  }

  localStorage.setItem('suvidha_wishlist', JSON.stringify(wishlist));
  updateWishlistCount();
  renderDestinationsGrid(destinationsData);
}

function updateWishlistCount() {
  const el = document.getElementById('wishlist-count');
  if (el) el.innerText = wishlist.length;
}

// -----------------------------------------------------------------------------
// Auth Modal Logic
// -----------------------------------------------------------------------------
function openAuthModal() {
  document.getElementById('auth-modal').classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function toggleAuthMode() {
  isRegisterMode = !isRegisterMode;
  const nameGroup = document.getElementById('name-group');
  const title = document.getElementById('auth-modal-title');
  const submitBtn = document.getElementById('auth-submit-btn');
  const toggleText = document.getElementById('auth-toggle-text');
  const toggleLink = document.getElementById('auth-toggle-link');

  if (isRegisterMode) {
    nameGroup.style.display = 'flex';
    title.innerText = 'Create Account';
    submitBtn.innerText = 'Register Account';
    toggleText.innerText = 'Already have an account?';
    toggleLink.innerText = 'Login Here';
  } else {
    nameGroup.style.display = 'none';
    title.innerText = 'Welcome Back';
    submitBtn.innerText = 'Login to Account';
    toggleText.innerText = "Don't have an account?";
    toggleLink.innerText = 'Register Here';
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const name = document.getElementById('auth-name').value;

  const endpoint = isRegisterMode ? '/api/auth/register' : '/api/auth/login';
  const payload = isRegisterMode ? { name, email, password } : { email, password };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (json.status === 'success') {
      localStorage.setItem('suvidha_user', JSON.stringify(json.data));
      showToast(`Namaste ${json.data.name}!`, 'success');
      closeModal('auth-modal');
      checkUserSession();
    } else {
      showToast(json.message || 'Authentication failed', 'error');
    }
  } catch (error) {
    console.error('Auth error:', error);
    showToast('Server connection error during authentication', 'error');
  }
}

function checkUserSession() {
  const user = JSON.parse(localStorage.getItem('suvidha_user') || 'null');
  const navItem = document.getElementById('auth-nav-item');
  if (user && navItem) {
    navItem.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-size: 0.9rem; color: var(--accent-emerald);">🙏 Namaste ${user.name}</span>
        <button class="btn btn-secondary" onclick="logoutUser()" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">Logout</button>
      </div>
    `;
  }
}

function logoutUser() {
  localStorage.removeItem('suvidha_user');
  showToast('Logged out successfully', 'info');
  location.reload();
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.borderColor = type === 'error' ? 'var(--accent-rose)' : type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-cyan)';
  toast.innerHTML = `<strong>${type.toUpperCase()}:</strong> ${message}`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

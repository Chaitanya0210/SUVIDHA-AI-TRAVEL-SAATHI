// -----------------------------------------------------------------------------
// SUVIDHA AI TRAVEL SAATHI - Main Application Frontend JS (main.js)
// -----------------------------------------------------------------------------

let map = null;
let currentMarker = null;
let routePolylineLayer = null;
let markersLayerGroup = null;
let destinationsData = [];
let wishlist = JSON.parse(localStorage.getItem('suvidha_wishlist') || '[]');
let currentActivePlan = null;
let userSessionId = localStorage.getItem('suvidha_session_id');

if (!userSessionId) {
  userSessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  localStorage.setItem('suvidha_session_id', userSessionId);
}

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
      if (searchTerm.length >= 3) {
        logInteractionEvent('destination_search', null, '', { searchQuery: searchTerm });
      }
      const filtered = destinationsData.filter(d =>
        d.name.toLowerCase().includes(searchTerm) ||
        (d.stateOrRegion && d.stateOrRegion.toLowerCase().includes(searchTerm)) ||
        d.description.toLowerCase().includes(searchTerm)
      );
      renderDestinationsGrid(filtered);
    });
  }
});

/**
 * Logs user interaction events to backend for personalization & ML dataset readiness
 */
async function logInteractionEvent(action, destinationId, destinationName, metadata = {}) {
  try {
    const user = JSON.parse(localStorage.getItem('suvidha_user') || 'null');
    await fetch('/api/v1/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        destinationId,
        destinationName,
        sessionId: userSessionId,
        userId: user ? user._id : null,
        metadata
      })
    });
  } catch (err) {
    console.warn('Silent interaction log error:', err.message);
  }
}

// -----------------------------------------------------------------------------
// Leaflet OpenStreetMap Initialization
// -----------------------------------------------------------------------------
function initMap() {
  map = L.map('map').setView([20.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  markersLayerGroup = L.layerGroup().addTo(map);
  routePolylineLayer = L.layerGroup().addTo(map);

  currentMarker = L.marker([25.3176, 82.9739]).addTo(markersLayerGroup)
    .bindPopup('<b>SUVIDHA AI BHARAT SAATHI</b><br>Varanasi (Kashi) - Sacred Ganga Ghats & Temples')
    .openPopup();
}

function updateMapMarker(lat, lng, title, text) {
  if (!map) return;
  markersLayerGroup.clearLayers();
  routePolylineLayer.clearLayers();

  map.setView([lat, lng], 11, { animate: true });
  currentMarker = L.marker([lat, lng]).addTo(markersLayerGroup)
    .bindPopup(`<b>${title}</b><br>${text}`)
    .openPopup();
}

function visualizeDayRouteOnMap(dayData, destinationName) {
  if (!map || !dayData) return;

  markersLayerGroup.clearLayers();
  routePolylineLayer.clearLayers();

  const stops = dayData.stops || [];
  if (!stops || stops.length === 0) {
    if (currentActivePlan && currentActivePlan.coordinates) {
      updateMapMarker(currentActivePlan.coordinates.lat, currentActivePlan.coordinates.lng, destinationName || 'Destination', 'Day Route View');
    }
    return;
  }

  const latLngs = [];
  const bounds = [];

  const categoryColors = {
    'Hotel': '#6366f1',
    'Attraction': '#f59e0b',
    'Restaurant': '#f43f5e',
    'Sunset Point': '#10b981',
    'Transit': '#06b6d4'
  };

  stops.forEach((stop, index) => {
    if (stop.lat !== undefined && stop.lng !== undefined) {
      const point = [stop.lat, stop.lng];
      latLngs.push(point);
      bounds.push(point);

      const color = categoryColors[stop.category] || '#6366f1';
      const stopNumber = stop.stopOrder || (index + 1);

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background-color:${color}; color:#fff; border:2px solid #fff; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px; box-shadow:0 3px 6px rgba(0,0,0,0.4);">${stopNumber}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; padding:4px;">
          <strong style="color:${color}; font-size:14px;">Stop ${stopNumber}: ${stop.name}</strong><br>
          <span style="font-size:11px; color:#666;">Category: ${stop.category || 'Sightseeing'} • Est. ${stop.estimatedDurationMinutes || 45} mins</span>
          ${stop.legDistanceKm ? `<br><small style="color:#10b981;">🚗 Leg Distance: ${stop.legDistanceKm} km (${stop.legDurationMins} mins)</small>` : ''}
        </div>
      `;

      L.marker(point, { icon: customIcon }).addTo(markersLayerGroup)
        .bindPopup(popupContent);
    }
  });

  if (latLngs.length > 1) {
    L.polyline(latLngs, {
      color: '#6366f1',
      weight: 4,
      opacity: 0.8,
      dashArray: '6, 8'
    }).addTo(routePolylineLayer);

    map.fitBounds(L.latLngBounds(bounds).pad(0.25));
  } else if (bounds.length > 0) {
    map.setView(bounds[0], 12);
  }
}

// -----------------------------------------------------------------------------
// Fetch & Render Destinations
// -----------------------------------------------------------------------------
async function loadDestinations() {
  try {
    const res = await fetch('/api/destinations');
    const json = await res.json();
    if (json.status === 'success' || json.success) {
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
          <h3 class="card-title">${d.name}</h3>
          <p class="card-region">📍 ${d.stateOrRegion || d.state || 'India'}</p>
          <p class="card-desc">${d.description}</p>

          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.8rem;">
            ${(d.travelVibes || []).slice(0, 3).map(v => `<span class="tag tag-vibe">${v}</span>`).join('')}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.8rem; margin-top: auto;">
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted);">DAILY EST.</span><br>
              <strong style="color: var(--accent-emerald); font-size: 1rem;">₹${costInr.toLocaleString('en-IN')}</strong>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-outline" style="padding: 0.4rem 0.6rem;" onclick="toggleBookmark('${d.name}')">
                <i class="${isBookmarked ? 'fa-solid' : 'fa-regular'} fa-bookmark" style="color: ${isBookmarked ? 'var(--accent-amber)' : 'inherit'}"></i>
              </button>
              <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="selectDestinationForPlanner('${d.name}')">
                Plan Trip
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function selectDestinationForPlanner(name) {
  const destInput = document.getElementById('destination-input');
  if (destInput) {
    destInput.value = name;
    logInteractionEvent('destination_click', null, name);
    document.getElementById('ai-planner-form').scrollIntoView({ behavior: 'smooth' });
  }
}

async function handleAiPlannerSubmit(e) {
  e.preventDefault();
  const destination = document.getElementById('destination-input').value;
  const durationDays = document.getElementById('days-select').value;
  const budgetLevel = document.getElementById('budget-select').value;
  const travelVibe = document.getElementById('vibe-select').value;
  const groupType = document.getElementById('group-select').value;

  const btn = document.getElementById('generate-btn');
  const originalBtnText = btn.innerHTML;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Bharat AI Saathi Planning...`;
  btn.disabled = true;

  logInteractionEvent('trip_generated', null, destination, { durationDays, budgetLevel, vibe: travelVibe, groupType });

  try {
    const response = await fetch('/api/v1/ai-planner/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination, durationDays, budgetLevel, travelVibe, groupType })
    });

    const json = await response.json();

    if (json.success || json.status === 'success') {
      const plan = json.data;
      currentActivePlan = plan;
      renderItineraryView(plan);
      showToast(`Generated ₹ INR Trip Plan for ${plan.destinationName || plan.destination}!`, 'success');
      document.getElementById('workspace').scrollIntoView({ behavior: 'smooth' });
    } else {
      showToast(json.error ? json.error.message : 'Failed to generate itinerary', 'error');
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

  const totalCostInr = plan.estimatedCost ? plan.estimatedCost.total : (plan.estimatedTotalCostInr || plan.durationDays * 3500);
  const destName = plan.destinationName || plan.destination || 'Destination';
  const days = plan.days || plan.itinerary || [];

  output.innerHTML = `
    <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
        <h2 style="font-size: 1.6rem;">🇮🇳 ${destName}</h2>
        <span style="background: var(--gradient-main); color: #000; padding: 0.25rem 0.75rem; border-radius: 12px; font-weight: 700; font-size: 0.85rem;">
          ${plan.durationDays || days.length} Days • ${plan.budgetLevel}
        </span>
      </div>
      <p style="color: var(--text-secondary); margin-top: 0.5rem; font-size: 0.95rem;">${plan.summary || plan.aiRationale || ''}</p>
      
      <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; margin-top: 1rem; background: rgba(255,255,255,0.04); padding: 0.8rem 1rem; border-radius: 8px;">
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">ESTIMATED TOTAL COST</span>
          <strong style="color: var(--accent-emerald); font-size: 1.3rem;">₹${totalCostInr.toLocaleString('en-IN')} INR</strong>
        </div>
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">MATCH SCORE</span>
          <strong style="color: var(--accent-amber); font-size: 1.05rem;">${plan.matchScore || 90}% Match</strong>
        </div>
      </div>

      <!-- Integrated Partner Booking Suite -->
      <div class="booking-suite-container">
        <div class="booking-suite-header">
          <span style="font-weight: 700; color: var(--accent-gold); font-size: 0.95rem;">
            <i class="fa-solid fa-crown"></i> SUVIDHA Partner Booking Suite
          </span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Direct Partner Redirects</span>
        </div>
        
        <div class="partner-grid">
          <a class="partner-card" onclick="handlePartnerClick('Ola', '${destName}')">
            <span class="partner-icon">🚕</span>
            <strong>Ola Cabs</strong>
          </a>
          <a class="partner-card" onclick="handlePartnerClick('Uber', '${destName}')">
            <span class="partner-icon">🚘</span>
            <strong>Uber Cabs</strong>
          </a>
          <a class="partner-card" onclick="handlePartnerClick('Swiggy', '${destName}')">
            <span class="partner-icon">🍲</span>
            <strong>Swiggy Food</strong>
          </a>
          <a class="partner-card" onclick="handlePartnerClick('Zomato', '${destName}')">
            <span class="partner-icon">🍕</span>
            <strong>Zomato Food</strong>
          </a>
          <a class="partner-card" onclick="handlePartnerClick('MakeMyTrip', '${destName}')">
            <span class="partner-icon">🏨</span>
            <strong>MMT Hotels</strong>
          </a>
          <a class="partner-card" onclick="handlePartnerClick('RedBus', '${destName}')">
            <span class="partner-icon">🚌</span>
            <strong>RedBus</strong>
          </a>
          <a class="partner-card" onclick="handlePartnerClick('IRCTC', '${destName}')">
            <span class="partner-icon">🚆</span>
            <strong>IRCTC Trains</strong>
          </a>
        </div>
      </div>
    </div>

    <!-- Day Route Selector Tabs -->
    <div style="margin-bottom: 1.5rem;">
      <h3 style="font-size: 1.1rem; margin-bottom: 0.6rem;">🗺️ Interactive Geospatial Route Visualization</h3>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;" id="day-selector-tabs">
        ${days.map((dayItem, index) => `
          <button class="btn ${index === 0 ? 'btn-primary' : 'btn-outline'}" 
                  style="font-size: 0.85rem; padding: 0.4rem 0.9rem;" 
                  onclick="selectDayForMapRoute(${index})">
            Day ${dayItem.day || (index + 1)} Route
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Day Wise Schedule List -->
    <div class="itinerary-timeline" id="itinerary-days-container">
      ${renderDayCards(days)}
    </div>
  `;

  if (days.length > 0) {
    visualizeDayRouteOnMap(days[0], destName);
  }
}

function selectDayForMapRoute(dayIndex) {
  if (!currentActivePlan || !currentActivePlan.days || !currentActivePlan.days[dayIndex]) return;

  const tabs = document.querySelectorAll('#day-selector-tabs button');
  tabs.forEach((tab, idx) => {
    tab.className = (idx === dayIndex) ? 'btn btn-primary' : 'btn btn-outline';
  });

  const targetDay = currentActivePlan.days[dayIndex];
  visualizeDayRouteOnMap(targetDay, currentActivePlan.destinationName || currentActivePlan.destination);
}

function renderDayCards(days) {
  return days.map(dayItem => {
    const morningText = Array.isArray(dayItem.morning) ? dayItem.morning.join(', ') : dayItem.morning;
    const afternoonText = Array.isArray(dayItem.afternoon) ? dayItem.afternoon.join(', ') : dayItem.afternoon;
    const eveningText = Array.isArray(dayItem.evening) ? dayItem.evening.join(', ') : dayItem.evening;
    const metrics = dayItem.routeMetrics;

    return `
      <div class="glass-panel" style="padding: 1rem 1.2rem; margin-bottom: 1rem; border-left: 4px solid var(--accent-amber);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.6rem;">
          <h4 style="font-size: 1.1rem; color: var(--accent-amber);">${dayItem.title || `Day ${dayItem.day}`}</h4>
          ${metrics ? `
            <span style="font-size: 0.75rem; background: rgba(16,185,129,0.15); color: var(--accent-emerald); padding: 0.2rem 0.6rem; border-radius: 8px; font-weight: 600;">
              🚗 ${metrics.totalDistanceKm} km • ${metrics.estimatedTravelTimeMins} mins est. commute (₹${metrics.estimatedTransportCostInr})
            </span>
          ` : ''}
        </div>

        <div style="display: grid; gap: 0.6rem; font-size: 0.9rem;">
          <div><strong style="color: var(--accent-cyan);">🌅 Morning:</strong> ${morningText}</div>
          <div><strong style="color: var(--accent-amber);">☀️ Afternoon:</strong> ${afternoonText}</div>
          <div><strong style="color: var(--accent-emerald);">🌆 Evening:</strong> ${eveningText}</div>
        </div>

        <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.8rem; border-top: 1px dashed var(--border-color); padding-top: 0.6rem; font-size: 0.8rem; color: var(--text-secondary);">
          <span><strong>🏨 Stay:</strong> ${dayItem.stayRecommendation || 'Hotel'}</span>
          <span><strong>🍲 Food Spot:</strong> ${dayItem.foodSpot || 'Local Dhaba'}</span>
        </div>
      </div>
    `;
  }).join('');
}

function handlePartnerClick(partner, destination) {
  const user = JSON.parse(localStorage.getItem('suvidha_user') || 'null');
  if (!user || !user.isPremium) {
    openSubscriptionModal();
    return;
  }
  
  const query = encodeURIComponent(`${partner} ${destination}`);
  const partnerUrls = {
    Ola: `https://book.olacabs.com/search?q=${query}`,
    Uber: `https://m.uber.com/ul/?action=setPickup&pickup=my_location`,
    Rapido: `https://www.rapido.bike/`,
    Swiggy: `https://www.swiggy.com/search?query=${query}`,
    Zomato: `https://www.zomato.com/search?q=${query}`,
    MakeMyTrip: `https://www.makemytrip.com/hotels/${query}.html`,
    RedBus: `https://www.redbus.in/bus-tickets/${query}`,
    IRCTC: `https://www.irctc.co.in/nget/train-search`
  };

  const targetUrl = partnerUrls[partner] || `https://www.google.com/search?q=${query}`;
  window.open(targetUrl, '_blank');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function checkUserSession() {
  const user = JSON.parse(localStorage.getItem('suvidha_user') || 'null');
  const userBtn = document.getElementById('user-profile-btn');
  if (userBtn && user) {
    userBtn.innerHTML = `<i class="fa-solid fa-user-circle"></i> ${user.name} ${user.isPremium ? '👑' : ''}`;
  }
}

function openSubscriptionModal() {
  const modal = document.getElementById('subscription-modal');
  if (modal) modal.style.display = 'flex';
}

function closeSubscriptionModal() {
  const modal = document.getElementById('subscription-modal');
  if (modal) modal.style.display = 'none';
}

function toggleBookmark(name) {
  const index = wishlist.findIndex(item => item.name === name);
  if (index > -1) {
    wishlist.splice(index, 1);
    logInteractionEvent('wishlist_remove', null, name);
    showToast(`Removed ${name} from Wishlist`, 'info');
  } else {
    const found = destinationsData.find(d => d.name === name);
    if (found) {
      wishlist.push(found);
      logInteractionEvent('wishlist_add', null, name, { vibe: (found.travelVibes || [])[0], category: found.category });
      showToast(`Saved ${name} to Wishlist!`, 'success');
    }
  }
  localStorage.setItem('suvidha_wishlist', JSON.stringify(wishlist));
  updateWishlistCount();
  renderDestinationsGrid(destinationsData);
}

function updateWishlistCount() {
  const badge = document.getElementById('wishlist-badge');
  if (badge) badge.innerText = wishlist.length;
}

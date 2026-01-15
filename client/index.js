alert("index.js is loaded");

const API_BASE = "http://localhost:5000/api";
let currentUser = null;
let rides = [];
let selectedPickup = null;
let selectedDestination = null;
let notificationCheckInterval = null;

/* ==============================
   DETECT CURRENT PAGE
================================ */
function getCurrentPage() {
  const path = window.location.pathname;
  if (path.includes('create_a_ride.html')) return 'create_ride';
  if (path.includes('profile.html')) return 'profile';
  if (path.includes('previous.html')) return 'previous';
  if (path.includes('index.html') || path === '/') return 'home';
  return 'unknown';
}

/* ==============================
   AUTH
================================ */
async function fetchCurrentUser() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: "include",
    });
    const data = await res.json();

    if (!data.user) {
      window.location.href = "/login.html";
      return;
    }

    currentUser = data.user;

    // Update profile form if on profile page
    const nameInput = document.getElementById("fullName");
    if (nameInput) {
      nameInput.value = currentUser.name || "";
      document.getElementById("email").value = currentUser.email || "";
      document.getElementById("banasthaliId").value = currentUser.banasthaliId || "";
      document.getElementById("phone").value = currentUser.phone || "";
      document.getElementById("guardianPhone").value = currentUser.guardianPhone || "";
    }

    // Update avatar if exists
    const avatarDiv = document.querySelector(".profile-avatar");
    if (avatarDiv) {
      avatarDiv.textContent = currentUser.name?.charAt(0).toUpperCase() || "U";
    }

    // Update all user name displays
    const userNameElements = document.querySelectorAll(".user-name");
    userNameElements.forEach(el => {
      el.textContent = currentUser.name || "User";
    });

  } catch (err) {
    console.error("Error loading user data:", err);
    window.location.href = "/login.html";
  }
}

/* ==============================
   LOCATION AUTOCOMPLETE (For Create Ride Form)
================================ */
function setupOSMAutocomplete(inputId, onSelect) {
  console.log("🔧 setupOSMAutocomplete called for", inputId);

  const input = document.getElementById(inputId);
  if (!input) {
    console.error("❌ Input not found:", inputId);
    return;
  }

  // Create dropdown inside the autocomplete-wrapper
  const wrapper = input.closest('.autocomplete-wrapper');
  if (!wrapper) {
    console.error("❌ No autocomplete-wrapper found for", inputId);
    return;
  }

  const dropdown = document.createElement("div");
  dropdown.className = "autocomplete-list";
  wrapper.appendChild(dropdown);

  let debounceTimer;

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      const query = input.value.trim();
      dropdown.innerHTML = "";

      if (query.length < 3) return;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&countrycodes=in&limit=5&addressdetails=1`
        );

        const data = await res.json();

        data.forEach(place => {
          const div = document.createElement("div");
          div.className = "autocomplete-item";
          div.textContent = place.display_name;

          div.onclick = () => {
            input.value = place.display_name;
            dropdown.innerHTML = "";

            onSelect({
              name: place.name || place.display_name.split(",")[0],
              address: place.display_name,
              latitude: Number(place.lat),
              longitude: Number(place.lon)
            });
          };

          dropdown.appendChild(div);
        });
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    }, 300);
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      dropdown.innerHTML = "";
    }
  });
}

/* ==============================
   SEARCH BAR AUTOCOMPLETE (For Home Search)
================================ */
function setupSearchAutocomplete(inputId) {
  console.log("🔧 setupSearchAutocomplete called for", inputId);

  const input = document.getElementById(inputId);
  if (!input) {
    console.error("❌ Input not found:", inputId);
    return;
  }

  // Find the existing dropdown (don't create a new one)
  const wrapper = input.closest('.autocomplete-wrapper');
  if (!wrapper) {
    console.error("❌ No autocomplete-wrapper found for", inputId);
    return;
  }

  // Use the existing <ul> element with class "autocomplete-dropdown"
  const dropdown = wrapper.querySelector('.autocomplete-dropdown');
  if (!dropdown) {
    console.error("❌ No autocomplete-dropdown found for", inputId);
    return;
  }

  let debounceTimer;

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      const query = input.value.trim();
      dropdown.innerHTML = ""; // Clear previous results

      if (query.length < 3) return;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&countrycodes=in&limit=5&addressdetails=1`
        );

        const data = await res.json();

        // Create <li> elements (not div) for each result
        data.forEach(place => {
          const li = document.createElement("li");
          li.textContent = place.display_name;

          li.onclick = () => {
            input.value = place.display_name;
            dropdown.innerHTML = ""; // Clear dropdown after selection
          };

          dropdown.appendChild(li);
        });
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    }, 300);
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      dropdown.innerHTML = "";
    }
  });
}

// Initialize for both pickup and destination inputs
document.addEventListener('DOMContentLoaded', () => {
  setupSearchAutocomplete('pickupSearch');
  setupSearchAutocomplete('destinationSearch');
});

/* ==============================
   LOAD ALL RIDES (Home Page)
================================ */
async function loadRides(search = "") {
  try {
    const url = new URL(`${API_BASE}/rides`);
    if (search) url.searchParams.append("search", search);

    const res = await fetch(url, { credentials: "include" });
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    rides = data.data;
    displayRides(rides, "ridesGrid");
  } catch (err) {
    showError(err.message);
  }
}

/* ==============================
   LOAD USER'S PREVIOUS RIDES
================================ */
async function loadPreviousRides() {
  try {
    const res = await fetch(`${API_BASE}/rides/my-rides`, { 
      credentials: "include" 
    });
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    const myRides = data.data;
    displayRides(myRides, "previousRidesGrid");
  } catch (err) {
    showError(err.message);
  }
}

/* ==============================
   DISPLAY RIDES
================================ */
function displayRides(ridesData, containerId) {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error("❌ Container not found:", containerId);
    return;
  }

  if (!ridesData || !ridesData.length) {
    container.innerHTML =
      `<p style="text-align:center;color:#6b7280;padding:40px;">
        No rides found
      </p>`;
    return;
  }

  container.innerHTML = ridesData.map(ride => `
    <div class="ride-card">
      <div class="ride-header">
        <div class="avatar">${ride.initiatorName?.charAt(0) || "?"}</div>
        <div class="ride-info">
          <h3>
            ${new Date(ride.departureTime || ride.createdAt).toLocaleDateString()} • 
            ${new Date(ride.departureTime || ride.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
          </h3>
          <p>
            ${ride.rideType === "cab" ? "🚖 Cab Ride" : "🤝 Travel Buddy"}
          </p>
        </div>
      </div>

      <div class="route">
        ${ride.pickup?.name || "Pickup"} → ${ride.destination?.name || "Destination"}
      </div>

      <div class="description">
        ${ride.notes || "No additional notes"}
      </div>

      <div class="ride-footer">
        <div class="seats">👥 ${ride.seats || 1} seats</div>
        <div class="price">
          ${ride.rideType === "cab" ? `₹${ride.fare || "TBD"}` : "Split Cost"}
        </div>
      </div>

      <div class="ride-actions">
        <button class="btn btn-secondary" onclick="openChat('${ride._id}')">Chat</button>
        <button class="btn btn-primary" onclick="requestRide('${ride._id}')">Request</button>
      </div>
    </div>
  `).join("");
}

/* ==============================
   SEARCH RIDES (Home Page)
================================ */
function searchRides() {
  const pickup = document.getElementById("pickupSearch")?.value.trim();
  const destination = document.getElementById("destinationSearch")?.value.trim();
  const date = document.getElementById("dateSearch")?.value;

  const params = new URLSearchParams();

  if (pickup) params.append("pickup", pickup);
  if (destination) params.append("destination", destination);
  if (date) params.append("date", date);

  loadRidesWithParams(params.toString());
}

async function loadRidesWithParams(queryString = "") {
  try {
    const url = `${API_BASE}/rides${queryString ? "?" + queryString : ""}`;

    const res = await fetch(url, { credentials: "include" });
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    displayRides(data.data, "ridesGrid");
  } catch (err) {
    showError(err.message);
  }
}

/* ==============================
   CREATE RIDE (Create Ride Page)
================================ */
async function createRide(data) {
  try {
    const res = await fetch(`${API_BASE}/rides/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.errors?.join(", ") || result.message);
    }

    showSuccess("Ride created successfully!");
    
    // Reset form and selections
    const form = document.getElementById("createRideForm");
    if (form) form.reset();
    
    selectedPickup = null;
    selectedDestination = null;

    // Redirect to home page after short delay
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);

  } catch (err) {
    showError(err.message);
  }
}

/* ==============================
   RIDE ACTIONS
================================ */
function openChat(rideId) {
  alert(`Opening chat for ride: ${rideId}`);
  // Implement chat functionality
}

async function requestRide(rideId) {
  try {
    const res = await fetch(`${API_BASE}/ride-requests/${rideId}/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        message: "I would like to join this ride"
      })
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    showSuccess("Request sent successfully!");
    // Reload rides to update button state
    loadRides();
  } catch (err) {
    showError(err.message);
  }
}

/* ==============================
   LOGOUT
================================ */
function logout() {
  fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).then(() => window.location.href = "/login.html");
}

/* ==============================
   NOTIFICATIONS
================================ */
async function loadNotifications() {
  try {
    const res = await fetch(`${API_BASE}/notifications`, {
      credentials: "include"
    });

    const data = await res.json();

    if (!data.success) {
      console.error("Error loading notifications:", data.message);
      return;
    }

    displayNotifications(data.data, data.unreadCount);
  } catch (err) {
    console.error("Error fetching notifications:", err);
  }
}

function displayNotifications(notifications, unreadCount) {
  // Update notification badge
  const notificationIcon = document.querySelector('.notification img[src*="notification"]');
  if (notificationIcon) {
    const parent = notificationIcon.closest('.notification');
    
    // Remove existing badge if any
    const existingBadge = parent.querySelector('.notification-badge');
    if (existingBadge) existingBadge.remove();
    
    // Add badge if there are unread notifications
    if (unreadCount > 0) {
      const badge = document.createElement('span');
      badge.className = 'notification-badge';
      badge.textContent = unreadCount;
      parent.appendChild(badge);
    }
  }

  // Create or update notification popup
  let notificationPanel = document.getElementById('notificationPanel');
  if (!notificationPanel) {
    notificationPanel = document.createElement('div');
    notificationPanel.id = 'notificationPanel';
    notificationPanel.className = 'notification-panel';
    document.body.appendChild(notificationPanel);

    // Add click event to notification icon to toggle panel
    const notificationIcon = document.querySelector('.notification img[src*="notification"]');
    if (notificationIcon) {
      notificationIcon.closest('.notification').addEventListener('click', toggleNotificationPanel);
    }
  }

  // Populate notification list
  const notificationList = notifications.map(notif => {
    const actionButtons = getActionButtonsForNotification(notif);
    
    return `
      <div class="notification-item ${notif.status === 'unread' ? 'unread' : ''}">
        <div class="notif-header">
          <h4>${notif.senderUserId?.name || 'User'}</h4>
          <span class="notif-time">${new Date(notif.createdAt).toLocaleDateString()}</span>
        </div>
        <p class="notif-message">${notif.message}</p>
        <div class="notif-type" style="font-size: 11px; color: #999; margin: 5px 0;">
          ${notif.type === 'join_request' ? '📋 Join Request' : 
            notif.type === 'request_accepted' ? '✅ Request Accepted' : 
            '❌ Request Rejected'}
        </div>
        ${actionButtons}
      </div>
    `;
  }).join('');

  notificationPanel.innerHTML = `
    <div class="notification-header">
      <h3>Notifications</h3>
      <button onclick="closeNotificationPanel()" style="background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
    </div>
    <div class="notification-list">
      ${notificationList || '<p style="text-align: center; color: #999; padding: 20px;">No notifications</p>'}
    </div>
  `;
}

function getActionButtonsForNotification(notif) {
  // Only show action buttons for join_request type
  if (notif.type !== 'join_request') {
    return '';
  }

  // Get the request ID from the notification (you may need to adjust this based on your data structure)
  return `
    <div class="notif-actions">
      <button class="btn btn-small btn-accept" onclick="acceptRequest('${notif.rideId}', '${notif._id}', '${notif.senderUserId?._id}')">
        Accept
      </button>
      <button class="btn btn-small btn-reject" onclick="rejectRequest('${notif.rideId}', '${notif._id}', '${notif.senderUserId?._id}')">
        Reject
      </button>
    </div>
  `;
}

function toggleNotificationPanel() {
  const panel = document.getElementById('notificationPanel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') {
      loadNotifications();
    }
  }
}

function closeNotificationPanel() {
  const panel = document.getElementById('notificationPanel');
  if (panel) {
    panel.style.display = 'none';
  }
}

async function acceptRequest(rideId, notificationId, userId) {
  try {
    // First, get the request ID by fetching ride requests
    const requestRes = await fetch(`${API_BASE}/ride-requests/${rideId}/requests`, {
      credentials: "include"
    });

    const requestData = await requestRes.json();
    
    // Find the request from the sender
    const request = requestData.data.find(req => req.userId._id === userId);
    
    if (!request) {
      showError("Request not found");
      return;
    }

    // Accept the request
    const res = await fetch(`${API_BASE}/ride-requests/${rideId}/requests/${request._id}/accept`, {
      method: "PUT",
      credentials: "include"
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    showSuccess("Request accepted!");
    
    // Reload notifications
    loadNotifications();
  } catch (err) {
    showError(err.message);
  }
}

async function rejectRequest(rideId, notificationId, userId) {
  try {
    // First, get the request ID by fetching ride requests
    const requestRes = await fetch(`${API_BASE}/ride-requests/${rideId}/requests`, {
      credentials: "include"
    });

    const requestData = await requestRes.json();
    
    // Find the request from the sender
    const request = requestData.data.find(req => req.userId._id === userId);
    
    if (!request) {
      showError("Request not found");
      return;
    }

    // Reject the request
    const res = await fetch(`${API_BASE}/ride-requests/${rideId}/requests/${request._id}/reject`, {
      method: "PUT",
      credentials: "include"
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    showSuccess("Request rejected!");
    
    // Reload notifications
    loadNotifications();
  } catch (err) {
    showError(err.message);
  }
}

/* ==============================
   UTILS
================================ */
function showSuccess(msg) {
  // You can replace this with a better notification system
  alert(msg);
}

function showError(msg) {
  // You can replace this with a better notification system
  alert(msg);
}

/* ==============================
   PAGE-SPECIFIC INITIALIZATION
================================ */
function initHomePage() {
  console.log("🏠 Initializing Home Page");
  loadRides();
  
  // Setup search bar autocomplete
  setupSearchAutocomplete("pickupSearch");
  setupSearchAutocomplete("destinationSearch");
  
  // Setup search button
  const searchBtn = document.querySelector('button[onclick="searchRides()"]');
  if (searchBtn) {
    searchBtn.addEventListener('click', searchRides);
  }
}

function initCreateRidePage() {
  console.log("➕ Initializing Create Ride Page");
  
  // Setup create ride form autocomplete
  setupOSMAutocomplete("pickup", place => {
    selectedPickup = {
      name: place.name,
      address: place.address,
      location: {
        type: "Point",
        coordinates: [place.longitude, place.latitude]
      }
    };
    console.log("📍 Pickup selected:", selectedPickup);
  });

  setupOSMAutocomplete("destination", place => {
    selectedDestination = {
      name: place.name,
      address: place.address,
      location: {
        type: "Point",
        coordinates: [place.longitude, place.latitude]
      }
    };
    console.log("🏁 Destination selected:", selectedDestination);
  });

  // Setup form submission
  const form = document.getElementById("createRideForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!selectedPickup || !selectedDestination) {
        showError("Please select pickup and destination from suggestions");
        return;
      }

      const date = document.getElementById("rideDate").value;
      const time = document.getElementById("rideTime").value;
      const seats = document.getElementById("seats")?.value || 1;
      const fare = document.getElementById("fare")?.value;
      const notes = document.getElementById("notes")?.value;

      if (!date || !time) {
        showError("Please select date and time");
        return;
      }

      const departureTime = new Date(`${date}T${time}:00`).toISOString();

      const rideData = {
        pickup: selectedPickup,
        destination: selectedDestination,
        rideType: document.getElementById("buddyRequest")?.checked
          ? "travelBuddy"
          : "cab",
        departureTime,
        seats: parseInt(seats),
        fare: fare ? parseFloat(fare) : undefined,
        notes: notes || undefined
      };

      await createRide(rideData);
    });
  }
}

function initPreviousRidesPage() {
  console.log("📜 Initializing Previous Rides Page");
  loadPreviousRides();
}

function initProfilePage() {
  console.log("👤 Initializing Profile Page");
  // Profile form is already populated by fetchCurrentUser()
  
  // You can add profile update functionality here
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      // Implement profile update logic
      alert("Profile update functionality coming soon!");
    });
  }
}

/* ==============================
   MAIN INITIALIZATION
================================ */
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Application Starting...");
  
  // Fetch current user first
  await fetchCurrentUser();
  
  // Load notifications initially
  loadNotifications();
  
  // Check for new notifications every 30 seconds
  notificationCheckInterval = setInterval(loadNotifications, 30000);
  
  // Initialize based on current page
  const currentPage = getCurrentPage();
  console.log("📄 Current Page:", currentPage);
  
  switch(currentPage) {
    case 'home':
      initHomePage();
      break;
    case 'create_ride':
      initCreateRidePage();
      break;
    case 'previous':
      initPreviousRidesPage();
      break;
    case 'profile':
      initProfilePage();
      break;
    default:
      console.warn("⚠️ Unknown page:", currentPage);
  }
});

document.addEventListener('DOMContentLoaded', function() {
    
    // Select the checkbox and the section to toggle
    const immediateStartCheckbox = document.getElementById('immediateStart');
    const driverDetailsSection = document.getElementById('driverDetailsSection');

    // Only run if these elements exist on the current page
    if (immediateStartCheckbox && driverDetailsSection) {
        
        immediateStartCheckbox.addEventListener('change', function() {
            // Select the inputs inside the driver section
            const driverNameInput = document.getElementById('driverName');
            const carNumberInput = document.getElementById('carNumber');
            const aadharInput = document.getElementById('aadharPhoto');

            if (this.checked) {
                // Show the section
                driverDetailsSection.style.display = 'block';
                
                // Make inputs required (so user can't submit empty fields if they chose this option)
                if(driverNameInput) driverNameInput.required = true;
                if(carNumberInput) carNumberInput.required = true;
                if(aadharInput) aadharInput.required = true;
                
            } else {
                // Hide the section
                driverDetailsSection.style.display = 'none';
                
                // Remove required attribute (so user CAN submit the form without these fields)
                if(driverNameInput) driverNameInput.required = false;
                if(carNumberInput) carNumberInput.required = false;
                if(aadharInput) aadharInput.required = false;
            }
        });
    }
});
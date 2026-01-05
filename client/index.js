alert("index.js is loaded");

const API_BASE = "http://localhost:5000/api";
let currentUser = null;
let rides = [];
let selectedPickup = null;
let selectedDestination = null;

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

    document.getElementById("fullName").value = currentUser.name || "";
    document.getElementById("email").value = currentUser.email || "";
    document.getElementById("banasthaliId").value = currentUser.banasthaliId || "";
    document.getElementById("phone").value = currentUser.phone || "";
    document.getElementById("guardianPhone").value = currentUser.guardianPhone || "";

    document.querySelector(".profile-avatar").textContent =
      currentUser.name?.charAt(0).toUpperCase() || "U";
  } catch (err) {
    window.location.href = "/login.html";
  }
}

/* ==============================
   NAVIGATION
================================ */
function showPage(pageName) {
  // hide all pages
  document.querySelectorAll(".page").forEach(page => {
    page.classList.add("hidden");
  });

  // remove active class
  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.remove("active");
  });

  // show selected page
  document.getElementById(pageName + "-page").classList.remove("hidden");

  // activate correct nav item
  document
    .querySelector(`.nav-item[onclick*="${pageName}"]`)
    .classList.add("active");

  if (pageName === "home") loadRides();
  if (pageName === "previous-rides") loadPreviousRides();
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

  // Create dropdown inside the wrapper
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
   LOAD RIDES
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
   DISPLAY RIDES
================================ */
function displayRides(ridesData, containerId) {
  const container = document.getElementById(containerId);

  if (!ridesData.length) {
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
            ${new Date(ride.createdAt).toLocaleDateString()} • 
            ${new Date(ride.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
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
        <button class="btn btn-secondary">Chat</button>
        <button class="btn btn-primary">Request</button>
      </div>
    </div>
  `).join("");
}

/* ==============================
   SEARCH
================================ */
function searchRides() {
  const pickup = document.getElementById("pickupSearch").value.trim();
  const destination = document.getElementById("destinationSearch").value.trim();
  const date = document.getElementById("dateSearch").value;

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
   CREATE RIDE
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

    showSuccess("Ride created successfully");
    document.getElementById("createRideForm").reset();
    selectedPickup = null;
    selectedDestination = null;

    loadRides();
    showPage("home");
  } catch (err) {
    showError(err.message);
  }
}

/* ==============================
   FORM HANDLER
================================ */
document.getElementById("createRideForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!selectedPickup || !selectedDestination) {
    showError("Please select pickup and destination from suggestions");
    return;
  }

  const date = document.getElementById("rideDate").value;
  const time = document.getElementById("rideTime").value;

  const departureTime = new Date(`${date}T${time}:00`).toISOString();

  const rideData = {
    pickup: selectedPickup,
    destination: selectedDestination,
    rideType: document.getElementById("buddyRequest").checked
      ? "travelBuddy"
      : "cab",
    departureTime
  };

  createRide(rideData);
});

/* ==============================
   PREVIOUS RIDES
================================ */
function loadPreviousRides() {
  displayRides(
    rides.filter(r => r.initiatorId === currentUser?._id),
    "previousRidesGrid"
  );
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
   UTILS
================================ */
function showSuccess(msg) {
  alert(msg);
}

function showError(msg) {
  alert(msg);
}

/* ==============================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", async () => {
  await fetchCurrentUser();
  loadRides();

  // Setup search bar autocomplete
  setupSearchAutocomplete("pickupSearch");
  setupSearchAutocomplete("destinationSearch");

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
});
// home.js — Ogbomoso Chamber of Commerce home page
// Requires common.js to be loaded first (handles nav/theme/footer).

// TODO: replace with your own free key from https://openweathermap.org/api
const WEATHER_API_KEY = "YOUR_OPENWEATHERMAP_API_KEY";

// Ogbomoso, Oyo State, Nigeria — approximate coordinates
const LAT = 8.1300;
const LON = 4.2400;

const membershipLabels = {
  1: "Member",
  2: "Silver",
  3: "Gold",
};

// ---------- Weather ----------

async function getCurrentWeather() {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${WEATHER_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Current weather fetch failed: ${response.status}`);
  }
  return response.json();
}

async function getForecast() {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${WEATHER_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Forecast fetch failed: ${response.status}`);
  }
  return response.json();
}

function renderCurrentWeather(data) {
  document.querySelector("#current-temp").textContent = `${Math.round(data.main.temp)}\u00b0C`;
  document.querySelector("#current-desc").textContent = data.weather[0].description;

  const icon = document.querySelector("#weather-icon");
  icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  icon.alt = data.weather[0].description;
}

function renderForecast(data) {
  const list = document.querySelector("#forecast-list");
  list.innerHTML = "";

  // The free-tier forecast endpoint returns 3-hour steps for 5 days.
  // Taking the midday (12:00:00) reading for the next 3 days gives a
  // clean daily forecast without needing the paid "One Call" endpoint.
  const dailyEntries = data.list
    .filter((entry) => entry.dt_txt.includes("12:00:00"))
    .slice(0, 3);

  dailyEntries.forEach((entry) => {
    const date = new Date(entry.dt_txt);
    const label = date.toLocaleDateString("en-US", { weekday: "short" });

    const li = document.createElement("li");
    li.innerHTML = `
      <span class="forecast-day">${label}</span>
      <img src="https://openweathermap.org/img/wn/${entry.weather[0].icon}.png" alt="${entry.weather[0].description}" width="40" height="40">
      <span class="forecast-temp">${Math.round(entry.main.temp)}\u00b0C</span>
    `;
    list.appendChild(li);
  });
}

async function initWeather() {
  try {
    const [current, forecast] = await Promise.all([getCurrentWeather(), getForecast()]);
    renderCurrentWeather(current);
    renderForecast(forecast);
  } catch (error) {
    console.error("Weather widget error:", error);
    document.querySelector("#current-desc").textContent = "Weather unavailable right now.";
  }
}

// ---------- Member Spotlights ----------

async function getMembers() {
  try {
    const response = await fetch("data/members.json");
    if (!response.ok) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.members;
  } catch (error) {
    console.error("Could not load member data:", error);
    return [];
  }
}

function pickSpotlights(members, count) {
  const eligible = members.filter((member) => member.membership >= 2); // silver or gold only
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function renderSpotlights(members) {
  const container = document.querySelector("#spotlight-list");
  container.innerHTML = "";

  members.forEach((member) => {
    const card = document.createElement("article");
    card.className = "member-card";
    card.innerHTML = `
      <img src="images/${member.image}" alt="${member.name} logo" loading="lazy" width="300" height="300">
      <div class="card-body">
        <span class="badge level-${member.membership}">${membershipLabels[member.membership]}</span>
        <h3>${member.name}</h3>
        <p><strong>Phone:</strong> ${member.phone}</p>
        <p><strong>Address:</strong> ${member.address}</p>
        <p><a href="${member.url}" target="_blank" rel="noopener">${member.url.replace("https://", "")}</a></p>
      </div>
    `;
    container.appendChild(card);
  });
}

async function initSpotlights() {
  const members = await getMembers();
  const count = Math.random() < 0.5 ? 2 : 3; // randomize count too, not just which members
  renderSpotlights(pickSpotlights(members, count));
}

initWeather();
initSpotlights();
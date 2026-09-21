const LAT = 8.13;
const LON = 4.24;

const membershipLabels = {
  1: "Member",
  2: "Silver",
  3: "Gold",
};

async function getCurrentWeather() {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&APPID=06665bb7d373a525fa91ec93a2beca88`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Current weather fetch failed: ${response.status}`);
  }
  return response.json();
}

async function getForecast() {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&APPID=06665bb7d373a525fa91ec93a2beca88`;
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
  const eligible = members.filter((member) => member.membership_level >= 2);
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
      <img src="${member.image_file_name}" alt="${member.name} logo" loading="lazy" width="300" height="300">
      <div class="card-body">
        <span class="badge level-${member.membership_level}">${membershipLabels[member.membership_level]}</span>
        <h3>${member.name}</h3>
        <p><strong>Phone:</strong> ${member.phone}</p>
        <p><strong>Address:</strong> ${member.address}</p>
        <p><a href="${member.website_url}" target="_blank" rel="noopener">${member.website_url.replace("https://", "")}</a></p>
      </div>
    `;
    container.appendChild(card);
  });
}

async function initSpotlights() {
  const members = await getMembers();
  const count = Math.random() < 0.5 ? 2 : 3;
  renderSpotlights(pickSpotlights(members, count));
}

initWeather();
initSpotlights();
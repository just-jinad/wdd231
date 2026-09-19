
const memberListEl = document.querySelector("#member-list");
const gridBtn = document.querySelector("#grid-view-btn");
const listBtn = document.querySelector("#list-view-btn");
const navToggle = document.querySelector("#nav-toggle");
const primaryNav = document.querySelector("#primary-nav");
const themeToggle = document.querySelector("#theme-toggle");

const membershipLabels = {
  1: "Member",
  2: "Silver",
  3: "Gold",
};

async function getMembers() {
  try {
    const response = await fetch("./data/members.json");
    if (!response.ok) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.members;
  } catch (error) {
    console.error("Could not load member data:", error);
    memberListEl.innerHTML = "<p>Unable to load business directory right now. Please try again later.</p>";
    return [];
  }
}

function renderMembers(members) {
  memberListEl.innerHTML = "";
  members.forEach((member) => {
    const card = document.createElement("article");
    card.className = "member-card";
    card.innerHTML = `
      <img src="${member.image}" alt="${member.name} logo" loading="lazy" width="300" height="300">
      <div class="card-body">
        <span class="badge level-${member.membership}">${membershipLabels[member.membership]}</span>
        <h3>${member.name}</h3>
        <p class="tagline">${member.tagline}</p>
        <p><strong>Address:</strong> ${member.address}</p>
        <p><strong>Phone:</strong> ${member.phone}</p>
        <p><a href="${member.url}" target="_blank" rel="noopener">${member.url.replace("https://", "")}</a></p>
      </div>
    `;
    memberListEl.appendChild(card);
  });
}

function setView(view) {
  const isGrid = view === "grid";
  memberListEl.classList.toggle("list-view", !isGrid);
  gridBtn.setAttribute("aria-pressed", String(isGrid));
  listBtn.setAttribute("aria-pressed", String(!isGrid));
  localStorage.setItem("directoryView", view);
}

gridBtn.addEventListener("click", () => setView("grid"));
listBtn.addEventListener("click", () => setView("list"));

navToggle.addEventListener("click", () => {
  const isOpen = primaryNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
  localStorage.setItem("theme", theme);
}

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  applyTheme(current === "dark" ? "light" : "dark");
});

function initTheme() {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
}

function initFooter() {
  document.querySelector("#current-year").textContent = new Date().getFullYear();
  document.querySelector("#last-modified").textContent = document.lastModified;
}

async function init() {
  initTheme();
  initFooter();
  const members = await getMembers();
  renderMembers(members);
  const savedView = localStorage.getItem("directoryView") || "grid";
  setView(savedView);
}

init();
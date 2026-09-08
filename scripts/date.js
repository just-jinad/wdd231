// date.js — footer year + last-modified timestamp

document.getElementById('currentyear').textContent = new Date().getFullYear();

// document.lastModified is already a formatted string — no parsing needed.
document.getElementById('lastModified').textContent =
  `Last Modification: ${document.lastModified}`;
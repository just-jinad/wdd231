// course.js — course data, rendering, filtering, credit totals
// type="module" in the <head> means this already runs after parsing
// and in strict mode; no defer attribute or DOMContentLoaded needed.

const courses = [
  {
    subject: 'CSE', number: 110, title: 'Introduction to Programming',
    credits: 2, certificate: 'Web and Computer Programming',
    description: 'Introduces variables, decisions, calculations, loops, arrays, and input/output.',
    technology: ['Python'],
    // TODO: set to true for every course you've actually completed.
    completed: false
  },
  {
    subject: 'WDD', number: 130, title: 'Web Fundamentals',
    credits: 2, certificate: 'Web and Computer Programming',
    description: 'Introduces the World Wide Web and careers in web design and development.',
    technology: ['HTML', 'CSS'],
    completed: false
  },
  {
    subject: 'CSE', number: 111, title: 'Programming with Functions',
    credits: 2, certificate: 'Web and Computer Programming',
    description: 'Writing, calling, debugging, and testing functions; handling errors within functions.',
    technology: ['Python'],
    completed: false
  },
  {
    subject: 'CSE', number: 210, title: 'Programming with Classes',
    credits: 2, certificate: 'Web and Computer Programming',
    description: 'Introduces classes, objects, encapsulation, inheritance, and polymorphism.',
    technology: ['C#'],
    completed: false
  },
  {
    subject: 'WDD', number: 131, title: 'Dynamic Web Fundamentals',
    credits: 2, certificate: 'Web and Computer Programming',
    description: 'Uses JavaScript to respond to events, update content, and build responsive UX.',
    technology: ['HTML', 'CSS', 'JavaScript'],
    completed: false
  },
  {
    subject: 'WDD', number: 231, title: 'Frontend Web Development I',
    credits: 2, certificate: 'Web and Computer Programming',
    description: 'Focuses on UX, accessibility, compliance, performance, and basic API usage.',
    technology: ['HTML', 'CSS', 'JavaScript'],
    completed: false
  }
];

const cardContainer = document.getElementById('course-cards');
const creditTotalEl = document.getElementById('credit-total');
const filterButtons = document.querySelectorAll('.filter-btn');

/**
 * Renders a set of course cards and updates the credit total.
 * Kept pure-ish: takes the array to render, doesn't reach outside
 * for filter state, so it's trivially reusable/testable.
 */
function renderCourses(list) {
  cardContainer.innerHTML = ''; // simplest correct approach at this scale;
                                  // a diffing renderer would be overkill for 6 static cards

  list.forEach(course => {
    const card = document.createElement('div');
    card.className = course.completed ? 'course-card completed' : 'course-card';
    card.textContent = `${course.subject} ${course.number}`;
    card.title = course.title; // cheap tooltip, no extra markup needed
    cardContainer.appendChild(card);
  });

  const totalCredits = list.reduce((sum, course) => sum + course.credits, 0);
  creditTotalEl.textContent = totalCredits;
}

function applyFilter(filterValue) {
  const filtered = filterValue === 'all'
    ? courses
    : courses.filter(course => course.subject === filterValue);
  renderCourses(filtered);
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');

    applyFilter(button.dataset.filter);
  });
});

// Initial paint: all courses
applyFilter('all');
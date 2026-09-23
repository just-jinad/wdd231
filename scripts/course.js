const courses = [
  {
    subject: 'CSE', number: 110, title: 'Introduction to Programming',
    credits: 2, certificate: 'Web and Computer Programming',
    description: 'Introduces variables, decisions, calculations, loops, arrays, and input/output.',
    technology: ['Python'],
    completed: true
  },
  {
    subject: 'WDD', number: 130, title: 'Web Fundamentals',
    credits: 2, certificate: 'Web and Computer Programming',
    description: 'Introduces the World Wide Web and careers in web design and development.',
    technology: ['HTML', 'CSS'],
    completed: true
  },
  {
    subject: 'CSE', number: 111, title: 'Programming with Functions',
    credits: 2, certificate: 'Web and Computer Programming',
    description: 'Writing, calling, debugging, and testing functions; handling errors within functions.',
    technology: ['Python'],
    completed: true
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
    completed: true
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
const courseDialog = document.getElementById('course-details');
const closeButton = document.getElementById('closeButton');

function displayCourseDetails(course) {
  document.getElementById('course-modal-title').textContent = `${course.subject} ${course.number}`;
  document.getElementById('modal-title').textContent = course.title;
  document.getElementById('modal-credits').textContent = `${course.credits} credits`;
  document.getElementById('modal-description').textContent = course.description;
  document.getElementById('modal-certificate').textContent = course.certificate;
  document.getElementById('modal-technology').textContent = course.technology.join(', ');
  courseDialog.showModal();
}

function renderCourses(list) {
  cardContainer.innerHTML = '';
  list.forEach(course => {
    const card = document.createElement('div');
    card.className = course.completed ? 'course-card completed' : 'course-card';
    card.textContent = `${course.subject} ${course.number}`;
    card.title = course.title; 
    card.addEventListener('click', () => displayCourseDetails(course));
    cardContainer.appendChild(card);
  });

  const totalCredits = list.reduce((sum, course) => sum + course.credits, 0);
  creditTotalEl.textContent = totalCredits;
}

closeButton.addEventListener('click', () => courseDialog.close());

courseDialog.addEventListener('click', event => {
  if (event.target === courseDialog) {
    courseDialog.close();
  }
});

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
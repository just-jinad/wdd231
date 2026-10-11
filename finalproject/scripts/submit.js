import { esc } from './render.js';
import { addSubmission } from './storage.js';

export function initSubmit() {
  const form = document.querySelector('#submit-form');
  const status = document.querySelector('#submit-status');
  if (!form || !status) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const submission = {
      type: data.get('type'),
      message: data.get('message'),
      name: data.get('name') || 'Anonymous',
      date: new Date().toISOString(),
    };

    if (!addSubmission(submission)) {
      status.className = 'form-status is-error';
      status.textContent = 'Your browser could not save this submission. Please try again.';
      return;
    }

    status.className = 'form-status is-success';
    status.innerHTML = `<strong>Thanks for your feedback.</strong> Your ${esc(String(submission.type).toLowerCase())} was saved in this browser.`;
    form.reset();
    form.querySelector('#submit-name').focus();
  });
}

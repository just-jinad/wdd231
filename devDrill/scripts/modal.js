// Accessible modal built on the native <dialog>: showModal() gives us focus
// trapping, Escape-to-close and an inert page behind it for free.
let opener = null;

export function initDialog(dialog) {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());

  // The dialog has no padding of its own (the body does), so a click whose target
  // is the dialog itself can only be a click on the backdrop.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => opener?.focus()); // return focus to the trigger
}

export function openDialog(dialog, { title, message, trigger } = {}) {
  opener = trigger ?? document.activeElement;
  const titleElement = dialog.querySelector('[data-dialog-title]');
  const messageElement = dialog.querySelector('[data-dialog-message]');
  if (titleElement && title !== undefined) titleElement.textContent = title;
  if (messageElement && message !== undefined) messageElement.textContent = message;
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

export function openAnswerDialog(dialog, question, trigger) {
  opener = trigger;
  dialog.querySelector('#dialog-question').textContent = question.question;
  dialog.querySelector('#dialog-answer').textContent = question.correct_answer;
  dialog.querySelector('#dialog-explanation').textContent =
    question.explanation || 'No explanation is available for this question.';
  openDialog(dialog, { trigger });
}
const timestampField = document.querySelector('#timestamp');

if (timestampField) {
  timestampField.value = new Date().toISOString();
}

document.querySelectorAll('.level-card a').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const dialog = document.querySelector(link.getAttribute('href'));
    dialog?.showModal();
  });
});

document.querySelectorAll('.membership-modal').forEach(dialog => {
  dialog.querySelector('.modal-close')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
});

// Shared form submit: posts a form to send-form.php, which emails it to info@truleaf.in.
// Resolves true on success, false on any failure.
window.sendForm = function (type, form) {
  const data = new FormData(form);
  data.append('form', type);
  return fetch('send-form.php', { method: 'POST', body: data })
    .then((res) => res.json().then((j) => !!(res.ok && j && j.ok)))
    .catch(() => false);
};

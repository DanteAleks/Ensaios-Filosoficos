(() => {
  document.querySelectorAll('[data-copy-email]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      const status = button.closest('.reader-contact').querySelector('.contact-status');
      try {
        await navigator.clipboard.writeText(button.dataset.copyEmail);
        status.textContent = 'Endereço copiado.';
      } catch {
        status.textContent = 'Selecione e copie o endereço:';
        const input = document.createElement('input');
        input.type = 'text';
        input.readOnly = true;
        input.value = button.dataset.copyEmail;
        input.setAttribute('aria-label', 'Endereço de e-mail para copiar');
        status.append(document.createElement('br'), input);
        input.focus();
        input.select();
      }
    });
  });
})();


(() => {
  document.querySelectorAll('[data-copy-email]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      const status = button.closest('.reader-contact').querySelector('.contact-status');
      try {
        await navigator.clipboard.writeText(button.dataset.copyEmail);
        status.textContent = 'Endereço copiado.';
      } catch {
        status.textContent = 'Não foi possível copiar automaticamente. Selecione e copie o endereço exibido abaixo.';
      }
    });
  });
})();

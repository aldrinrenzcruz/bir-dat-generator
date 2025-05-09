// Save/Load Inputs to/from LocalStorage
window.addEventListener("DOMContentLoaded", () => {
  const savableElements = document.querySelectorAll("[data-save-local='true']");
  savableElements.forEach(el => {
    const id = el.id;
    if (!id) return;
    const savedValue = localStorage.getItem(id);
    if (savedValue !== null) {
      el.value = savedValue;
    }
    el.addEventListener("input", () => {
      localStorage.setItem(id, el.value);
    });
  });
});
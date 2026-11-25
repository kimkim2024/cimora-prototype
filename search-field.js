window.CimoraSearchField = (() => {
  const icon = '<svg class="cm-search-field-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>';

  function render(input, className = '') {
    return `<label class="cm-search-field ${className}">${icon}${input}</label>`;
  }

  return {render};
})();

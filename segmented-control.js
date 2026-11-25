/* Render with {id, label, options: [{value, label}], value, panelId?}.
   Listen for segment-change on the control; event.detail.value is the selection. */
window.CimoraSegmentedControl = (() => {
  function render({id, label, options, value, panelId}) {
    if (!options.length) return '';
    const escape = Site.esc;
    const index = Math.max(0, options.findIndex(option => option.value === value));
    const buttons = options.map((option, i) => {
      const selected = i === index;
      const state = panelId
        ? `role="tab" aria-controls="${escape(panelId)}" aria-selected="${selected}" tabindex="${selected ? 0 : -1}"`
        : `aria-pressed="${selected}"`;
      return `<button type="button" id="${escape(id)}-${escape(option.value)}" value="${escape(option.value)}" ${state}>${escape(option.label)}</button>`;
    });
    return `<div id="${escape(id)}" class="cm-segmented-control" role="${panelId ? 'tablist' : 'group'}" aria-label="${escape(label)}" style="--segment-count:${options.length};--segment-index:${index}">${buttons.join('')}</div>`;
  }

  function activate(button) {
    const control = button.parentElement;
    const tabs = control.getAttribute('role') === 'tablist';
    const attr = tabs ? 'aria-selected' : 'aria-pressed';
    if (button.getAttribute(attr) === 'true') return;
    const buttons = Array.from(control.children);
    control.style.setProperty('--segment-index', buttons.indexOf(button));
    for (const item of buttons) {
      item.setAttribute(attr, String(item === button));
      if (tabs) item.tabIndex = item === button ? 0 : -1;
    }
    if (tabs) {
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      panel?.setAttribute('aria-labelledby', button.id);
    }
    control.dispatchEvent(new CustomEvent('segment-change', {bubbles:true, detail:{value:button.value}}));
  }

  const selector = '.cm-segmented-control > button';
  document.addEventListener('click', event => {
    const button = event.target.closest(selector);
    if (button) activate(button);
  });
  document.addEventListener('keydown', event => {
    const button = event.target.closest(selector);
    if (!button || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    const buttons = Array.from(button.parentElement.children);
    const current = buttons.indexOf(button);
    let next = current;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = buttons.length - 1;
    if (event.key === 'ArrowLeft') next = (current + buttons.length - 1) % buttons.length;
    if (event.key === 'ArrowRight') next = (current + 1) % buttons.length;
    event.preventDefault();
    buttons[next].focus();
    activate(buttons[next]);
  });
  return {render};
})();

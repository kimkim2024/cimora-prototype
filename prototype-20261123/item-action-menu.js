/* Render with {id, name, nameLabel, actions?}. Listen for item-action with {id, action, name?}. */
window.CimoraItemActionMenu = (() => {
  const svg = paths => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const icons = {
    more: svg('<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'),
    rename: svg('<path d="m4 16-1 5 5-1L20 8l-4-4Zm10-10 4 4"/>'),
    duplicate: svg('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 4H6a2 2 0 0 0-2 2v10"/>'),
    archive: svg('<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>'),
    cancel: svg('<path d="m6 6 12 12M6 18 18 6"/>'),
    save: svg('<path d="m5 12 4 4L19 6"/>'),
    tags: svg('<path d="M3 4h8l10 10-7 7L3 10z"/><circle cx="7.5" cy="8" r="1"/>'),
    details: svg('<path d="M7 3h7l4 4v14H7zM14 3v5h4M10 12h5m-5 4h5"/>'),
    restore: svg('<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>'),
  };
  const defaultActions = [
    {id:'rename',label:'Rename',showLabel:true},
    {id:'duplicate',label:'Duplicate'},
    {id:'archive',label:'Move to Recycle Bin'},
  ];

  function render({id, name, nameLabel = 'Name', actions = defaultActions}) {
    const escape = Site.esc;
    return `<div class="cm-item-actions" data-item-id="${escape(id)}">
      <button type="button" class="cm-item-actions-trigger" data-item-action="more" aria-label="More Actions For ${escape(name)}" aria-expanded="false" title="More Actions">${icons.more}</button>
      <div class="cm-item-actions-menu" role="group" aria-label="Actions for ${escape(name)}" hidden>
        <div class="cm-item-actions-options">
          ${actions.map(action=>`<button type="button" data-item-action="${escape(action.id)}" aria-label="${escape(action.label)}" title="${escape(action.label)}"${action.showLabel?' class="cm-item-actions-labelled"':''}>${icons[action.id] || ''}${action.showLabel?`<span>${escape(action.label)}</span>`:''}</button>`).join('')}
        </div>
        ${actions.some(action=>action.id==='rename')?`<form class="cm-item-actions-form" hidden>
          <div class="cm-item-actions-controls">
            <button type="submit" aria-label="Save ${escape(nameLabel.toLowerCase())}" title="Save ${escape(nameLabel.toLowerCase())}">${icons.save}</button>
            <button type="button" data-item-action="cancel" aria-label="Cancel rename" title="Cancel rename">${icons.cancel}</button>
          </div>
          <input name="name" aria-label="${escape(nameLabel)}" value="${escape(name)}" required maxlength="80" autocomplete="off">
        </form>`:''}
      </div>
    </div>`;
  }

  let active = null;
  function edit(menu, editing, focus = true) {
    const form = menu.querySelector('form');
    if (!form) return;
    const options = menu.querySelector('.cm-item-actions-options');
    form.hidden = !editing;
    options.hidden = editing;
    if (editing) {
      form.elements.name.focus({preventScroll:true});
      form.elements.name.select();
    } else {
      form.reset();
      if (focus) options.firstElementChild.focus({preventScroll:true});
    }
  }
  function close(focus = false) {
    if (!active) return;
    const {menu, trigger} = active;
    active = null;
    menu.hidden = true;
    trigger.setAttribute('aria-expanded','false');
    edit(menu, false, false);
    if (focus) trigger.focus({preventScroll:true});
  }
  function dispatch(root, action, data) {
    root.dispatchEvent(new CustomEvent('item-action', {bubbles:true,detail:{id:root.dataset.itemId,action,...data}}));
    if (!root.isConnected && active?.root === root) close();
  }
  document.addEventListener('click', event => {
    const root = event.target.closest('.cm-item-actions');
    if (active?.root !== root) close();
    const button = event.target.closest('button[data-item-action]');
    if (!root || !button) return;
    const {itemAction} = button.dataset;
    if (itemAction === 'more') {
      if (active) {
        close(true);
        return;
      }
      const menu = root.querySelector('.cm-item-actions-menu');
      active = {root, menu, trigger:button};
      menu.hidden = false;
      button.setAttribute('aria-expanded','true');
      menu.querySelector('.cm-item-actions-options button')?.focus({preventScroll:true});
    } else if (active && (itemAction === 'rename' || itemAction === 'cancel')) {
      edit(active.menu, itemAction === 'rename');
    } else {
      close(true);
      dispatch(root, itemAction);
    }
  });
  document.addEventListener('submit', event => {
    if (!event.target.matches('.cm-item-actions-form')) return;
    event.preventDefault();
    dispatch(event.target.closest('.cm-item-actions'), 'rename', {name:event.target.elements.name.value.trim()});
  });
  document.addEventListener('focusin', event => {
    if (active && !active.root.contains(event.target)) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !active?.root.contains(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    if (active.menu.querySelector('form:not([hidden])')) edit(active.menu, false);
    else close(true);
  }, true);
  return {render};
})();

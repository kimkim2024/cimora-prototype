window.CimoraActivityDropdown = (() => {
  const defaultIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 4h6l2 2 2-2h6v15h-6l-2 2-2-2H4zM12 6v15"/></svg>';
  const chevron = '<svg aria-hidden="true" class="cm-activity-dropdown-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  function render({label, options, value, action, icon = defaultIcon, className = '', compact = false}) {
    if (!options.length) return '';
    const selected = options.find(option => option.value === value) || options[0];
    return `<details class="cm-activity-dropdown ${escape(className)}">
      <summary${compact ? ` aria-label="${escape(`${label}: ${selected.label}`)}"` : ''}>
        ${compact ? `<span class="cm-activity-dropdown-copy"><strong>${escape(selected.shortLabel || selected.label)}</strong></span>` : `
        <span class="cm-activity-dropdown-icon">${selected.icon ?? icon}</span>
        <span class="cm-activity-dropdown-copy">
          <strong>${escape(label)}</strong>
          <span>${escape(selected.label)}</span>
        </span>`}
        ${chevron}
      </summary>
      <ul aria-label="${escape(label)}">
        ${options.map((option, index) => `<li style="--option-delay:${Math.min(index, 5) * 45}ms">
          <button type="button"${action ? ` data-action="${escape(action)}"` : ''} data-id="${escape(option.value)}" aria-pressed="${option === selected}"${option.disabled ? ' disabled' : ''}>
            <span class="cm-activity-dropdown-icon">${option.icon ?? icon}</span>
            <span class="cm-activity-dropdown-copy">
              <strong>${escape(option.label)}</strong>
              ${option.description ? `<span>${escape(option.description)}</span>` : ''}
            </span>
          </button>
        </li>`).join('')}
      </ul>
    </details>`;
  }

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    const dropdown = event.target.closest('.cm-activity-dropdown[open]');
    if (!dropdown) return;
    event.preventDefault();
    event.stopPropagation();
    dropdown.open = false;
    dropdown.querySelector('summary').focus();
  }, true);

  // Keep the native field in the form for validation, values, and existing event handlers.
  function connectSelects() {
    const selector = 'select:not([multiple])';
    const controls = new WeakMap();
    let active = null;
    const resize = new ResizeObserver(entries => {
      for (const {target} of entries) controls.get(target)?.layout();
      active?.position();
    });

    function enhance(select) {
      if (!select.isConnected) return;
      if (controls.has(select)) {
        resize.observe(select);
        return;
      }
      const labelCopy = select.labels?.[0]?.cloneNode(true);
      labelCopy?.querySelectorAll('select,.cm-select-field').forEach(node => node.remove());
      const label = select.getAttribute('aria-label') || labelCopy?.textContent.trim() || select.title || 'Select an option';
      const field = document.createElement('span');
      field.className = 'cm-select-field';
      select.before(field);
      field.append(select);
      const template = document.createElement('template');
      template.innerHTML = render({label,options:[{label:'—',value:''}],compact:true,className:'cm-select-menu'});
      const dropdown = template.content.firstElementChild;
      const trigger = dropdown.querySelector('summary'), list = dropdown.querySelector('ul');
      if (list.showPopover) list.popover = 'manual';
      field.append(dropdown);
      let optionsKey = '';
      const control = {
        close() { dropdown.open = false; },
        position() {
          if (!dropdown.open || !list.showPopover) return;
          const rect = dropdown.getBoundingClientRect();
          const below = innerHeight - rect.bottom - 10, above = rect.top - 10;
          const flip = below < 128 && above > below;
          Object.assign(list.style, {
            left:`${rect.left}px`, width:`${rect.width}px`,
            top:flip ? 'auto' : `${rect.bottom + 4}px`,
            bottom:flip ? `${innerHeight - rect.top + 4}px` : 'auto',
            maxHeight:`${Math.max(36,Math.min(224,flip ? above : below))}px`,
          });
        },
        layout() {
          Object.assign(dropdown.style, {left:`${select.offsetLeft}px`,top:`${select.offsetTop}px`,width:`${select.offsetWidth}px`,height:`${select.offsetHeight}px`});
        },
        sync() {
          const options = Array.from(select.options, (option,index) => ({
            label:option.label || '—',value:String(index),disabled:option.disabled || !!option.closest('optgroup[disabled]'),
          }));
          const selected = options[select.selectedIndex];
          const nextKey = JSON.stringify(options);
          if (optionsKey !== nextKey) {
            optionsKey = nextKey;
            template.innerHTML = options.length ? render({label,options,compact:true}) : '';
            list.replaceChildren(...(template.content.querySelector('ul')?.childNodes || []));
          }
          for (const option of list.querySelectorAll('button')) option.setAttribute('aria-pressed',String(option.dataset.id===selected?.value));
          const text = trigger.querySelector('strong');
          const selectedLabel = selected?.label || '—';
          if (text.textContent !== selectedLabel) text.textContent = selectedLabel;
          trigger.setAttribute('aria-label',`${label}: ${selected?.label || '—'}`);
          if (select.validity.valid && trigger.hasAttribute('aria-invalid')) {
            trigger.removeAttribute('aria-invalid');
            trigger.removeAttribute('title');
          }
          const disabled = select.matches(':disabled') || !options.length;
          trigger.tabIndex = disabled ? -1 : 0;
          trigger.setAttribute('aria-disabled',String(disabled));
          if (disabled) control.close();
        },
      };
      controls.set(select,control);
      // Existing editors also update or focus fields directly after a render.
      for (const property of ['value','selectedIndex']) {
        const {get,set} = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, property);
        Object.defineProperty(select,property,{
          configurable:true,
          get() { return get.call(this); },
          set(value) {
            set.call(this,value);
            control.sync();
          },
        });
      }
      select.focus = options => {
        if (dropdown.offsetWidth && trigger.tabIndex >= 0) trigger.focus(options);
      };
      resize.observe(select);
      control.layout();
      control.sync();
      trigger.addEventListener('click',event=>{
        control.sync();
        if (trigger.getAttribute('aria-disabled')==='true') event.preventDefault();
      });
      dropdown.addEventListener('toggle',()=>{
        if (dropdown.open) {
          if (active!==control) active?.close();
          active=control;
          control.sync();
          if (dropdown.open && list.showPopover && !list.matches(':popover-open')) list.showPopover();
          control.position();
        } else {
          if (list.hidePopover && list.matches(':popover-open')) list.hidePopover();
          if (active===control) active=null;
        }
      });
      dropdown.addEventListener('click',event=>{
        const option=event.target.closest('button[data-id]');
        if (!option || option.disabled) return;
        const index=Number(option.dataset.id);
        control.close();
        trigger.focus({preventScroll:true});
        if (select.selectedIndex===index) return;
        select.selectedIndex=index;
        select.dispatchEvent(new Event('input',{bubbles:true}));
        select.dispatchEvent(new Event('change',{bubbles:true}));
      });
      dropdown.addEventListener('keydown',event=>{
        if (!['ArrowDown','ArrowUp','Home','End'].includes(event.key) || trigger.getAttribute('aria-disabled')==='true') return;
        event.preventDefault();
        const options=[...list.querySelectorAll('button:not(:disabled)')];
        if (!options.length) return;
        const index=options.indexOf(document.activeElement);
        dropdown.open=true;
        if (list.showPopover && !list.matches(':popover-open')) { list.showPopover();control.position(); }
        const next=event.key==='Home'?0:event.key==='End'?options.length-1:index<0
          ? Math.max(0,options.findIndex(option=>option.getAttribute('aria-pressed')==='true'))
          : (index+(event.key==='ArrowDown'?1:-1)+options.length)%options.length;
        options[next].focus();
      });
      dropdown.addEventListener('focusout',event=>{
        if (event.relatedTarget && !dropdown.contains(event.relatedTarget)) control.close();
      });
      select.addEventListener('change',control.sync);
      select.addEventListener('input',control.sync);
      select.addEventListener('invalid',event=>{
        event.preventDefault();
        trigger.setAttribute('aria-invalid','true');
        trigger.title=select.validationMessage;
        trigger.focus();
      });
    }

    function scan(node,visit) {
      if (!(node instanceof Element)) return;
      if (node.matches(selector)) visit(node);
      node.querySelectorAll(selector).forEach(visit);
    }
    new MutationObserver(changes=>{
      const updated = new Set();
      for (const change of changes) {
        const target=change.target instanceof Element?change.target:change.target.parentElement;
        const select=target?.closest(selector);
        if (select) updated.add(select);
        if (target?.matches('fieldset') && change.attributeName==='disabled') scan(target,field=>updated.add(field));
        for (const node of change.addedNodes) scan(node,enhance);
        for (const node of change.removedNodes) scan(node,field=>{
          if(field.isConnected)return;
          resize.unobserve(field);
          if(active===controls.get(field))active=null;
        });
      }
      for(const select of updated) controls.get(select)?.sync();
    }).observe(document.body,{
      childList:true,subtree:true,characterData:true,attributes:true,
      attributeFilter:['disabled','selected','label','value'],
    });
    scan(document.body,enhance);
    document.addEventListener('click',event=>{
      if (!event.target.closest('.cm-select-menu')) active?.close();
    });
    document.addEventListener('reset',event=>queueMicrotask(()=>scan(event.target,select=>controls.get(select)?.sync())));
    document.addEventListener('scroll',()=>active?.position(),true);
    window.addEventListener('resize',()=>active?.position());
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',connectSelects,{once:true});
  else connectSelects();
  return {render};
})();

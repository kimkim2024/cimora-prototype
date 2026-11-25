window.CimoraDatePicker = (() => {
  const monthName = new Intl.DateTimeFormat('en', {month:'long', timeZone:'UTC'});
  const dayName = new Intl.DateTimeFormat('en', {dateStyle:'full', timeZone:'UTC'});
  const weekdays = ['Mo','Tu','We','Th','Fr','Sa','Su'];
  const positions = new WeakMap();
  const parse = value => new Date(`${value}T00:00:00Z`);
  const iso = date => date.toISOString().slice(0,10);
  const monthStart = date => {
    const first = new Date(date);
    first.setUTCDate(1);
    return first;
  };
  const addDays = (date, days) => {
    const next = new Date(date);
    next.setUTCDate(date.getUTCDate()+days);
    return next;
  };
  const addMonths = (date, months) => {
    const next = monthStart(date);
    next.setUTCMonth(next.getUTCMonth()+months);
    const last = addDays(monthStart(addDays(next,32)),-1).getUTCDate();
    next.setUTCDate(Math.min(date.getUTCDate(),last));
    return next;
  };
  const valid = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(+parse(value)) && iso(parse(value))===value;
  const icon = path => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
  const previous = icon('m15 18-6-6 6-6');
  const next = icon('m9 18 6-6-6-6');

  function render({id,name,label,value,max}) {
    const E = Site.esc;
    return `<div class="cm-date-picker" data-date-picker data-max="${E(max)}">
      <label for="${E(id)}">${E(label)}</label>
      <div class="cm-date-field">
        <input id="${E(id)}" name="${E(name)}" value="${E(value)}" placeholder="YYYY-MM-DD" autocomplete="off" required aria-describedby="sa-range-error">
        <button type="button" class="cm-date-open" popovertarget="${E(id)}-calendar" aria-label="Choose ${E(label.toLowerCase())}">${icon('M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z')}</button>
      </div>
      <div id="${E(id)}-calendar" class="cm-date-popover" popover="auto" role="dialog" aria-label="Choose ${E(label.toLowerCase())}"></div>
    </div>`;
  }

  function open(picker) {
    const input = picker.querySelector('input');
    const panel = picker.querySelector('[popover]');
    const trigger = picker.querySelector('.cm-date-open');
    const max = picker.dataset.max;
    const limit = parse(max);
    let focus = valid(input.value) && input.value<=max ? parse(input.value) : limit;
    let month = monthStart(focus), view = 'days', firstYear = month.getUTCFullYear()-5;
    const selected = () => input.value.trim();
    function position() {
      const rect = input.parentElement.getBoundingClientRect();
      const {offsetWidth:width,offsetHeight:height} = panel;
      const left = Math.max(8,Math.min(rect.left,innerWidth-width-8));
      const top = rect.bottom+height+14<=innerHeight || rect.top<height+14 ? rect.bottom+6 : rect.top-height-6;
      panel.style.left = `${left}px`;
      panel.style.top = `${Math.max(8,Math.min(top,innerHeight-height-8))}px`;
    }
    function paint() {
      const year = month.getUTCFullYear(), name = monthName.format(month);
      const title = `${name} ${year}`;
      const prevLabel = view==='years'?'Previous years':view==='months'?'Previous year':'Previous month';
      const nextLabel = view==='years'?'Next years':view==='months'?'Next year':'Next month';
      const offset = view==='months'?12:1;
      const nextDisabled = view==='years'?firstYear+12>limit.getUTCFullYear():+addMonths(month,offset)>+limit;
      const prevDisabled = view==='years'?firstYear<=1000:year===1000&&(view==='months'||month.getUTCMonth()===0);
      let body;
      if(view==='days') {
        const start = addDays(month,-(month.getUTCDay()+6)%7);
        const weeks = Array.from({length:6},(_,week)=>`<tr>${Array.from({length:7},(_,day)=>{
          const date = addDays(start,week*7+day), value = iso(date);
          return `<td><button type="button" data-day="${value}" aria-label="${dayName.format(date)}" aria-pressed="${value===selected()}" ${value===max?'aria-current="date"':''} ${date.getUTCMonth()!==month.getUTCMonth()?'data-outside':''} tabindex="${value===iso(focus)?'0':'-1'}" ${value>max?'disabled':''}>${date.getUTCDate()}</button></td>`;
        }).join('')}</tr>`).join('');
        body = `<table class="cm-date-days" aria-label="${title}"><thead><tr>${weekdays.map(label=>`<th scope="col">${label}</th>`).join('')}</tr></thead><tbody>${weeks}</tbody></table>`;
      } else {
        const choices = Array.from({length:12},(_,index)=>{
          const date = addMonths(monthStart(month),index-month.getUTCMonth());
          const value = view==='months'?index:firstYear+index;
          const label = view==='months'?monthName.format(date).slice(0,3):value;
          const active = view==='months'?index===month.getUTCMonth():value===year;
          const disabled = view==='months'?+date>+limit:value<1000||value>limit.getUTCFullYear();
          return `<button type="button" data-choice="${value}" aria-pressed="${active}" ${disabled?'disabled':''}>${label}</button>`;
        });
        body = `<div class="cm-date-choices">${choices.join('')}</div>`;
      }
      panel.innerHTML = `<div class="cm-date-nav">
        <button type="button" data-nav="-1" aria-label="${prevLabel}" ${prevDisabled?'disabled':''}>${previous}</button>
        <div class="cm-date-title"><button type="button" data-view="months" aria-label="Choose month" aria-pressed="${view==='months'}">${name}</button><button type="button" data-view="years" aria-label="Choose year" aria-pressed="${view==='years'}">${year}</button></div>
        <button type="button" data-nav="1" aria-label="${nextLabel}" ${nextDisabled?'disabled':''}>${next}</button>
       </div><span class="cm-date-announcement" aria-live="polite">${view==='years'?`${firstYear}–${firstYear+11}`:title}</span>${body}`;
      position();
    }
    function showDay(date) {
      focus = +date>+limit ? limit : date;
      month = monthStart(focus);
      view = 'days';
      paint();
      panel.querySelector('[tabindex="0"]').focus({preventScroll:true});
    }
    panel.onclick = event => {
      const button = event.target.closest('button');
      if(!button||button.disabled)return;
      const {day,nav,view:targetView,choice} = button.dataset;
      if(day) {
        input.value = day;
        input.removeAttribute('aria-invalid');
        input.dispatchEvent(new Event('input',{bubbles:true}));
        panel.hidePopover();
        trigger.focus();
        return;
      }
      let focusSelector;
      if(nav) {
        if(view==='years')firstYear+=12*Number(nav);
        else {
          month = addMonths(month,(view==='months'?12:1)*Number(nav));
          focus = month;
        }
        focusSelector = `[data-nav="${nav}"]:not(:disabled)`;
      } else if(targetView) {
        view = targetView;
        firstYear = month.getUTCFullYear()-5;
        focusSelector = '[data-choice][aria-pressed="true"]';
      } else if(choice!==undefined) {
        if(view==='years') {
          month.setUTCFullYear(Number(choice));
          view = 'months';
          focusSelector = '[data-choice]:not(:disabled)';
        } else {
          month.setUTCMonth(Number(choice));
          showDay(month);
          return;
        }
      }
      paint();
      (panel.querySelector(focusSelector)||panel.querySelector('.cm-date-title button')).focus({preventScroll:true});
    };
    panel.onkeydown = event => {
      const value = event.target.dataset.day;
      if(!value)return;
      const current = parse(value), weekday = (current.getUTCDay()+6)%7;
      const deltas = {ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7,Home:-weekday,End:6-weekday};
      const date = Object.hasOwn(deltas,event.key)?addDays(current,deltas[event.key]):
        event.key==='PageUp'?addMonths(current,-1):event.key==='PageDown'?addMonths(current,1):null;
      if(!date)return;
      event.preventDefault();
      if(date.getUTCFullYear()>=1000)showDay(date);
    };
    positions.set(panel,position);
    showDay(focus);
  }

  document.addEventListener('toggle',event=>{
    if(event.newState==='open'&&event.target.matches('.cm-date-popover'))open(event.target.closest('[data-date-picker]'));
  },true);
  const reposition = () => {
    const panel = document.querySelector('.cm-date-popover:popover-open');
    if(panel)positions.get(panel)?.();
  };
  window.addEventListener('resize',reposition);
  window.addEventListener('scroll',reposition,true);
  return {render};
})();

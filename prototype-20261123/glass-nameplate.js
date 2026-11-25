window.CimoraGlassNameplate = {
  render({name, portrait}) {
    const escape = Site.esc;
    return `<span class="cm-glass-nameplate">
      ${portrait ? `<img class="cm-glass-nameplate-portrait" src="${escape(portrait)}" alt="">` : ''}
      <span class="cm-glass-nameplate-name">${escape(name)}</span>
    </span>`;
  },
};

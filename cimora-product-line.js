/* The public creative assistant uses local prompts and suggestions for the prototype. */
function productIdeaCard(title, hook, nextStep) {
  const { esc } = Site;
  return `<article class="p3l-idea">
    <h3>${esc(title)}</h3>
    <p>${esc(hook)}</p>
    <p>${esc(nextStep)}</p>
    <span><span aria-hidden="true">✓</span> Idea draft</span>
  </article>`;
}

function productLine() {
  const { link } = Site;
  return `<section class="p3l" aria-labelledby="p3l-title">
    <header class="p3l-hero">
      <h2 id="p3l-title">Find the story in your first idea.</h2>
      <p>Brainstorm a hook, a character, or an opening scene with the creative assistant.</p>
      <div class="p3l-actions">
        <button type="button" class="button ghost" data-pl-walkthrough>Try the assistant</button>
        ${link('Open Demo Project', '/app/video?project=video-sc-workspace-rain&tab=overview&chapter=ch1--ch1', 'button primary')}
      </div>
    </header>
    <div class="p3l-media">
      <img class="p3l-backdrop" src="assets/product-rain-city.webp" alt="" loading="lazy" decoding="async">
      <div class="p3l-demo" aria-labelledby="p3l-chat-title">
        <header class="p3l-demo-heading"><strong id="p3l-chat-title">AI Creative Assistant</strong><span>Interactive demo</span></header>
        <div class="p3l-chat" role="log" aria-label="Creative conversation" aria-relevant="additions" tabindex="0">
          <div class="p3l-greeting">
            <span class="p3l-assistant-icon" aria-hidden="true">✦</span>
            <p>Hi! What would you like to create?</p>
          </div>
          <p class="p3l-user-message"><span class="p3l-sr-only">You: </span>A comic about two old friends who meet in a bookshop on a rainy night.</p>
          ${productIdeaCard('The Letter in the Bookshop',
            'An unsent letter falls from a book just as an old friend walks through the door.',
            'Opening panel: warm light spills onto the rain-soaked street.')}
        </div>
        <form class="p3l-composer">
          <input type="text" aria-label="Describe your story idea" placeholder="Describe your story idea..." maxlength="300" required>
          <button type="submit" aria-label="Send idea" title="Send idea">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
    <p class="p3l-art-credit"><a href="https://www.peppercarrot.com/en/viewer/artworks-src__2022-12-06_Rain-City_by-David-Revoy.html">Rain City</a> by David Revoy · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> · Cropped for display</p>
  </section>`;
}

document.addEventListener('submit', event => {
  const form = event.target.closest?.('.p3l-composer');
  if (!form) return;
  event.preventDefault();
  const input = form.querySelector('input');
  const prompt = input.value.trim();
  if (!prompt) {
    input.focus();
    return;
  }
  const chat = form.previousElementSibling;
  const { esc } = Site;
  let idea = ['Find the turning point', 'Give the main character one clear goal, then introduce a choice that puts it at risk.', 'Opening scene: show the goal through an action before anyone explains it.'];
  if (/mystery|detective|clue|悬疑|侦探|线索/i.test(prompt)) {
    idea = ['The clue in plain sight', 'Let the character overlook an ordinary object until a second witness contradicts the first.', 'Opening scene: show the object before revealing why it matters.'];
  } else if (/magic|fantasy|dragon|witch|魔法|奇幻|龙/i.test(prompt)) {
    idea = ['A spell with a price', 'Give the character a magical shortcut that costs them something they planned to protect.', 'Opening scene: let a small spell go wrong in front of the one person who can help.'];
  } else if (/friend|romance|reunion|love|朋友|重逢|爱情/i.test(prompt)) {
    idea = ['The conversation they avoided', 'Put two people with different memories of the same event in a place they once shared.', 'Opening scene: one recognizes a familiar habit before seeing the other’s face.'];
  }
  chat.insertAdjacentHTML('beforeend', `<p class="p3l-user-message"><span class="p3l-sr-only">You: </span>${esc(prompt)}</p>${productIdeaCard(...idea)}`);
  form.reset();
  input.focus({ preventScroll: true });
  chat.scrollTop = chat.scrollHeight;
});

document.addEventListener('click', event => {
  const control = event.target.closest?.('[data-pl-walkthrough]');
  if (!control) return;
  const section = control.closest('.p3l');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  section.querySelector('.p3l-demo').scrollIntoView({ block: 'center', behavior: reduced ? 'instant' : 'smooth' });
  section.querySelector('.p3l-composer input').focus({ preventScroll: true });
});

function plReveal() {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  requestAnimationFrame(() => {
    const section = document.querySelector('.p3l');
    if (!section) return;
    const observer = new IntersectionObserver((entries, observer) => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue;
        target.classList.add('p3l-visible');
        observer.disconnect();
      }
    }, { rootMargin: '0px 0px -70px 0px' });
    observer.observe(section);
  });
}

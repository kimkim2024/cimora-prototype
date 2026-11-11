/* Smoke Login, ported to plain JS (no framework, no build step).
   Left half: a small stack of paper with live smoke drifting across it, one
   WebGL fragment shader (domain-warped noise) with an acid green vein in the
   plumes; the pointer stirs it. Right half: the sign-in / create-account form
   on plain paper. The shader holds still under prefers-reduced-motion. */
(() => {
  const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';

  const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uDark;

float hash(vec2 p){ p = fract(p * vec2(234.34, 435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0., a = .5;
  mat2 r = mat2(.8, .6, -.6, .8);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.02 + vec2(1.7, 9.2); a *= .5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float ar = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * ar, uv.y) * 1.25;
  float t = uTime * .07;

  // The pointer stirs a slow eddy into the smoke.
  vec2 d = p - vec2(uMouse.x * ar, uMouse.y) * 1.25;
  float k = exp(-dot(d, d) * 1.6);
  p += vec2(-d.y, d.x) * k * .55;

  // Two rounds of domain warping: the classic recipe for curling, billowing plumes.
  vec2 q = vec2(fbm(p + vec2(0., t)), fbm(p + vec2(5.2, 1.3) - t * .8));
  vec2 r = vec2(fbm(p + 3. * q + vec2(1.7, 9.2) + t * 1.2), fbm(p + 3. * q + vec2(8.3, 2.8) - t));
  float f = fbm(p + 2.6 * r + vec2(t * .4, -t * .3));

  float smoke = smoothstep(.3, .85, f);
  smoke *= smoke;
  float wisp = smoothstep(.55, .75, f) * (1. - smoothstep(.75, .95, f)); // bright rims on the plumes
  float vein = (1. - smoothstep(.0, .04, abs(f - .58))) * smoothstep(.42, .62, r.y); // acid green thread along a plume edge

  vec3 green = vec3(.62, 1., .23);

  // light: ink smoke on paper
  vec3 paper = vec3(.968, .964, .949);
  vec3 lit = mix(paper, vec3(.07, .08, .07), smoke * .92);
  lit = mix(lit, vec3(.36, .72, .02), vein * .7);
  lit += (1. - smoke) * wisp * .03;

  // dark: pale smoke in the dark, green glowing through it
  vec3 night = mix(vec3(.04, .045, .04), vec3(.03, .035, .03), uv.y);
  vec3 drk = night + vec3(.78, .8, .76) * smoke * .62 + vec3(.9) * wisp * .08;
  drk += green * vein * .8;

  vec3 col = mix(lit, drk, uDark);
  col += (hash(gl_FragCoord.xy + fract(t)) - .5) / 255.; // dither against banding
  gl_FragColor = vec4(col, 1.);
}`;

  // Smoke is all soft gradients, so render small and let the browser upscale.
  const RENDER_SCALE = 0.4;

  const MODES = {
    signin: {
      title: 'Welcome back',
      sub: 'Sign in to pick up where you left off.',
      action: 'Sign in',
      foot: 'New here?',
      footAction: 'Create an account',
      autocomplete: 'current-password',
      theme: 'Switch to light mode',
    },
    signup: {
      title: 'Create your studio',
      sub: 'One account for stories, characters, comics and motion.',
      action: 'Create account',
      foot: 'Already have an account?',
      footAction: 'Sign in',
      autocomplete: 'new-password',
      theme: 'Switch to light mode',
    },
  };

  const eye = (off) => off
    ? '<svg class="pa-icon-eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 002.8 2.8"/><path d="M9.9 5.2A9.9 9.9 0 0112 5c5 0 8.5 4.2 9.4 6.1.2.4.2.9 0 1.3-.4.9-1.3 2.2-2.6 3.4"/><path d="M6.3 6.6C4.6 7.9 3.5 9.5 2.7 11.1c-.2.4-.2.9 0 1.3C3.6 14.3 7 18.5 12 18.5c1.4 0 2.7-.3 3.8-.9"/></svg>'
    : '<svg class="pa-icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.6 11.1C3.5 9.3 7 5.1 12 5.1s8.5 4.2 9.4 6c.2.4.2.9 0 1.3-.9 1.8-4.4 6-9.4 6s-8.5-4.2-9.4-6a1.5 1.5 0 010-1.3z"/><circle cx="12" cy="12" r="3"/></svg>';

  const apple = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>';
  const google = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>';

  function render() {
    // workspace.afterRender is replaced by later modules, so mount right after
    // the markup lands instead of relying on it.
    requestAnimationFrame(mount);
    return `<link rel="stylesheet" href="cimora-auth.css"><main class="public-auth" data-theme="dark" data-mode="signin">
<div class="pa-grain" aria-hidden="true"></div>
<section class="pa-visual" aria-hidden="true">
<div class="pa-sheet pa-sheet--back"></div>
<div class="pa-sheet pa-sheet--mid"></div>
<div class="pa-paper">
<canvas class="pa-smoke"></canvas>
<div class="pa-grain pa-grain--panel"></div>
<a class="pa-brand" href="#/">Studio Cimora</a>
<div class="pa-caption">
<p class="pa-caption-title">Breathe in.<br>The rest can wait.</p>
<p class="pa-caption-sub">A quieter way into your story.</p>
</div>
</div>
</section>
<section class="pa-side">
<button type="button" class="pa-theme" data-pa="theme" aria-label="Switch to light mode">
<svg class="pa-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"/></svg>
<svg class="pa-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>
<span class="pa-theme-text">Dark</span>
</button>
<div class="pa-form">
<div class="pa-tabs" role="tablist" aria-label="Account mode">
<button type="button" role="tab" class="pa-tab" data-pa="mode" data-mode="signin" aria-selected="true">Sign in</button>
<button type="button" role="tab" class="pa-tab" data-pa="mode" data-mode="signup" aria-selected="false">Create account</button>
</div>
<h1 class="pa-title pa-rise" data-pa="title" style="--pa-d:60ms">Welcome back</h1>
<p class="pa-sub pa-rise" data-pa="sub" style="--pa-d:130ms">Sign in to pick up where you left off.</p>
<form class="pa-fields" data-pa="form" novalidate>
<label class="pa-field pa-rise" data-pa="name-field" style="--pa-d:190ms" hidden>
<span class="pa-label">Display name</span>
<input class="pa-input" type="text" name="name" autocomplete="name" placeholder="Story Creator">
</label>
<label class="pa-field pa-rise" style="--pa-d:250ms">
<span class="pa-label">Email</span>
<input class="pa-input" type="email" name="email" autocomplete="email" placeholder="you@studio.com" required>
</label>
<div class="pa-field pa-rise" style="--pa-d:310ms">
<span class="pa-label-row">
<label class="pa-label" for="pa-password">Password</label>
<button type="button" class="pa-text-btn" data-pa="forgot">Forgot?</button>
</span>
<div class="pa-input-wrap">
<input class="pa-input pa-input--pw" id="pa-password" type="password" name="password" autocomplete="current-password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" required>
<button type="button" class="pa-eye" data-pa="eye" aria-label="Show password">${eye(false)}${eye(true)}</button>
</div>
</div>
<div class="pa-actions pa-rise" style="--pa-d:370ms">
<button type="submit" class="pa-submit" data-pa="submit">
<span class="pa-spinner" aria-hidden="true"></span>
<span data-pa="action">Sign in</span>
</button>
</div>
</form>
<div class="pa-or pa-rise" style="--pa-d:430ms" aria-hidden="true"><span></span>Or<span></span></div>
<div class="pa-providers pa-rise" style="--pa-d:470ms">
<button type="button" class="pa-provider" data-pa="provider" data-provider="apple">${apple} Apple</button>
<button type="button" class="pa-provider" data-pa="provider" data-provider="google">${google} Google</button>
</div>
<p class="pa-foot pa-rise" style="--pa-d:520ms"><span data-pa="foot">New here?</span> <button type="button" class="pa-link" data-pa="switch"><span data-pa="foot-action">Create an account</span></button></p>
<p class="pa-legal pa-rise" style="--pa-d:570ms"><a href="#/app">Explore the Studio as a guest</a> &middot; <a href="#/legal/privacy">Privacy</a> &middot; <a href="#/legal/terms">Terms</a></p>
<p class="pa-note pa-rise" style="--pa-d:620ms">Local demo. No credentials are sent or stored.</p>
</div>
</section>
</main>`;
  }

  /* ---- shader ----------------------------------------------------------- */
  function smoke(root) {
    const canvas = root.querySelector('.pa-smoke');
    const gl = canvas && canvas.getContext('webgl', { antialias: false, alpha: false, depth: false });
    let darkTarget = root.dataset.theme === 'dark' ? 1 : 0;
    if (!canvas || !gl) return { setDark: (dark) => { darkTarget = dark ? 1 : 0; } }; // the paper colour stands in

    const shader = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[Cimora auth smoke]', gl.getProgramInfoLog(program));
      return { setDark: (dark) => { darkTarget = dark ? 1 : 0; } };
    }
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'uRes');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uMouse = gl.getUniformLocation(program, 'uMouse');
    const uDark = gl.getUniformLocation(program, 'uDark');

    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const started = performance.now();
    // Start mid-drift so the first frame is already full of smoke.
    const mouse = { x: .7, y: .4, tx: .7, ty: .4 };
    let shade = darkTarget;
    let time = 40;
    let frame = 0;
    let last = 0;

    const draw = () => {
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uDark, shade);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now) => {
      if (!canvas.isConnected) { cancelAnimationFrame(frame); frame = 0; return; } // route changed: stop drawing
      frame = requestAnimationFrame(loop);
      if (now - last < 1000 / 30 - 2) return; // slow smoke doesn't need more than 30fps
      const dt = Math.min((now - last) / 1000, .1);
      last = now;
      time = 40 + (now - started) / 1000;
      // Ease the pointer and the theme so both glide rather than snap.
      mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 2.2);
      mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 2.2);
      shade += (darkTarget - shade) * Math.min(1, dt * 3.5);
      draw();
    };

    const play = () => {
      cancelAnimationFrame(frame);
      if (reduce.matches) draw();
      else frame = requestAnimationFrame(loop);
    };

    const resize = () => {
      const scale = Math.min(devicePixelRatio || 1, 2) * RENDER_SCALE;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      draw();
    };

    const onMove = (event) => {
      const box = canvas.getBoundingClientRect();
      if (!box.width || !box.height) return;
      mouse.tx = (event.clientX - box.left) / box.width;
      mouse.ty = 1 - (event.clientY - box.top) / box.height;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    canvas.addEventListener('pointermove', onMove, { passive: true });
    reduce.addEventListener('change', play);
    resize();
    play();

    return {
      setDark(dark) {
        darkTarget = dark ? 1 : 0;
        // Under reduced motion there is no loop, so a theme change redraws once.
        if (reduce.matches) { shade = darkTarget; draw(); }
      },
    };
  }

  /* ---- interactions ----------------------------------------------------- */
  function mount() {
    const root = document.querySelector('.public-auth');
    if (!root || root.dataset.paMounted === 'true') return;
    root.dataset.paMounted = 'true';
    const site = window.Site;

    const shader = smoke(root);
    const form = root.querySelector('[data-pa="form"]');
    const submit = root.querySelector('[data-pa="submit"]');
    const action = root.querySelector('[data-pa="action"]');
    const password = root.querySelector('#pa-password');
    const nameField = root.querySelector('[data-pa="name-field"]');
    const themeBtn = root.querySelector('[data-pa="theme"]');
    const themeText = root.querySelector('.pa-theme-text');
    const control = root.querySelectorAll('.pa-submit, .pa-provider');
    let busy = false;

    const finish = () => {
      busy = false;
      control.forEach((el) => { el.disabled = false; });
      submit.dataset.busy = 'false';
      if (site?.completeAuth) site.completeAuth();
    };

    const start = () => {
      if (busy) return;
      busy = true;
      control.forEach((el) => { el.disabled = true; });
      submit.dataset.busy = 'true';
      setTimeout(finish, 1100);
    };

    const setMode = (mode) => {
      const copy = MODES[mode] || MODES.signin;
      root.dataset.mode = mode;
      root.querySelector('[data-pa="title"]').textContent = copy.title;
      root.querySelector('[data-pa="sub"]').textContent = copy.sub;
      action.textContent = copy.action;
      root.querySelector('[data-pa="foot"]').textContent = copy.foot;
      root.querySelector('[data-pa="foot-action"]').textContent = copy.footAction;
      nameField.hidden = mode !== 'signup';
      password.setAttribute('autocomplete', copy.autocomplete);
      root.querySelectorAll('[data-pa="mode"]').forEach((tab) => {
        tab.setAttribute('aria-selected', String(tab.dataset.mode === mode));
      });
      form.elements.email.focus({ preventScroll: true });
    };

    root.querySelectorAll('[data-pa="mode"]').forEach((tab) => {
      tab.addEventListener('click', () => setMode(tab.dataset.mode));
    });

    root.querySelector('[data-pa="switch"]').addEventListener('click', () => {
      setMode(root.dataset.mode === 'signin' ? 'signup' : 'signin');
    });

    themeBtn.addEventListener('click', () => {
      const dark = root.dataset.theme !== 'dark';
      root.dataset.theme = dark ? 'dark' : 'light';
      themeText.textContent = dark ? 'Dark' : 'Light';
      themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      shader.setDark(dark);
    });

    root.querySelector('[data-pa="eye"]').addEventListener('click', (event) => {
      const btn = event.currentTarget;
      const shown = btn.dataset.shown !== 'true';
      btn.dataset.shown = String(shown);
      password.type = shown ? 'text' : 'password';
      btn.setAttribute('aria-label', shown ? 'Hide password' : 'Show password');
    });

    root.querySelector('[data-pa="forgot"]').addEventListener('click', () => {
      if (site?.toast) site.toast('Demo: password reset is not connected to an inbox.');
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (busy) return;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      start();
    });

    root.querySelectorAll('[data-pa="provider"]').forEach((btn) => {
      btn.addEventListener('click', () => start());
    });
  }

  window.CimoraAuth = { render, mount };
})();

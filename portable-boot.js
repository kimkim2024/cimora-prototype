(() => {
  const base = new URL('.', document.currentScript.src);
  const originalFetch = window.fetch.bind(window);
  const media = window.CimoraPortableMedia || {};
  const mediaSource = input => {
    const url = new URL(input, location.href);
    if (location.protocol !== 'file:' || !url.href.startsWith(base.href)) return null;
    return media[decodeURIComponent(url.href.split('?')[0].split('#')[0].slice(base.href.length))] || null;
  };
  if (location.protocol === 'file:' && typeof HTMLImageElement !== 'undefined') {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    Object.defineProperty(HTMLImageElement.prototype, 'src', {...descriptor, set(value) { descriptor.set.call(this, mediaSource(value) || value); }});
  }
  window.fetch = (input, options) => {
    const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url, location.href);
    const relative = decodeURIComponent(url.href.split('?')[0].split('#')[0].slice(base.href.length));
    const inline = mediaSource(url);
    if (inline && (!options?.method || options.method === 'GET')) return originalFetch(inline, options);
    if (location.protocol === 'file:' && url.href.startsWith(base.href) && Object.hasOwn(window.CimoraPortableResources, relative) && (!options?.method || options.method === 'GET')) {
      return Promise.resolve(new Response(window.CimoraPortableResources[relative], {status:200, headers:{'Content-Type':relative.endsWith('.json')?'application/json':'text/html; charset=utf-8'}}));
    }
    return originalFetch(input, options);
  };
  const seed = window.CimoraPortableSeed;
  const videoId = new URLSearchParams(seed.routes.video.split('?')[1]).get('project');
  const addMissing = (target, samples, field = 'id') => {
    if (!Array.isArray(target)) throw Error('已有工程列表格式异常');
    for (const sample of samples || []) if (!target.some(item => item[field] === sample[field])) target.push(sample);
  };
  try {
    for (const [key, value] of Object.entries(seed.storage)) {
      try {
        const existing = localStorage.getItem(key);
        if (!existing) { localStorage.setItem(key, value); continue; }
        const current = JSON.parse(existing), sample = JSON.parse(value);
        if (key === 'framein-site-v1') {
          const sampleProject = sample.projects.find(project => project.id === videoId);
          const missing = !current.projects.some(project => project.id === videoId);
          addMissing(current.projects, [sampleProject]);
          if (missing) {
            current.cimora ??= {...sample.cimora, projects:{}};
            current.cimora.projects ??= {};
            if (!current.cimora.projects[videoId]) current.cimora.projects[videoId] = sample.cimora.projects[videoId];
            current.assets ??= [];
            addMissing(current.assets, sample.assets.filter(asset => asset.projectId === videoId));
          }
        } else {
          addMissing(current.projects, sample.projects);
          if (key === 'cimora-script-studio-v1') {
            current.assets ??= [];
            addMissing(current.assets, sample.assets, 'assetId');
          }
        }
        localStorage.setItem(key, JSON.stringify(current));
      } catch (error) {
        console.warn('演示案例未载入，已有内容保持原样：'+key, error.message);
      }
    }
  } catch (error) {
    window.addEventListener('DOMContentLoaded', () => {
      const notice = document.createElement('p');
      notice.textContent = '当前浏览器未允许本地存储。请使用 Chrome / Edge，或使用包内本地服务启动脚本。';
      notice.style.cssText = 'position:fixed;bottom:0;left:0;right:0;padding:12px;background:#fff3cd;color:#5f4500;z-index:99999;margin:0';
      document.body.append(notice);
    });
  }
  const stages = {
    story:[['灵感与故事概览','查看原始灵感、三份方向与采用后的完整故事。'],['人物','查看陆川、许宁等人物背景与关系。'],['分集大纲','查看10集安排及起承转合的阶段规划。'],['正文','逐集查看完整正文；这些内容可以选作漫画和视频的来源。']],
    comic:[['内容策划','查看从故事带入的角色事实、简介和前两集集纲。'],['视觉资产','选择人物、场景或道具，查看参考图与采用版本。'],['漫画编排','右边选择集，中间读原正文，左边查看或编辑分页与资产关联。'],['生成与编辑','右边选择集与页，中间阅读已完成漫画，左边填写整页修改要求。']],
    video:[['内容策划','查看已带入的两集故事、角色和正文；通过对话继续调整。'],['视觉资产','查看继承的角色、场景和道具采用图，可修改或替换参考。'],['镜头编排','切换两集，查看分镜内容、资产、提示词和采用画面；可体验画布模式。'],['整集制作','播放静态镜头序列，拖动三轨片段；选择音频或背景音可生成候选、试听并替换。']]
  };
  const routeFor = (kind, step = 0) => {
    const route = seed.routes[kind];
    return kind === 'video' ? route.replace(/stage=\d+/, 'stage='+(step+1)) : route;
  };
  const hrefFor = (kind, step) => new URL('index.html',base).href+'#'+routeFor(kind,step);
  function guide() {
    const host = document.querySelector('.cm-main');
    if (!host) return;
    const raw = location.hash.slice(1), params = new URLSearchParams(raw.split('?')[1]);
    const kind = raw.startsWith('/app/video') ? 'video' : raw.startsWith('/app/comic') ? 'comic' : raw.startsWith('/app/script') ? 'story' : '';
    const sampleProject = kind && new URLSearchParams(seed.routes[kind].split('?')[1]).get('project');
    const isSample = kind && params.get('project') === sampleProject;
    const key = raw+'|'+isSample;
    if (document.getElementById('portable-demo-guide')?.dataset.key === key) return;
    document.getElementById('portable-demo-guide')?.remove();
    const panel = document.createElement('section');
    panel.id = 'portable-demo-guide';panel.dataset.key = key;
    panel.style.cssText = 'padding:16px 20px;margin-bottom:20px;background:var(--cm-panel,#fff);border:1px solid #cabbe3;border-radius:14px;line-height:1.7';
    const title = isSample ? '正在体验《离城之前》完整案例' : '不知道从哪里开始？打开完整演示案例';
    panel.innerHTML = `<strong>${title}</strong><p style="margin:5px 0 12px;color:#736a80">10集故事 → 前两集12页漫画 → 两集视频交互。${isSample?'下方是已填充的示例，可随时切换步骤查看。':'保留你当前的作品，打开已填好内容与图片的独立示例。'}</p><div style="display:flex;flex-wrap:wrap;gap:8px">${['story','comic','video'].map((item,index)=>`<a class="cm-button ghost" data-portable-sample="${item}" href="${hrefFor(item,0)}">${['故事完整案例','漫画完整案例','视频完整案例'][index]} →</a>`).join('')}</div>${isSample?`<details open style="margin-top:12px"><summary>怎么体验这四步</summary><ol style="padding-left:22px;margin:8px 0">${stages[kind].map(([label,text],index)=>`<li style="margin:5px 0"><a data-portable-step="${kind}" data-step="${index}" href="${hrefFor(kind,index)}">${label}</a>：${text}</li>`).join('')}</ol><small>示例为预先准备的完整案例；新生成不调用在线模型，视频使用静态图片演示。建议先按顺序查看，再尝试修改。</small></details>`:''}`;
    host.prepend(panel);
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-portable-step]');
    if (!link || link.dataset.portableStep === 'video') return;
    const kind = link.dataset.portableStep, key = kind === 'story' ? 'cimora-script-studio-v1' : 'cimora-comic-studio-v1';
    try {
      const data = JSON.parse(localStorage.getItem(key)), projectId = new URLSearchParams(seed.routes[kind].split('?')[1]).get('project');
      const project = data.projects.find(item => item.id === projectId);
      if (!project) throw Error('完整案例尚未载入');
      project.stage = kind === 'story' ? [2,3,4,5][Number(link.dataset.step)] : Number(link.dataset.step);
      data.active = project.id;
      localStorage.setItem(key, JSON.stringify(data));
      event.preventDefault();
      const destination = hrefFor(kind, Number(link.dataset.step));
      if (location.href === destination) location.reload(); else location.href = destination;
    } catch (error) { event.preventDefault(); alert(error.message); }
  });
  const startGuide = () => {new MutationObserver(guide).observe(document.getElementById('site') || document.body,{childList:true,subtree:true});guide();};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startGuide); else startGuide();
})();

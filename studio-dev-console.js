(() => {
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:10000';
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `
    <style>
      details{font:13px/1.45 system-ui,sans-serif;color:#181818;background:#fff;border:1px solid #ddd;border-radius:14px;box-shadow:0 5px 22px #0002;overflow:auto;max-height:85vh}
      details[open]{width:min(246px,82vw)}
      summary{cursor:pointer;padding:9px 14px;font-weight:650;list-style:none}
      summary::after{content:'＋';float:right;margin-left:14px}
      details[open] summary::after{content:'−'}
      section,nav{border-top:1px solid #ddd;padding:7px}
      p,a{display:flex;justify-content:space-between;gap:8px;padding:4px 7px;margin:0}
      a{color:inherit;text-decoration:none;border-radius:6px}
      a:hover,a:focus-visible,a[aria-current]{background:#edf4dd}
      small,output{color:#555;overflow-wrap:anywhere}
    </style>
    <details><summary>调试台</summary><section>
      <p>当前路由 <output id="route"></output></p>
      <p>视口 <output id="size"></output></p>
    </section><nav aria-label="预览页面"></nav></details>`;
  const pages = [
    ['创作空间','/app'], ['无限画布','/app/infinite-canvas'], ['项目库','/app/projects'], ['素材库','/app/assets'],
    ['任务编排','/app/tasks'], ['创作工具','/app/tools'], ['导出交付','/app/exports'],
    ['项目管理','/app/projects?view=manage'], ['回收站','/app/trash'], ['积分账户','/app/wallet'], ['官网首页','/'], ['产品','/product'], ['展示','/showcase'], ['模板','/templates'],
    ['指南','/resources'], ['价格','/pricing'], ['工具','/tools'], ['帮助','/help']
  ];
  const nav = root.querySelector('nav');
  for (const [label,path] of pages) {
    const link = document.createElement('a');
    link.href = '#' + path;
    link.textContent = label;
    const route = document.createElement('small');
    route.textContent = path;
    link.append(route);
    nav.append(link);
  }
  const details = root.querySelector('details');
  try { details.open = localStorage.getItem('cimora.devconsole') !== '0'; } catch { details.open = true; }
  details.addEventListener('toggle', () => {
    try { localStorage.setItem('cimora.devconsole', details.open ? '1' : '0'); } catch {}
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.h17-debug')) return;
    details.open = true;
    root.querySelector('summary').focus();
  });
  function updateRoute() {
    const path = location.hash.slice(1) || '/';
    root.querySelector('#route').textContent = path;
    for (const link of nav.children) {
      if (link.href === location.href) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    }
  }
  function updateSize() {
    root.querySelector('#size').textContent = innerWidth + ' × ' + innerHeight;
  }
  window.addEventListener('hashchange', updateRoute);
  window.addEventListener('resize', updateSize);
  updateRoute();
  updateSize();
  document.body.append(host);
})();

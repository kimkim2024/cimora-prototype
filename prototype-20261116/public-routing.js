(() => {
  const root = new URL('.', document.currentScript.src);
  const aliases = {'/':'index.html','/product':'product/index.html','/features/webtoon':'features/comic/index.html','/features/motion-comic':'features/video/index.html','/features/studio':'product/index.html','/features/story':'features/story/index.html','/features/comic':'features/comic/index.html','/features/video':'features/video/index.html','/tools':'tools/index.html','/showcase':'showcase/index.html','/templates':'market/index.html','/market':'market/index.html','/pricing':'pricing/index.html','/resources':'resources/index.html','/help':'help/index.html'};
  const tools = ['anime-draw','sticker-maker','oc-sheet','expressions','image-motion','video-redraw','voiceover','music-sound','lettering','colorize','remove-bg','live2d-generation','pngtuber','batch-assets'];
  for (const tool of tools) aliases['/tools/'+tool]='tools/'+tool+'/index.html';
  const destination = path => aliases[path] || (path.startsWith('/showcase/')?'showcase/index.html':path.startsWith('/templates/')?'market/index.html':path.startsWith('/resources/')?'resources/index.html':path.startsWith('/legal')?'legal/index.html':null);
  window.CimoraPublicRoutes = {
    redirect(context) {
      const target = destination(context.path);
      if (!target) return false;
      location.replace(new URL(target,root));
      return true;
    }
  };
  if (!document.documentElement.hasAttribute('data-public-site')) return;
  let loading = false;
  async function navigate() {
    const path = location.hash.slice(1).split('?')[0];
    if (!path || !path.startsWith('/')) return;
    const target = destination(path);
    if (target) {
      if (path === '/' && location.pathname === root.pathname+'index.html') history.replaceState(null,'',location.pathname);
      else location.replace(new URL(target,root));
      return;
    }
    if (loading) return;
    loading = true;
    try {
      const response = await fetch(new URL('workspace-shell.html',root));
      if (!response.ok) throw Error('工作台暂时无法读取');
      const html = await response.text();
      document.open();
      document.addEventListener('DOMContentLoaded',()=>window.CimoraPortableMount?.(),{once:true});
      document.write(html);
      document.close();
    } catch (error) {
      loading = false;
      const status = document.querySelector('[data-public-status]');
      if (status) { status.hidden=false; status.textContent=error.message+'，请刷新重试。'; }
    }
  }
  addEventListener('hashchange',navigate);
  navigate();
})();

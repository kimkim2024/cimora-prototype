(() => {
  const { M: model, S: site, E: escape } = Cimora;
  createVideoVisualAssetsModel(model, site);
  const visual = model.videoVisualAssets;
  let category = '人物';
  let selectedId = '';
  let versionId = '';
  let activeSlot = 'main';
  let editing = false;
  let uploadDraft = null;
  let batchOpen = false;
  let batchScope = 'current';
  let contextKey = '';
  let current = null;

  function comicFor(context) {
    const source = model.videoFlow.ensure(context).source;
    if (source?.type !== 'comic') return null;
    try {
      return JSON.parse(localStorage.getItem('cimora-comic-studio-v1') || '{}').projects?.find(project => project.id === source.projectId) || null;
    } catch {
      throw Error('漫画库暂时无法读取，请保留现有浏览器数据。');
    }
  }
  function button(label, action, extra = '') {
    return `<button type="button" class="cm-button ghost" data-vva="${action}" ${extra}>${label}</button>`;
  }
  function image(src, label) {
    return src ? `<img src="${escape(src)}" alt="${escape(label)}">` : '';
  }
  function assetFor(context) {
    const assets = visual.ensure(context).assets.filter(asset => asset.kind === category);
    return assets.find(asset => asset.id === selectedId) || assets[0];
  }
  function versionFor(asset) {
    return asset?.candidates.find(candidate => candidate.id === versionId) || asset?.candidates.find(candidate => candidate.id === asset.adoptedId) || asset?.candidates[0];
  }
  function facts(profile) {
    return Object.entries(profile || {}).filter(([key, value]) => !['id', 'assetId', 'visualVersions'].includes(key) && typeof value === 'string' && value.trim()).map(([key, value]) => `${({ name: '姓名', role: '定位', age: '年龄', gender: '性别', background: '背景', relation: '关系', personality: '性格' })[key] || key}：${value}`).join('\n');
  }
  function render(context) {
    const key = context.p.id + '/' + context.c.id;
    if (key !== contextKey) {
      contextKey = key;
      category = '人物';
      selectedId = versionId = '';
      editing = batchOpen = false;
      uploadDraft = null;
    }
    current = context;
    const workspace = visual.ensure(context);
    const asset = assetFor(context);
    const version = versionFor(asset);
    const slots = asset ? visual.slots(asset) : [];
    const slot = slots.some(item => item[0] === activeSlot) ? activeSlot : 'main';
    let comic = null;
    let libraryError = '';
    try { comic = comicFor(context); } catch (error) { libraryError = error.message; }
    const source = model.videoFlow.ensure(context).source;
    const updates = workspace.assets.filter(item => visual.status(item, comic).code === 'updated').length;
    const eligible = workspace.assets.filter(item => (!item.candidates.length && (batchScope === 'all' || item.kind === category)));
    const sourceStatus = asset ? visual.status(asset, comic) : null;
    const changed = version?.scope === 'video' && version.description !== undefined && version.description !== visual.description(asset);
    const voice = asset?.kind === '人物' && model.videoFinishing ? model.videoFinishing.voiceProfile(context,asset.id) : null;
    const mapped = workspace.assets.map(item => ({ ...item, kind: item.kind === '人物' ? '角色' : item.kind, visualExtra: item.prompt || '', visualVersions: item.candidates, adoptedVisualId: item.adoptedId, reference: item.candidates.find(candidate => candidate.id === item.adoptedId)?.images?.main || '', visualTasks: item.visualTasks.map(task => ({...task,state:task.status})) }));
    const detail = asset ? mapped.find(item => item.id === asset.id) : null;
    const voiceHtml = voice ? `<details class="vva-voice"><summary>角色音色 · ${escape(voice.tone)}</summary><form id="vva-voice"><label>声音描述<input name="tone" value="${escape(voice.tone)}" required placeholder="例如：清澈自然，语气克制"></label><label>语速<input name="rate" type="number" min="0.5" max="2" step="0.1" value="${voice.rate}" required></label><button class="cm-button ghost">保存角色音色</button><p class="vf-note">供分镜独立配音引用，当前未生成音频。</p></form></details>` : '';
    let content = CreationWorkbench.visualAssets({p:{assets:mapped},a:detail,versions:detail?.visualVersions || [],v:version,slots,slot,src:version?.images?.[slot],pending:changed,eligible,assetCategory:category === '人物' ? '角色' : category,assetEditing:editing,assetBatchOpen:batchOpen,assetBatchScope:batchScope,assetUploadDraft:uploadDraft,esc:escape,assetImage:image,storyFacts:asset?.storyProfile,factText:facts(asset?.storyProfile),headingNote:[workspace.style,'新结果先做候选，采用后供后续画面引用'].filter(Boolean).join(' · '),extraHtml:voiceHtml});
    const actions = {vaBatch:'batch',vaBatchConfirm:'batch-confirm',vaBatchCancel:'batch-cancel',vaEdit:'edit',vaGenerate:'generate',vaUploadOpen:'upload-open',vaUploadSave:'upload-save',vaUploadAdopt:'upload-adopt',vaUploadCancel:'upload-cancel',vaAdopt:'adopt',vaDelete:'remove',vaAdd:'add'};
    content = content.replace(/id="(va\w+)"/g,(match,id) => id === 'vaBatchScope' ? 'id="vva-batch-scope"' : actions[id] ? 'data-vva="'+actions[id]+'"' : match)
      .replace(/data-va-kind="([^"]+)"/g,(_,kind) => 'data-vva="category" data-kind="'+(kind === '角色' ? '人物' : kind)+'"')
      .replace(/data-va-(asset|version|slot)="([^"]+)"/g,(_,action,id) => 'data-vva="'+action+'" data-'+(action === 'slot' ? 'slot' : 'id')+'="'+id+'"')
      .replaceAll('data-va-upload=','data-vva-upload=')
      .replace(/data-va-field="([^"]+)"/g,(_,field) => 'name="'+(field === 'visualExtra' ? 'prompt' : field)+'"');
    content = content.replace('<div class="cs-va-form">','<form id="vva-edit" class="cs-va-form">').replace('故事原始事实保持不变。</p></div>','故事原始事实保持不变。</p><button class="cm-button">保存资料</button></form>');
    const aliases = {'cs-va-detail':'vva-detail','cs-va-nav':'vva-nav','cs-va-asset-list':'vva-list','cs-va-categories':'vva-categories','cs-va-image':'vva-image','cs-va-slots':'vva-slots','cs-va-version-list':'vva-versions'};
    content = content.replace(/class="([^"]*)"/g,(_,value) => 'class="'+value.split(' ').flatMap(cls=>aliases[cls]?[cls,aliases[cls]]:[cls]).join(' ')+'"');
    content = content.replace(/<button\b([^>]*)>/g,(_,attributes) => '<button'+(/class="/.test(attributes)?attributes.replace('class="','class="cm-button '):' class="cm-button ghost"'+attributes)+'>');
    const sync = source?.type === 'comic' ? `<div class="vva-sync"><div><strong>来自漫画《${escape(source.title)}》</strong><p>${escape(libraryError || (updates ? updates+' 项漫画资产有更新' : comic ? '已关联漫画资产，采用的图片会完整带入。' : '原漫画暂不可用，继续使用已保存的参考。'))}</p></div>${button('同步漫画最新资产','sync',!comic?'disabled':'')}</div>` : '';
    return `<section class="cm-panel vva-panel creation-shared-assets">${sync}${content}${workspace.visualReviewShotIds.length ? '<p class="vva-review" role="status">采用参考已调整，相关镜头待复核。已有画面、锁定状态与剪辑保留。</p>' : ''}<div class="vf-actions"><a class="cm-button ghost" href="#/app/video?project=${encodeURIComponent(context.p.id)}&episode=${encodeURIComponent(context.c.id)}&stage=1">← 内容策划</a><a class="cm-button primary" href="#/app/video?project=${encodeURIComponent(context.p.id)}&episode=${encodeURIComponent(context.c.id)}&stage=3">下一步：镜头编排 →</a></div></section>`;

  }
  Cimora.videoVisualView = render;

  function repaint() {
    const scroll = { x: window.scrollX, y: window.scrollY };
    const listScroll = document.querySelector('.vva-list')?.scrollTop || 0;
    site.render();
    window.scrollTo(scroll.x, scroll.y);
    const list = document.querySelector('.vva-list');
    if (list) list.scrollTop = listScroll;
  }
  function run(action) {
    try { action(); repaint(); } catch (error) { site.toast(error.message || '操作失败'); }
  }
  document.addEventListener('click', event => {
    const target = event.target.closest('[data-vva]');
    if (!target || !target.closest('.vva-panel')) return;
    event.preventDefault();
    run(() => {
      const asset = assetFor(current);
      switch (target.dataset.vva) {
        case 'category': category = target.dataset.kind; selectedId = versionId = ''; editing = false; uploadDraft = null; break;
        case 'asset': selectedId = target.dataset.id; versionId = ''; editing = false; uploadDraft = null; break;
        case 'version': versionId = target.dataset.id; break;
        case 'slot': activeSlot = target.dataset.slot; break;
        case 'edit': editing = !editing; break;
        case 'add': {
          model.videoWorkspace.asset(current, category, `新${category}`);
          selectedId = visual.ensure(current).assets.at(-1).id;
          editing = true; versionId = ''; uploadDraft = null; break;
        }
        case 'generate': visual.task(current, asset.id); break;
        case 'upload-open': uploadDraft = { projectId: current.p.id, assetId: asset.id, images: {} }; break;
        case 'upload-cancel': uploadDraft = null; break;
        case 'upload-save': case 'upload-adopt': {
          if (!uploadDraft || uploadDraft.assetId !== asset.id) throw Error('请重新选择要上传的资产。');
          const candidateId = visual.upload(current, asset.id, uploadDraft.images);
          if (target.dataset.vva === 'upload-adopt') visual.adopt(current, asset.id, candidateId);
          versionId = candidateId; uploadDraft = null; break;
        }
        case 'adopt': visual.adopt(current, asset.id, versionFor(asset).id); break;
        case 'remove': visual.remove(current, asset.id, versionFor(asset).id); versionId = ''; break;
        case 'batch': batchOpen = true; break;
        case 'batch-cancel': batchOpen = false; break;
        case 'batch-confirm': visual.batch(current, batchScope === 'all' ? null : category); batchOpen = false; break;
        case 'sync': {
          const count = visual.sync(current, comicFor(current));
          site.toast(count ? `已同步 ${count} 项资产，新版本先加入候选，请核对后采用。` : '漫画资产已是最新版本。');
          break;
        }
      }
    });
  });
  document.addEventListener('submit', event => {
    if (event.target.id === 'vva-voice') { event.preventDefault(); run(() => model.videoFinishing.voice(current,assetFor(current).id,Object.fromEntries(new FormData(event.target)))); return; }
    if (event.target.id !== 'vva-edit') return;
    event.preventDefault();
    const fields = new FormData(event.target);
    run(() => {
      const assetId = assetFor(current).id;
      model.videoWorkspace.save(current, workspace => {
        const asset = workspace.assets.find(item => item.id === assetId);
        for (const field of ['name', 'visualAppearance', 'visualClothing', 'visualAccessories', 'prompt', 'stable']) if (fields.has(field)) asset[field] = String(fields.get(field)).trim();
        if (!asset.name) throw Error('请填写资产名称。');
      });
      editing = false;
    });
  });
  document.addEventListener('change', async event => {
    const input = event.target;
    if (input.id === 'vva-batch-scope') { batchScope = input.value; repaint(); return; }
    if (!input.matches('[data-vva-upload]') || !input.files?.[0]) return;
    const draft = uploadDraft;
    const context = current;
    const file = input.files[0];
    try {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw Error('请上传 PNG、JPG 或 WebP 图片。');
      if (file.size > 4 * 1024 * 1024) throw Error('单张图片请控制在 4MB 内。');
      const image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(Error('图片读取失败，请重新选择。'));
        reader.readAsDataURL(file);
      });
      if (draft !== uploadDraft || current !== context || !draft) return;
      draft.images[input.dataset.vvaUpload] = image;
      repaint();
    } catch (error) { site.toast(error.message); }
  });
})();

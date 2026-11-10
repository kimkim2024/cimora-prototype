window.createVideoVisualAssetsModel = function(model, site) {
  const workspaceModel = model.videoWorkspace;
  const clone = model.clone;
  const imagePath = value => !value ? '' : /^(data:|blob:|https?:|\/|comic-studio\/)/.test(value) ? value : 'comic-studio/' + value;
  const validImage = value => typeof value === 'string' && /^(data:image\/(png|jpeg|webp);base64,|https?:\/\/|blob:|\/?[\w.-]+\/)/.test(value);
  const signature = version => JSON.stringify({ images: version?.images, image: version?.image, description: version?.description });
  const kind = value => ['人物', '角色'].includes(value) ? '人物' : value === '道具' ? '道具' : '场景';
  function sourceVersion(asset) {
    const version = asset?.visualVersions?.find(item => item.id === asset.adoptedVisualId);
    if (!version) return null;
    const result = clone(version);
    result.images = Object.fromEntries(Object.entries(result.images || {}).map(([slot, image]) => [slot, imagePath(image)]));
    result.images.main ||= imagePath(result.image || result.url);
    result.image = result.images.main;
    result.origin = '漫画采用资产';
    result.scope = 'comic';
    return result;
  }
  function ensure(context) {
    const workspace = workspaceModel.ensure(context);
    const source = model.videoFlow.ensure(context).source;
    workspace.visualReviewShotIds ||= [];
    for (const asset of workspace.assets) {
      asset.kind = kind(asset.kind);
      asset.candidates ||= [];
      asset.visualTasks ||= [];
      const original = source?.type === 'comic' && source.assets?.find(item => item.id === (asset.sourceId || asset.id));
      if (original && asset.visualAccessories === undefined) asset.visualAccessories = original.visualAccessories || '';
      if (original && !asset.sourceLink) {
        const version = sourceVersion(original);
        asset.sourceLink = { projectId: source.projectId, assetId: original.id, versionId: version?.id || null, signature: signature(version) };
      }
      for (const candidate of asset.candidates) {
        candidate.images ||= { main: candidate.image || candidate.url || '' };
        if (original && (candidate.origin || '').startsWith('漫画采用资产')) {
          candidate.scope = 'comic';
          candidate.images = Object.fromEntries(Object.entries(candidate.images).map(([slot, image]) => [slot, imagePath(image)]));
        } else candidate.scope ||= 'video';
        candidate.image ||= candidate.images.main;
      }
    }
    return workspace;
  }
  function find(context, assetId) {
    const asset = ensure(context).assets.find(item => item.id === assetId);
    if (!asset) throw Error('资产不存在。');
    return asset;
  }
  function status(asset, comic) {
    if (!asset.sourceLink) return { code: 'local', label: '视频专用资产' };
    if (!comic) return { code: 'unavailable', label: '漫画暂不可用 · 使用已保存版本' };
    const source = comic.assets?.find(item => item.id === asset.sourceLink.assetId);
    if (!source) return { code: 'missing', label: '漫画已移除 · 已保存版本保留' };
    const current = sourceVersion(source);
    if (!current) return { code: 'unadopted', label: '漫画未采用视觉版本' };
    if (current.id !== asset.sourceLink.versionId || signature(current) !== asset.sourceLink.signature) return { code: 'updated', label: '漫画有更新 · 可同步' };
    const adopted = asset.candidates.find(candidate => candidate.id === asset.adoptedId);
    if (adopted?.scope === 'video') return { code: 'variant', label: '视频专用变体' };
    if (asset.adoptedId !== current.id) return { code: 'pending', label: '漫画新版本已同步 · 待采用' };
    return { code: 'linked', label: '来自漫画 · 已采用' };
  }
  function save(context, action) {
    ensure(context);
    return workspaceModel.save(context, action);
  }
  function sync(context, comic) {
    const source = model.videoFlow.ensure(context).source;
    if (source?.type !== 'comic' || comic?.id !== source.projectId) throw Error('找不到对应漫画工程，已有资产保留。');
    let count = 0;
    save(context, workspace => {
      for (const original of comic.assets || []) {
        let asset = workspace.assets.find(item => item.sourceLink?.assetId === original.id || item.sourceId === original.id);
        if (!asset) {
          asset = { id: original.id || site.id('vf-asset'), sourceId: original.id, kind: kind(original.kind), name: original.name || '来源资产', storyProfile: clone(original.storyProfile || null), visualAppearance: original.visualAppearance || '', visualClothing: original.visualClothing || '', visualAccessories: original.visualAccessories || '', candidates: [], visualTasks: [], adoptedId: null };
          workspace.assets.push(asset);
        }
        const version = sourceVersion(original);
        if (!version) continue;
        if (asset.sourceLink?.versionId === version.id && asset.sourceLink?.signature === signature(version)) continue;
        const existing = asset.candidates.find(candidate => candidate.id === version.id);
        if (existing && signature(existing) !== signature(version)) throw Error('漫画同一版本的图片发生变化，请先在漫画中保存为新版本。已有候选保留。');
        if (!existing) asset.candidates.unshift(version);
        asset.sourceLink = { projectId: comic.id, assetId: original.id, versionId: version.id, signature: signature(version), syncedAt: new Date().toISOString() };
        count++;
      }
    });
    return count;
  }
  function slots(asset) {
    if (asset.kind === '人物') return [['main', '三视图'], ['portrait', '头像'], ['clothing', '服装参考'], ['accessories', '配饰参考']];
    if (asset.kind === '场景') return [['main', '主参考'], ['space', '空间补充'], ['night', '日夜补充']];
    return [['main', '主参考'], ['angle', '角度补充']];
  }
  function description(asset) {
    return [asset.visualAppearance, asset.visualClothing, asset.visualAccessories, asset.prompt].filter(Boolean).join('\n');
  }
  function upload(context, assetId, images) {
    if (!images.main) throw Error('请先上传主参考图。');
    if (Object.values(images).some(image => image && !validImage(image))) throw Error('请上传有效图片。');
    let versionId;
    save(context, () => {
      const asset = find(context, assetId);
      versionId = site.id('vf-visual');
      asset.candidates.unshift({ id: versionId, label: '视频候选 ' + (asset.candidates.length + 1), scope: 'video', origin: '视频上传参考', images: clone(images), image: images.main, description: description(asset), at: new Date().toISOString() });
    });
    return versionId;
  }
  function adopt(context, assetId, versionId) {
    save(context, workspace => {
      const asset = find(context, assetId);
      if (!asset.candidates.some(candidate => candidate.id === versionId)) throw Error('候选不存在。');
      if (asset.adoptedId === versionId) return;
      asset.adoptedId = versionId;
      for (const shot of context.e.productionShots || []) {
        if ((shot.assetIds || []).includes(assetId) && !workspace.visualReviewShotIds.includes(shot.id)) workspace.visualReviewShotIds.push(shot.id);
      }
    });
  }
  function remove(context, assetId, versionId) {
    save(context, () => {
      const asset = find(context, assetId);
      if (asset.adoptedId === versionId) throw Error('当前采用版本不能删除。');
      if ((context.e.productionShots || []).some(shot => shot.visualAssetRefs?.some(ref => ref.assetId === assetId && ref.versionId === versionId))) throw Error('镜头正在引用这个版本，不能删除。');
      asset.candidates = asset.candidates.filter(candidate => candidate.id !== versionId);
    });
  }
  function task(context, assetId) {
    save(context, () => {
      const asset = find(context, assetId);
      asset.visualTasks.push({ id: site.id('vf-task'), status: '演示任务 · 未接模型', description: description(asset), slots: slots(asset).map(slot => slot[0]), basedOn: asset.adoptedId, at: new Date().toISOString() });
    });
  }
  function batch(context, category) {
    let count = 0;
    save(context, workspace => {
      for (const asset of workspace.assets.filter(item => (!category || item.kind === category) && !item.candidates.length)) {
        asset.visualTasks.push({ id: site.id('vf-task'), status: '演示任务 · 未接模型', description: description(asset), slots: slots(asset).map(slot => slot[0]), basedOn: null, at: new Date().toISOString() });
        count++;
      }
    });
    return count;
  }
  function references(context, assetIds) {
    return ensure(context).assets.filter(asset => assetIds?.includes(asset.id) && asset.adoptedId).map(asset => ({ assetId: asset.id, versionId: asset.adoptedId, sourceLink: clone(asset.sourceLink || null), snapshot: clone(asset.candidates.find(candidate => candidate.id === asset.adoptedId)) }));
  }
  const prepare = workspaceModel.prepare;
  workspaceModel.prepare = context => {
    const existing = new Set(context.e.productionShots.map(shot => shot.id));
    prepare(context);
    save(context, () => {
      for (const shot of context.e.productionShots) if (!existing.has(shot.id)) shot.visualAssetRefs = references(context, shot.assetIds);
    });
  };
  const renderImages = workspaceModel.renderImages;
  workspaceModel.renderImages = (context, scope) => {
    const previous = new Map(context.e.productionShots.map(shot => [shot.id, shot.adoptedId]));
    renderImages(context, scope);
    save(context, workspace => {
      for (const shot of context.e.productionShots) {
        if (shot.episodeId !== workspace.selectedEpisodeId || previous.get(shot.id) === shot.adoptedId || shot.direction.locked) continue;
        shot.visualAssetRefs = references(context, shot.assetIds);
        const candidate = shot.candidates.find(item => item.id === shot.adoptedId);
        if (candidate) candidate.input.visualAssetRefs = clone(shot.visualAssetRefs);
      }
    });
  };
  model.videoVisualAssets = { ensure, status, sync, slots, description, upload, adopt, remove, task, batch, references };
  return model;
};

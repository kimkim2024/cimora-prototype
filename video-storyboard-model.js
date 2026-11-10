window.createVideoStoryboardModel = function(model, site) {
  const workspace = model.videoWorkspace;
  const visuals = model.videoVisualAssets;
  const clone = model.clone;
  const imageValid = image => typeof image === 'string' && /^(data:image\/(png|jpeg|webp);base64,|https?:\/\/|blob:|\/?[\w.-]+\/)/.test(image);
  const state = context => visuals.ensure(context);
  const shots = context => model.direction.ensure(context).filter(shot => shot.episodeId === state(context).selectedEpisodeId);
  function find(context, shotId) {
    const shot = shots(context).find(item => item.id === shotId);
    if (!shot) throw Error('没有找到本集分镜。');
    return shot;
  }
  function editable(context, shotId) {
    const shot = find(context, shotId);
    if (shot.direction.locked) throw Error('分镜已锁定，请先解锁再修改。');
    const blocked = model.direction.blocked(context);
    if (blocked) throw Error(blocked);
    return shot;
  }
  function input(context, shot) {
    const board = shot.storyboardInput || {};
    return clone({ shotId: shot.id, shotVersion: shot.version, intent: shot.intent, dialogue: shot.dialogue || '', duration: shot.duration, mode: board.mode || 'reference', prompt: board.prompt || '', references: board.references || [], firstFrame: board.firstFrame || '', lastFrame: board.lastFrame || '', framing: shot.framing || '', soundDirection: shot.soundDirection || '', continuity: shot.continuity || '', assetRefs: visuals.references(context, shot.assetIds), style: state(context).style || '', world: state(context).world || '' });
  }
  function stale(shot) {
    const candidate = shot.candidates?.find(item => item.id === shot.adoptedId);
    return !!candidate && candidate.input?.shotVersion !== undefined && candidate.input.shotVersion !== shot.version;
  }
  function prepare(context) {
    workspace.prepare(context);
  }
  function selectEpisode(context, episodeId) {
    workspace.save(context, value => {
      if (!value.episodes.some(episode => episode.id === episodeId)) throw Error('分集不存在。');
      value.selectedEpisodeId = episodeId;
      value.confirm = null;
      model.videoFlow.ensure(context).selectedShotId = null;
    });
  }
  function select(context, shotId) {
    find(context, shotId);
    workspace.save(context, () => { model.videoFlow.ensure(context).selectedShotId = shotId; });
  }
  function edit(context, shotId, values) {
    editable(context, shotId);
    workspace.save(context, () => {
      const shot = find(context, shotId);
      const before = JSON.stringify(input(context, shot));
      for (const field of ['intent', 'dialogue', 'initialFrame', 'actionChange', 'framing', 'soundDirection', 'continuity']) if (field in values) {
        const value = String(values[field]).trim();
        if (String(shot[field] || '').trim() !== value) shot[field] = value;
      }
      if (!shot.intent.trim()) throw Error('请填写分镜描述。');
      if ('duration' in values) {
        const duration = Number(values.duration);
        if (!Number.isFinite(duration) || duration < 1 || duration > 180) throw Error('计划时长需在 1 到 180 秒之间。');
        shot.duration = duration;
      }
      if ('assetIds' in values) {
        if (!Array.isArray(values.assetIds) || values.assetIds.some(id => !state(context).assets.some(asset => asset.id === id))) throw Error('关联资产不属于当前工程。');
        shot.assetIds = [...new Set(values.assetIds)];
      }
      shot.storyboardInput ||= {};
      if ('mode' in values) {
        if (!['reference', 'keyframes'].includes(values.mode)) throw Error('请选择参考图或首尾帧模式。');
        shot.storyboardInput.mode = values.mode;
      }
      if ('prompt' in values) shot.storyboardInput.prompt = String(values.prompt).trim();
      if (before !== JSON.stringify(input(context, shot))) {
        shot.version++;
        model.videoFlow.ensure(context).reviewed = false;
      }
    });
  }
  function frame(context, shotId, slot, image) {
    editable(context, shotId);
    if (!['first', 'last'].includes(slot) || image && !imageValid(image)) throw Error('请选择有效首尾帧图片。');
    workspace.save(context, () => {
      const shot = find(context, shotId);
      shot.storyboardInput ||= {};
      shot.storyboardInput[slot + 'Frame'] = image;
      shot.version++;
    });
  }
  function reference(context, shotId, attachment, removeId) {
    editable(context, shotId);
    workspace.save(context, () => {
      const shot = find(context, shotId);
      shot.storyboardInput ||= {};
      const refs = shot.storyboardInput.references ||= [];
      if (removeId) {
        shot.storyboardInput.references = refs.filter(ref => ref.id !== removeId);
      } else {
        if (!attachment || !imageValid(attachment.image)) throw Error('请选择有效参考图片。');
        if (refs.length >= 6) throw Error('每镜最多添加 6 张参考图片。');
        refs.push({ id: site.id('vsb-ref'), name: String(attachment.name || '参考图片').slice(0,80), image: attachment.image });
      }
      shot.version++;
      model.videoFlow.ensure(context).reviewed = false;
    });
  }
  function describe(context, shotId) {
    const shot = editable(context, shotId);
    workspace.save(context, () => {
      shot.storyboardInput ||= {};
      const assets = state(context).assets.filter(asset => shot.assetIds?.includes(asset.id));
      const facts = assets.map(asset => `${asset.kind}「${asset.name}」：${[asset.stable, asset.visualAppearance, asset.visualClothing].filter(Boolean).join('；') || '按已关联资产参考，保持造型一致'}`).join('\n');
      // A curated demonstration of the current opening, never inserted into unrelated shots.
      const opening = /陆川/.test(shot.intent) && /孟遥/.test(shot.intent) && /筷子/.test(shot.intent) && /夜食摊/.test(shot.intent);
      if (opening && !(shot.storyboardInput.references || []).length) {
        const base = 'comic-studio/examples/romance-two/josei/assets/';
        shot.storyboardInput.references = [['陆川 · 人物参考','lu-reference.jpg'],['孟遥 · 人物参考','meng-reference.jpg'],['河岸夜食摊 · 构图氛围','page-01-panel-1.jpg']].map(([name,file]) => ({id:site.id('vsb-ref'),name,image:base+file}));
      }
      const refs = (shot.storyboardInput.references || []).map((ref,i) => `参考图 ${i+1}：${ref.name}`).join('\n');
      shot.storyboardInput.prompt = opening ? [
        '【参考使用】\n'+refs+'\n陆川、孟遥的脸型、发型与服装依人物图；场景图仅参考河岸空间、灯光和桌面构图，不照搬举杯姿势。',
        '【画风与氛围】\n日系都市爱情动画，纤细线条、柔和赛璐璐阴影、克制的表演。周四22:10，海汀河岸夜食摊；摊灯暖黄，河面与远岸冷蓝，营造临别前热闹中的疏离感。',
        '【人物与空间】\n陆川在木桌左侧，孟遥在右侧，轴线和座位始终一致。桌上是一次性筷子、杯子与宵夜；背景可见摊主、铁锅蒸汽、河岸灯影。两人造型严格沿用参考，不新增重要人物。',
        `【镜头与动作 · ${shot.duration}秒】\n开场约四分之一：平视中远景缓慢横移，交代夜食摊与两人位置，锅铲轻敲锅沿。\n中段约四分之一：切手部近景，陆川掰开筷子，将参差的两根对齐，动作细小自然。\n后半段：回到同轴双人中景，孟遥举杯朝陆川祝行；陆川短暂停顿，轻抬眼回应，镜头微微推近后停住。保持动作连贯，给表情留白。`,
        '【对白与环境声】\n动作与对话交叠：孟遥：“到南州，工作顺利。”同事在画外问：“新办公室离海远吗？”陆川平静地回：“不知道。租约签了，周一入职，周日六点四十的车。”保留锅铲、餐具轻碰与远处低声交谈，无额外旁白，无背景配乐。',
        '【约束】\n只表现本镜的送别宵夜，不出现许宁、手机好友申请或三年前的回忆。不添加字幕、对话气泡、文字水印、分屏或漫画格框。避免夸张表情、频繁跳切、手指变形和人物服装漂移。'
      ].join('\n\n') : [
        '【本镜内容】\n'+shot.intent,
        '【参考与人物一致性】\n'+[refs,facts].filter(Boolean).join('\n')+(refs || facts ? '\n沿用参考中的人物造型、服装、道具和空间关系。' : '按故事已有设定保持人物与场景一致；可在上方添加参考图片。'),
        '【画风与环境】\n'+[state(context).style,state(context).world].filter(Boolean).join('；')+'\n光线、天气和氛围遵循本镜内容，不自行改变场景时间。',
        `【镜头与动作】\n在${shot.duration}秒内完成本镜主要动作；先以中景建立人物位置，再随关键动作自然推近，最后停留在本镜的情绪落点。动作前后连贯，保持视线、轴线和道具位置一致；不添加原文之外的新剧情。`,
        '【声音】\n'+(shot.dialogue ? '仅使用已有对白：'+shot.dialogue : '无新增对白或旁白。')+'保留与场景相符的自然环境声，无背景配乐。',
        '【约束】\n不抢演后续剧情。不添加字幕、水印、对话气泡或漫画格框；避免人物变脸、服装漂移、手部变形、突兀跳切。'
      ].join('\n\n');
      shot.version++;
      model.videoFlow.ensure(context).reviewed = false;
    });
  }
  function make(context, shot) {
    const captured = input(context, shot);
    if (captured.mode === 'keyframes' && !captured.firstFrame) throw Error('首尾帧模式请先提供首帧，尾帧可选。');
    const source = model.videoFlow.ensure(context).source;
    const page = source?.pages?.find(item => item.image && shot.sourceRefs?.some(ref => ref.pageId === item.pageId));
    const reference = captured.assetRefs.find(ref => ref.snapshot?.image || ref.snapshot?.images?.main);
    const image = captured.firstFrame || captured.references[0]?.image || reference?.snapshot?.images?.main || reference?.snapshot?.image || page?.image || '';
    if (!image) throw Error('本镜尚无可用图片，请先关联已采用视觉资产、上传首帧或上传图片候选。');
    const candidate = { id: site.id('vf-storyboard'), version: shot.candidates.length + 1, status: 'ready', kind: 'storyboard-image', mode: 'layout-placeholder', prototype: true, image, input: captured, origin: '静态参考演示 · 非生成视频', createdAt: new Date().toISOString() };
    shot.candidates.unshift(candidate);
    return candidate;
  }
  function generate(context, shotId) {
    editable(context, shotId);
    let result;
    workspace.save(context, () => { result = make(context, find(context, shotId)); });
    return result;
  }
  function upload(context, shotId, image) {
    editable(context, shotId);
    if (!imageValid(image)) throw Error('请上传有效图片。');
    let result;
    workspace.save(context, () => {
      const shot = find(context, shotId);
      result = { id: site.id('vf-shot-upload'), version: shot.candidates.length + 1, status: 'ready', kind: 'storyboard-image', mode: 'image-upload', image, input: input(context, shot), origin: '上传图片参考 · 非视频', createdAt: new Date().toISOString() };
      shot.candidates.unshift(result);
    });
    return result;
  }
  function adopt(context, shotId, candidateId) {
    editable(context, shotId);
    workspace.save(context, value => {
      const shot = find(context, shotId);
      const candidate = shot.candidates.find(item => item.id === candidateId && item.status === 'ready' && item.image);
      if (!candidate) throw Error('此候选没有可采用的静态图片。');
      shot.adoptedId = candidateId;
      shot.direction.adoption = { candidateId, mode: 'manual', label: candidate.redrawClip?'显式采用转绘演示短片':'显式采用静态示意', at: new Date().toISOString() };
      shot.visualAssetRefs = clone(candidate.input?.assetRefs || []);
      value.visualReviewShotIds = value.visualReviewShotIds.filter(id => id !== shot.id);
      model.videoFlow.ensure(context).reviewed = false;
    });
  }
  function batchPlan(context, scope = 'missing') {
    const selected = shots(context).filter(shot => !shot.direction.locked && (scope === 'all' || !shot.adoptedId));
    return { episodeId: state(context).selectedEpisodeId, scope, rows: selected.map(shot => ({ id: shot.id, signature: JSON.stringify(input(context, shot)), ready: (shot.storyboardInput?.mode || 'reference') !== 'keyframes' || !!shot.storyboardInput?.firstFrame })), prototype: true };
  }
  function runBatch(context, plan) {
    if (!plan?.rows?.length) throw Error('没有可生成的未锁定分镜。');
    if (state(context).selectedEpisodeId !== plan.episodeId) throw Error('分集已有变化，请重新确认范围。');
    for (const row of plan.rows) {
      const shot = editable(context, row.id);
      if (row.signature !== JSON.stringify(input(context, shot))) throw Error('分镜内容或资产已有变化，请重新确认本次范围。');
    }
    let completed = 0;
    const skipped = [];
    workspace.save(context, () => {
      for (const row of plan.rows) {
        const shot = find(context, row.id);
        const captured = input(context, shot);
        if (captured.mode === 'keyframes' && !captured.firstFrame) { skipped.push(shot.id); continue; }
        if (!captured.firstFrame && !captured.references.length && !captured.assetRefs.some(ref => ref.snapshot?.image || ref.snapshot?.images?.main) && !model.videoFlow.ensure(context).source?.pages?.some(page => page.image && shot.sourceRefs?.some(ref => ref.pageId === page.pageId))) { skipped.push(shot.id); continue; }
        make(context, shot);
        completed++;
      }
    });
    return { completed, skipped };
  }
  function lock(context, shotId) {
    const shot = find(context, shotId);
    const error = model.direction.lock(context, shot.id, !shot.direction.locked);
    if (error) throw Error(error);
  }
  function transaction(action) {
    return (context, ...args) => {
      const before = clone(context.e);
      try { return action(context, ...args); }
      catch (error) {
        for (const key of Object.keys(context.e)) delete context.e[key];
        Object.assign(context.e, before);
        throw error;
      }
    };
  }
  model.videoStoryboard = { state, shots, input, stale, prepare: transaction(prepare), selectEpisode: transaction(selectEpisode), select: transaction(select), edit: transaction(edit), frame: transaction(frame), reference: transaction(reference), describe: transaction(describe), generate: transaction(generate), upload: transaction(upload), adopt: transaction(adopt), batchPlan, runBatch: transaction(runBatch), lock: transaction(lock) };
  return model;
};

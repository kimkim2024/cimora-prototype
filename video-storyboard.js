(() => {
  const { M: model, S: site, E: escape } = Cimora;
  createVideoStoryboardModel(model, site);
  createVideoFinishingModel(model, site);
  const board = model.videoStoryboard;
  const finish = model.videoFinishing;
  const flow = model.videoFlow;
  const visuals = model.videoVisualAssets;
  const sequence = window.VideoSequence;
  const player = sequence.controller(setTimeout, clearTimeout);
  let current = null;
  let currentStage = 3;
  let pageKey = '';
  let activeVersion = '';
  let batch = null;
  let playing = false;
  let position = 0;
  let stamp = 0;
  let batchScope = 'missing';
  let focusAfterRender = '';
  const editDrafts = new Map();
  let timelineSelection = { kind: 'video', id: '' };
  let timelineZoom = 48;
  let timelineDrag = null;
  let suppressTimelineClick = false;
  let audioStatus = '';
  const audioPlayer = VideoAudioPreview.create((id,message) => {
    audioStatus = message;
    document.querySelectorAll('[data-audio-status]').forEach(el => {el.textContent=message;});
    document.querySelectorAll('[data-vsb="audio-preview"]').forEach(el => {el.textContent=el.dataset.id===id ? 'Ⅱ 停止' : '▶ 试听';});
  });

  const button = (text, action, extra = '') => `<button type="button" class="cm-button ${['voice-generate','music-generate'].includes(action) ? 'primary' : 'ghost'}" data-vsb="${action}" ${extra}>${text}</button>`;
  const route = (context, stage) => `/app/video?project=${encodeURIComponent(context.p.id)}&episode=${encodeURIComponent(context.c.id)}&stage=${stage}`;
  const time = value => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
  const picture = (image, label) => image ? `<img src="${escape(image)}" alt="${escape(label)}">` : '';
  const selected = context => board.shots(context).find(shot => shot.id === flow.ensure(context).selectedShotId) || board.shots(context)[0];
  const chosen = shot => shot?.candidates.find(candidate => candidate.id === activeVersion && candidate.image) || shot?.candidates.find(candidate => candidate.id === shot.adoptedId && candidate.image) || shot?.candidates.find(candidate => candidate.image);
  const adopted = shot => shot?.candidates.find(candidate => candidate.id === shot.adoptedId);
  const sequenceRows = context => currentStage === 4 ? finish.rows(context) : sequence.rows(board.shots(context), board.state(context).selectedEpisodeId);
  const draftKey = (context, shotId) => context.p.id + '/' + context.c.id + '/' + shotId;
  const status = shot => shot.direction.locked ? '已锁定' : board.stale(shot) ? '要求已改 · 结果待更新' : shot.adoptedId ? '已采用静态示意' : shot.candidates.some(candidate => candidate.image) ? '已有候选 · 待采用' : '待准备';

  function focusView(target) {
    document.querySelector(target)?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }

  function stop() { playing = false; player.stop(); audioPlayer.stop(); }
  function paint() {
    const scroll = { x: window.scrollX, y: window.scrollY };
    const timelineScroll = document.querySelector('.vsb-timeline-scroll')?.scrollLeft || 0;
    site.render();
    window.scrollTo(scroll.x, scroll.y);
    const timeline = document.querySelector('.vsb-timeline-scroll');
    if (timeline) timeline.scrollLeft = timelineScroll;
  }
  function values(form) {
    const fields = new FormData(form);
    return { intent: fields.get('intent') || '', prompt: fields.get('prompt') || '', mode: fields.get('mode') || 'reference', assetIds: fields.getAll('asset') };
  }
  function flush() {
    const form = document.querySelector('.vsb-shot-form');
    if (!form || form.dataset.locked === 'true') return;
    board.edit(current, form.dataset.shot, values(form));
  }
  function saveSound() {
    const form = document.querySelector('#vsb-sound');
    if (form && !board.shots(current).find(s=>s.id===form.dataset.shot)?.direction.locked) finish.shotSound(current,form.dataset.shot,Object.fromEntries(new FormData(form)));
  }
  function saveMusicDraft() {
    const form=document.querySelector('#vsb-music-ai');
    if(form) finish.musicDraft(current,Object.fromEntries(new FormData(form)));
  }
  function saveAudioDrafts() { saveSound(); saveMusicDraft(); saveMix(); }
  function saveMix() {
    const form = document.querySelector('#vsb-mix');
    if (!form) return;
    const fields = new FormData(form);
    finish.mix(current,{ ...Object.fromEntries(fields), duck: fields.has('duck') });
  }
  function move(context, id) {
    board.select(context, id);
    activeVersion = '';
    position = sequenceRows(context).find(row => row.id === id)?.start || 0;
  }
  function rail(context, stage) {
    const workspace = board.state(context);
    return `<aside class="vsb-rail" aria-label="作品分集"><small>集数</small>${workspace.episodes.map((episode, index) => button(String(index + 1), 'episode', `data-id="${escape(episode.id)}" aria-label="第 ${index + 1} 集：${escape(episode.title)}" aria-pressed="${workspace.selectedEpisodeId === episode.id}"`)).join('')}<a class="cm-button ghost vsb-rail-back" href="#${route(context, stage === 3 ? 2 : 3)}" aria-label="${stage === 3 ? '返回视觉资产' : '返回镜头编排'}">←</a></aside>`;
  }
  function assetGroup(context, shot, kind) {
    const assets = board.state(context).assets.filter(asset => asset.kind === kind);
    const related = assets.filter(asset => shot.assetIds?.includes(asset.id));
    return `<div class="vsb-asset-group"><h4>${kind === '人物' ? '出镜角色' : kind === '场景' ? '分镜场景' : '场景道具'}<small>${related.length} 项</small></h4><div class="vsb-linked-assets">${related.map(asset => { const version = asset.candidates.find(candidate => candidate.id === asset.adoptedId); return `<button type="button" data-vsb="asset-detail" data-id="${escape(asset.id)}" aria-label="查看${escape(asset.name)}的资产资料">${picture(version?.images?.main || version?.image, asset.name) || '<span class="vsb-asset-missing">待准备</span>'}<span>${escape(asset.name)}<small>${version ? '已采用参考' : '尚无采用图'}</small></span></button>`; }).join('') || '<p class="vf-note">尚未关联</p>'}</div><details><summary>${shot.direction.locked ? '查看资产关联' : '调整关联资产'}</summary><div class="vsb-asset-picker">${assets.map(asset => `<label><input type="checkbox" name="asset" value="${escape(asset.id)}" ${shot.assetIds?.includes(asset.id) ? 'checked' : ''} ${shot.direction.locked ? 'disabled' : ''}>${escape(asset.name)}</label>`).join('') || `<p class="vf-note">暂无${kind}，可返回视觉资产准备。</p>`}</div></details></div>`;
  }
  function showAssetDetail(assetId) {
    const asset = board.state(current).assets.find(asset => asset.id === assetId);
    if (!asset) return;
    const version = asset.candidates.find(candidate => candidate.id === asset.adoptedId);
    CreationWorkbench.openAssetCard({ name: asset.name, kind: asset.kind, status: version ? '已采用参考' : '尚无采用图',
      assetId: asset.id, versionId: asset.adoptedId, image: version?.images?.main || version?.image,
      fields: [['故事事实', CreationWorkbench.assetFacts(asset)], ['稳定资料', asset.stable], ['外貌 / 视觉描述', asset.visualAppearance], ['服装', asset.visualClothing], ['重要配饰', asset.visualAccessories], ['关联版本说明', version?.description]] });
  }
  async function compactReference(source, stillCurrent) {
    const image = new Image();
    await new Promise((resolve,reject) => { image.onload=resolve; image.onerror=() => reject(Error('图片无法读取，请换一张。')); image.src=source; });
    if (!stillCurrent()) throw Error('已切换分镜，本次图片未添加。');
    const scale = Math.min(1,1280 / Math.max(image.naturalWidth,image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1,Math.round(image.naturalWidth*scale)); canvas.height = Math.max(1,Math.round(image.naturalHeight*scale));
    const ctx = canvas.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.drawImage(image,0,0,canvas.width,canvas.height);
    const result = canvas.toDataURL('image/jpeg',.82);
    if (result.length > 650000) throw Error('图片细节过多，请缩小图片后重试。');
    return result;
  }
  function promptComposer(context, shot) {
    const input = shot.storyboardInput || {};
    const disabled = shot.direction.locked ? 'disabled' : '';
    const linked = visuals.references(context,shot.assetIds).filter(ref => ref.snapshot?.image || ref.snapshot?.images?.main);
    return `<div class="vsb-prompt-composer"><div class="vsb-reference-strip" aria-label="本镜参考图片">${(input.references || []).map((ref,index) => `<div class="vsb-reference-thumb">${picture(ref.image,ref.name)}<span title="${escape(ref.name)}">${index+1} · ${escape(ref.name)}</span>${button('×','reference-remove',`data-shot="${escape(shot.id)}" data-id="${escape(ref.id)}" aria-label="移除参考图${index+1}" ${disabled}`)}</div>`).join('')}${linked.map(ref => { const asset = board.state(context).assets.find(asset=>asset.id === ref.assetId); return `<button type="button" class="vsb-reference-thumb vsb-linked-reference" data-vsb="asset-detail" data-id="${escape(ref.assetId)}">${picture(ref.snapshot.images?.main || ref.snapshot.image,asset?.name || '关联资产')}<span>${escape(asset?.name || '关联资产')} · 已关联</span></button>`; }).join('')}<label class="vsb-reference-add" title="添加本镜参考图片"><span>＋</span><small>添加图片</small><input type="file" data-vsb-reference="${escape(shot.id)}" accept="image/png,image/jpeg,image/webp" aria-label="添加本镜参考图片" ${disabled || (input.references?.length >= 6 ? 'disabled' : '')}></label></div><label class="vsb-prompt-label"><span>视频生成提示词</span><textarea name="prompt" rows="15" placeholder="点击左侧「生成分镜描述」，将分镜内容整理为画面、动作、运镜及一致性要求；也可以直接填写。" ${disabled}>${escape(input.prompt || '')}</textarea></label></div><p class="vf-note">参考图与提示词一起用于本镜生成；可添加最多 6 张图片，关联资产自动带入。</p>`;
  }
  function candidates(context, shot, compact = false) {
    const version = chosen(shot);
    return `<div class="vsb-candidates ${compact ? 'vsb-compact-candidates' : ''}"><div class="vsb-section-title"><h4>候选版本</h4><small>${shot.candidates.filter(candidate => candidate.image).length} 版</small></div><div class="vsb-version-list">${shot.candidates.filter(candidate => candidate.image).map(candidate => `<button type="button" data-vsb="version" data-id="${escape(candidate.id)}" aria-pressed="${version?.id === candidate.id}">${picture(candidate.image, `分镜候选 ${candidate.version}`)}<span>v${candidate.version}${candidate.id === shot.adoptedId ? ' · 已采用' : ' · 待采用'}</span></button>`).join('') || '<p class="vf-note">生成或上传后显示候选，采用后进入整集时间线。</p>'}</div>${version ? button(version.id === shot.adoptedId ? '当前采用版本' : '采用此候选', 'adopt', `data-shot="${escape(shot.id)}" data-id="${escape(version.id)}" ${shot.direction.locked || version.id === shot.adoptedId ? 'disabled' : ''}`) : ''}</div>`;
  }
  function batchView() {
    if (!batch) return '';
    return `<section class="vsb-batch" role="dialog" aria-label="批量生成确认"><div><h3>确认本集批量范围</h3><p>${batch.scope === 'all' ? '全部未锁定分镜' : '尚未采用结果的分镜'} · ${batch.rows.length} 镜。新结果进入候选，已有采用版保留。</p><small>静态参考演示 · 不调用模型 · 预计费用 0</small></div><div class="vf-actions">${button('确认生成示意候选', 'batch-confirm', batch.rows.length ? '' : 'disabled')}${button('取消', 'batch-cancel')}</div></section>`;
  }
  function audioCandidates(context, kind, shot) {
    const list = kind === 'effect' ? finish.effectCandidates(context,shot.id) : kind === 'voice' ? finish.voiceCandidates(context,shot.id) : finish.musicCandidates(context);
    const adoptedId = kind === 'voice' ? finish.sound(context,shot.id).task?.candidateId : finish.state(context).musicAdoptedId;
    const label = kind === 'effect' ? '环境音 / 音效' : kind === 'voice' ? '配音' : '背景音';
    return '<div class="vsb-audio-candidates" aria-label="'+label+'候选">'+(list.length ? list.slice(0,4).map(candidate => {
      const used = kind === 'effect' ? finish.effectRows(context).some(row=>row.candidate.id===candidate.id) : adoptedId === candidate.id && (kind === 'voice' ? finish.sound(context,shot.id).mode === 'separate' : finish.state(context).mix.music === candidate.title);
      return '<article><div><b>'+label+' v'+candidate.version+'</b><small>'+(used ? '已在时间线' : '待替换')+'</small><p>'+escape(kind === 'voice' ? candidate.input.text : candidate.prompt)+'</p></div><div class="vf-actions">'+button('▶ 试听','audio-preview', 'data-kind="'+kind+'" data-shot="'+escape(shot?.id || '')+'" data-id="'+escape(candidate.id)+'" aria-label="试听'+label+' v'+candidate.version+'"')+button(used ? '当前采用' : '替换到时间线','audio-adopt','data-kind="'+kind+'" data-shot="'+escape(shot?.id || '')+'" data-id="'+escape(candidate.id)+'" aria-label="替换'+label+' v'+candidate.version+'" '+(used || ['voice','effect'].includes(kind) && shot.direction.locked ? 'disabled' : ''))+'</div></article>';
    }).join('') : '<p class="vf-note">生成后先试听，满意再替换。当前声音会保留。</p>')+'</div>';
  }
  function audioPreviewStatus() {
    return '<div class="vsb-audio-preview-status"><span role="status" data-audio-status>'+escape(audioStatus || '可先试听单版，替换后播放整集对比效果。')+'</span>'+button('停止试听','audio-stop')+'</div>';
  }
  function shotSound(context, shot) {
    const sound = finish.sound(context, shot.id), voice = finish.soundVoice(context,sound);
    const disabled = shot.direction.locked ? 'disabled' : '';
    return `<section class="vsb-shot-sound"><h4>对白配音</h4><form id="vsb-sound" data-shot="${escape(shot.id)}"><label>对白来源<select name="mode" ${disabled}>${[['embedded','视频原声对白'],['separate','独立配音'],['off','无对白']].map(([value,label]) => `<option value="${value}" ${sound.mode === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label><div class="vsb-voice-fields"><label>配音角色<select name="speakerId" ${disabled}><option value="">旁白 / 未指定角色</option>${board.state(context).assets.filter(asset => asset.kind === '人物').map(asset => `<option value="${escape(asset.id)}" ${sound.speakerId === asset.id ? 'selected' : ''}>${escape(asset.name)} · ${escape(finish.voiceProfile(context, asset.id).tone)}</option>`).join('')}</select></label><div class="vsb-voice-options"><label>音色 / 情绪<input name="tone" value="${escape(voice.tone)}" placeholder="如：青年男声，沉稳、克制" ${disabled}></label><label>语速<input name="rate" type="number" min="0.5" max="2" step="0.1" value="${voice.rate}" ${disabled}></label></div><label>对白文案<textarea name="text" rows="3" placeholder="填写本镜对白；修改文案或音色后，可重新生成候选。" ${disabled}>${escape(sound.text)}</textarea></label></div><details class="vsb-effect-settings"><summary>环境声 / 音效要求</summary><label><input name="effect" value="${escape(sound.effect || '')}" placeholder="例如：雨声、餐具轻响（本次只保存要求）" ${disabled}></label></details><div class="vf-actions">${button('AI 生成配音', 'voice-generate', `data-id="${escape(shot.id)}" ${disabled}`)}<button class="cm-button ghost" ${disabled}>保存声音设置</button></div><p role="status" class="vf-note">${sound.mode === 'separate' ? sound.stale ? '文案或音色已改，时间线仍保留上一版，生成并替换后生效。' : sound.task?.label || '独立配音待生成。' : sound.mode === 'embedded' ? '当前使用视频原声；新配音确认替换后启用。' : '当前不使用对白。'}</p></form>${audioCandidates(context,'voice',shot)}${audioPreviewStatus()}<p class="vf-note">Demo 使用浏览器中文语音试听，音色取决于系统语音；正式版接 AI 配音模型。</p></section>`;
  }
  function musicEditor(context) {
    const episode = finish.state(context), music = finish.musicRow(context);
    const options = [...new Set(['不使用配乐','雨夜钢琴','温暖日常','悬疑氛围',episode.mix.music])];
    return `<section class="vsb-music-editor"><h4>背景音生成与替换</h4><form id="vsb-music-ai"><label>想要什么氛围？<textarea name="prompt" rows="3" placeholder="例如：夜晚河岸的告别，缓慢而克制的钢琴，带一点期待，不要人声。">${escape(episode.musicDraft?.prompt || '')}</textarea></label><div class="vf-actions">${button('AI 生成背景音','music-generate')}<button class="cm-button ghost">保存描述</button></div></form>${audioCandidates(context,'music')}${audioPreviewStatus()}<form id="vsb-mix" class="vsb-track-form"><strong>时间线背景音</strong><label>当前音轨<select name="music">${options.map(value=>`<option ${episode.mix.music === value ? 'selected' : ''}>${escape(value)}</option>`).join('')}</select></label><label>音量 %<input name="musicVolume" type="number" min="0" max="100" value="${episode.mix.musicVolume}"></label><label class="vsb-check"><input type="checkbox" name="duck" ${episode.mix.duck ? 'checked' : ''}>对白时压低</label><button class="cm-button ghost">保存背景音</button></form>${music ? `<form id="vsb-music-clip" class="vsb-track-form"><strong>背景音片段</strong><label>起点<input name="start" type="number" min="0" step="0.1" value="${music.start}"></label><label>终点<input name="end" type="number" min="0.1" step="0.1" value="${music.end}"></label><button class="cm-button ghost">保存背景音片段</button></form>` : ''}<p class="vf-note">Demo 按氛围生成本地合成配乐供试听，正式版接 AI 音乐模型；环境音效要求独立保存。</p></section>`;
  }
  function shotModify(context, shot) {
    const edits = flow.ensure(context).edits.filter(edit => edit.shotIds.includes(shot.id)).slice(0,3);
    return `<section class="vsb-shot-modify"><h4>本镜修改</h4><form id="vsb-modify" data-shot="${escape(shot.id)}"><label>希望怎样调整？<textarea name="prompt" rows="2" required ${shot.direction.locked ? 'disabled' : ''} placeholder="例如：推进慢一点，保留人物停顿。">${escape(editDrafts.get(draftKey(context,shot.id)) || '')}</textarea></label><button class="cm-button ghost" ${shot.direction.locked ? 'disabled' : ''}>整理本镜修改建议</button></form>${edits.map(edit => `<article class="vf-request"><b>${escape(edit.text)}</b><p>${escape(edit.state)}</p>${edit.state === '待确认修改建议' ? button('应用到分镜文字','apply-edit',`data-id="${escape(edit.id)}"`)+button('取消','cancel-edit',`data-id="${escape(edit.id)}"`) : ''}</article>`).join('')}<p class="vf-note">修改后重新生成候选，确认采用后再进入整集制作。</p></section>`;
  }
  function timelineTools(context, shot) {
    const episode = finish.state(context);
    const rows = finish.rows(context);
    const total = rows.at(-1)?.end || 0;
    const audio = finish.audioRows(context);
    const effects = finish.effectRows(context);
    const music = finish.musicRow(context);
    const selectedKind = timelineSelection.kind || 'video';
    const selectedId = timelineSelection.id || shot?.id || rows[0]?.id || '';
    const activeVideo = rows.find(value => value.id === selectedId) || rows[0];
    const activeAudio = audio.find(value => value.id === selectedId);
    const activeEffect = effects.find(value=>value.id===selectedId);
    const soundShot = rows.find(value => value.id === (activeEffect?.shotId||selectedId))?.shot || shot || rows[0]?.shot;
    const timelineWidth = Math.max(480, total * timelineZoom);
    const pct = value => total ? `${Math.max(0, Math.min(100, value / total * 100))}%` : '0%';
    const clip = (row, kind, label, image = '') => `<button type="button" class="vsb-track-clip ${selectedKind === kind && selectedId === row.id ? 'selected' : ''} ${row.linked ? 'linked' : ''}" data-vsb="timeline-select" data-kind="${kind}" data-id="${escape(row.id)}" aria-label="${escape(label)}，${row.start.toFixed(1)} 至 ${row.end.toFixed(1)} 秒${row.ready === false ? '，待准备' : ''}" style="--clip-left:${pct(row.start)};--clip-width:${pct(row.duration)}"><span>${image ? `<img src="${escape(image)}" alt="">` : ''}<b>${escape(label)}</b><small>${row.duration.toFixed(1)}秒${row.ready === false ? ' · 待准备' : ''}${row.linked ? ' · 随视频' : ''}</small></span>${!row.linked ? '<i data-vsb-handle="left" aria-hidden="true"></i><i data-vsb-handle="right" aria-hidden="true"></i>' : ''}</button>`;
    const shotNumber = id => board.shots(context).findIndex(value => value.id === id) + 1;
    const videoTrack = rows.map(row => clip(row, 'video', `分镜 ${shotNumber(row.id)}`, row.image)).join('') || '<span class="vsb-track-empty">暂无视频片段</span>';
    const audioTrack = audio.map(row => clip(row, 'audio', row.linked ? `原声 · 分镜 ${shotNumber(row.id)}` : `配音 · 分镜 ${shotNumber(row.id)}`)).join('') || '<button type="button" class="vsb-track-empty" data-vsb="timeline-audio">＋ 设置配音与音效</button>';
    const musicTrack = music ? clip(music, 'music', music.title) : '<button type="button" class="vsb-track-empty" data-vsb="timeline-music">＋ 添加背景音乐</button>';
    const videoForm = activeVideo ? `<form id="vsb-clip" data-shot="${escape(activeVideo.id)}" class="vsb-track-form"><strong>视频 · 分镜 ${rows.indexOf(activeVideo) + 1}</strong><label>素材入点<input name="in" type="number" min="0" max="${activeVideo.shot.duration}" step="0.1" value="${activeVideo.in}"></label><label>素材出点<input name="out" type="number" min="0.1" max="${activeVideo.shot.duration}" step="0.1" value="${activeVideo.out}"></label><label>衔接<select name="transition">${['直接切换','淡入淡出'].map(value => `<option ${activeVideo.transition === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label><button class="cm-button ghost">保存</button></form>` : '';
    const audioForm = activeAudio && !activeAudio.linked ? `<form id="vsb-audio-clip" data-shot="${escape(activeAudio.id)}" class="vsb-track-form"><strong>音频 · 分镜 ${rows.findIndex(item => item.id === activeAudio.id) + 1}</strong><label>时间线起点<input name="start" type="number" min="0" step="0.1" value="${activeAudio.start}"></label><label>素材入点<input name="in" type="number" min="0" step="0.1" value="${activeAudio.in}"></label><label>素材出点<input name="out" type="number" min="0.1" step="0.1" value="${activeAudio.out}"></label><label>音量 %<input name="volume" type="number" min="0" max="100" value="${activeAudio.volume}"></label><button class="cm-button ghost">保存</button></form>` : activeAudio ? `<form id="vsb-original-volume" class="vsb-track-form"><strong>视频原声</strong><span>与对应视频同步裁切、排序</span><label>音量 %<input name="originalVolume" type="number" min="0" max="100" value="${episode.mix.originalVolume}"></label><button class="cm-button ghost">保存</button></form>` : '<p class="vsb-track-hint">本镜暂无独立音频，可在下方设置配音与音效。</p>';
    const musicForm = musicEditor(context);
    const effectTracks=['environment','action'].filter(category=>effects.some(row=>row.category===category)).map(category=>`<div class="vsb-track-lane"><b>${category==='environment'?'↳ 环境音':'↳ 音效'}</b><div class="vsb-track audio sfx-lane" data-vsb-lane="effect">${effects.filter(row=>row.category===category).map(row=>clip(row,'effect',row.candidate.title)).join('')}</div></div>`).join('');
    const effectForm=activeEffect?`<form id="vsb-effect-clip" data-id="${escape(activeEffect.id)}" class="vsb-track-form"><strong>${escape(activeEffect.candidate.title)}</strong>${[['start','时间线起点'],['in','素材入点'],['out','素材出点'],['volume','音量 %']].map(([name,title])=>`<label>${title}<input name="${name}" type="number" min="0" step="0.1" value="${activeEffect[name]}"></label>`).join('')}<button class="cm-button ghost">保存声音片段</button>${button('从时间线移除','effect-remove',`data-id="${escape(activeEffect.id)}"`)}</form>`:'';
    const latest = episode.versions[0];
    const stale = latest && latest.signature !== finish.signature(context);
    const tickStep = Math.max(1, Math.ceil(80 / timelineZoom));
    const ticks = Array.from({ length: Math.floor(total / tickStep) + 1 }, (_, index) => `<span style="left:${pct(index * tickStep)}">${time(index * tickStep)}</span>`).join('');
    return `<section class="cm-panel vsb-timeline"><header class="vsb-section-title"><div><h3>本集时间线</h3><small>${rows.filter(row => row.image).length} / ${rows.length} 镜已采用 · ${total.toFixed(1)} 秒</small></div><div class="vsb-timeline-zoom"><span>缩放</span>${button('−','timeline-zoom','data-offset="-1" aria-label="缩小时间线"')}${button('＋','timeline-zoom','data-offset="1" aria-label="放大时间线"')}</div></header><p class="vsb-track-hint">视频、音频、背景音三类轨道；音频内包含配音、环境音和动作音效。拖动片段调整顺序或位置，两端可裁切。点击时间尺定位。</p><div class="vsb-timeline-scroll"><div class="vsb-timeline-grid" style="width:${timelineWidth + 70}px"><div class="vsb-track-lane vsb-ruler-lane"><b></b><div class="vsb-timeline-ruler" data-vsb-ruler>${ticks}</div></div><div class="vsb-track-lane"><b>视频</b><div class="vsb-track" data-vsb-lane="video">${videoTrack}</div></div><div class="vsb-track-lane"><b>${button('音频','timeline-audio')}</b><div class="vsb-track audio" data-vsb-lane="audio">${audioTrack}</div></div>${effectTracks}<div class="vsb-track-lane"><b>${button('背景音','timeline-music')}</b><div class="vsb-track music" data-vsb-lane="music">${musicTrack}</div></div><div class="vsb-timeline-playhead" style="left:calc(70px + (100% - 70px) * ${total ? position / total : 0})"><i></i></div></div></div><div class="vsb-track-editors">${selectedKind === 'effect' ? effectForm : selectedKind === 'audio' ? audioForm : selectedKind === 'music' ? musicForm : videoForm}${selectedKind !== 'music' && soundShot ? `<details class="vsb-sound-editor" ${selectedKind === 'audio' ? 'open' : ''}><summary>配音与音效 · 分镜 ${shotNumber(soundShot.id)}</summary>${soundShot.direction.locked ? '<p class="vf-note">本镜已锁定，返回镜头编排解锁后可修改声音。</p>' : ''}${shotSound(context,soundShot)}<section class="vsb-effect-candidates"><h4>环境音与动作音效</h4><a class="cm-button ghost" href="#/app/tools/sound-effects">制作环境音与音效</a>${audioCandidates(context,'effect',soundShot)}</section></details>` : ''}</div><div class="vsb-track-actions">${button('确认整集拼接方案', 'assemble', rows.length ? '' : 'disabled')}<span>${latest ? stale ? '拼接设置已变化，需重新确认。' : '当前整集方案已保存。' : '确认后保存当前画面与声音轨道。'} · 已有 ${episode.versions.length} 个方案版本</span></div><small class="vf-note">图片节奏＋本地声音试听 · 不输出视频或混音文件；对白裁切为近似预览，轨道不代表真实波形。</small></section>`;
  }
  function shotCard(context, shot, index, expanded) {
    const candidate = chosen(shot);
    const locked = shot.direction.locked;
    const disabled = locked ? 'disabled' : '';
    const input = shot.storyboardInput || {};
    return `<article class="vsb-shot ${expanded ? 'vsb-expanded' : ''}" id="vsb-${escape(shot.id)}"><header class="vsb-card-heading">${button(`<span class="vsb-shot-number">${index + 1}</span><span><b>分镜 ${index + 1}</b><small>${escape(shot.title)}</small></span>`, 'shot', `data-id="${escape(shot.id)}" aria-expanded="${expanded}"`)}<span class="vsb-shot-status">${status(shot)}</span><span class="vsb-duration">计划 ${shot.duration} 秒</span>${button(locked ? '解锁' : '锁定', 'lock', `data-id="${escape(shot.id)}"`)}</header>${expanded ? `<form class="vsb-shot-form" data-shot="${escape(shot.id)}" data-locked="${locked}"><div class="vsb-card-columns"><section class="vsb-information"><h3>分镜信息</h3><label>分镜内容<textarea name="intent" rows="4" required ${disabled}>${escape(shot.intent)}</textarea></label>${button('生成分镜描述', 'describe', `data-id="${escape(shot.id)}" ${disabled}`)}<p class="vf-note">把本镜内容整理成可修改的视频生成提示词。</p>${['人物', '场景', '道具'].map(kind => assetGroup(context, shot, kind)).join('')}</section><section class="vsb-generation"><h3>分镜生成要求</h3><p class="vf-note">结合上一步资产，安排画面、动作和对白。</p><div class="vsb-mode" role="group" aria-label="分镜生成方式"><label><input type="radio" name="mode" value="reference" ${(input.mode || 'reference') === 'reference' ? 'checked' : ''} ${disabled}>全能参考</label><label><input type="radio" name="mode" value="keyframes" ${input.mode === 'keyframes' ? 'checked' : ''} ${disabled}>首尾帧</label></div><div class="vsb-frame-inputs" ${input.mode === 'keyframes' ? '' : 'hidden'}>${['first', 'last'].map(slot => `<label>${slot === 'first' ? '首帧（必选）' : '尾帧（可选）'}${picture(input[slot + 'Frame'], slot === 'first' ? '首帧参考' : '尾帧参考')}<input type="file" data-vsb-frame="${slot}" data-shot="${escape(shot.id)}" accept="image/png,image/jpeg,image/webp" ${disabled}></label>`).join('')}</div>${promptComposer(context,shot)}<div class="vsb-generate-footer"><button class="cm-button ghost" ${disabled}>保存要求</button>${button('生成本镜示意', 'generate', `data-id="${escape(shot.id)}" ${disabled}`)}</div><p class="vf-note">当前展示参考图与操作流程，未生成视频。新候选需明确采用。</p></section><section class="vsb-result"><div class="vsb-section-title"><h3>结果预览</h3><small>静态示意</small></div><div class="vsb-result-image">${picture(candidate?.image, `分镜 ${index + 1} 候选预览`) || '<div class="vsb-empty-image"><span>▧</span><b>等待本镜结果</b><p>生成示意或上传图片，再确认采用。</p></div>'}</div><p class="vf-note">${escape(candidate?.origin || '尚未生成，不显示其他镜头图片。')}</p><label class="vsb-upload-label">上传图片候选<input type="file" data-vsb-upload="${escape(shot.id)}" accept="image/png,image/jpeg,image/webp" ${disabled}></label>${candidates(context, shot)}</section></div></form><div class="vsb-shot-bottom">${shotModify(context,shot)}</div>` : `<p class="vsb-shot-summary">${escape(shot.intent.slice(0, 140))}${shot.intent.length > 140 ? '…' : ''}</p>`}</article>`;
  }
  function arrangement(context) {
    const workspace = board.state(context);
    const episode = workspace.episodes.find(item => item.id === workspace.selectedEpisodeId);
    const shots = board.shots(context);
    const active = selected(context);
    return `<div class="vsb-workbench" data-vsb-stage="3">${rail(context, 3)}<div class="vsb-main"><header class="vsb-page-heading"><div><span class="cm-kicker">STORYBOARD</span><h2>${escape(episode?.title || '当前集')}</h2><p>${escape(episode?.outline || '根据本集正文组织分镜。')}</p></div><div class="vf-actions">${button(shots.length ? '核对当前分镜' : 'AI 整理分镜', 'prepare')}<label class="vsb-scope">批量范围<select id="vsb-batch-scope"><option value="missing" ${batchScope === 'missing' ? 'selected' : ''}>尚未采用结果</option><option value="all" ${batchScope === 'all' ? 'selected' : ''}>全部未锁定分镜</option></select></label>${button('批量生成示意', 'batch', shots.length ? '' : 'disabled')}<a class="cm-button primary" href="#${route(context, 4)}">下一步：整集制作 →</a></div></header>${batchView()}${episode?.plannedText && episode.plannedText !== episode.text ? '<p class="vsb-warning">正文已更新，已有分镜保留，请逐镜核对。</p>' : ''}<details class="vsb-body"><summary>查看本集正文</summary><pre class="vf-text">${escape(episode?.text || '正文待准备')}</pre></details>${shots.map((shot, index) => shotCard(context, shot, index, shot.id === active?.id)).join('') || `<section class="cm-panel vf-empty"><h3>把本集正文，整理成可以制作的分镜</h3><p>每镜包含描述、关联资产、生成要求与结果。先用 AI 推荐，再按需调整。</p>${button('AI 整理分镜', 'prepare')}</section>`}</div></div>`;
  }
  function generation(context) {
    const workspace = board.state(context);
    const episode = workspace.episodes.find(item => item.id === workspace.selectedEpisodeId);
    const shots = finish.rows(context).map(row => row.shot);
    const shot = selected(context);
    const rows = finish.rows(context);
    const total = rows.at(-1)?.end || 0;
    const version = adopted(shot);
    return `<div class="vsb-workbench vsb-preview-workbench" data-vsb-stage="4">${rail(context, 4)}<div class="vsb-main"><section class="cm-panel vsb-player-panel"><header class="vsb-player-heading"><div><small>${escape(episode?.title || '当前集')}</small><h2>${shot ? `分镜 ${shots.indexOf(shot) + 1} · ${escape(shot.title)}` : '本集预览'}</h2></div>${shot ? button('返回本镜修改', 'edit-shot') : button('前往镜头编排', 'edit-shot')}</header><div class="vsb-player-screen">${picture(version?.image, '当前采用的静态镜头示意') || `<div class="vsb-empty-image"><span>▧</span><b>${shot ? '本镜尚未采用结果' : '本集尚无分镜'}</b><p>${shot ? '待准备的镜头保留位置与计划时长。' : '返回镜头编排，先整理本集分镜。'}</p></div>`}<span class="vsb-static-label">静态画面 · 可试听采用声音</span>${version?.image ? button(playing ? 'Ⅱ' : '▶', 'play', `aria-label="${playing ? '暂停节奏预览' : '播放节奏预览'}"`) : ''}</div><div class="vsb-player-controls">${button('◀', 'previous', `aria-label="上一镜" ${!shot || shots.indexOf(shot) === 0 ? 'disabled' : ''}`)}${button(playing ? '暂停' : '播放', 'play', `${!total ? 'disabled' : ''} aria-label="${playing ? '暂停节奏预览' : '播放节奏预览'}"`)}${button('▶', 'next', `aria-label="下一镜" ${!shot || shots.indexOf(shot) >= shots.length - 1 ? 'disabled' : ''}`)}<span class="vsb-clock">${time(position)} / ${time(total)}</span><input class="vsb-seek" type="range" aria-label="整集播放位置" min="0" max="${total || 1}" step="0.1" value="${position}" ${total ? '' : 'disabled'}></div></section>${timelineTools(context,shot)}</div></div>`;
  }
  function render(context, stage) {
    currentStage = stage;
    const key = context.p.id + '/' + context.c.id + '/' + board.state(context).selectedEpisodeId + '/' + stage;
    if (pageKey !== key) {
      stop(); pageKey = key; activeVersion = ''; batch = null; timelineSelection = { kind: 'video', id: selected(context)?.id || '' };
      position = sequenceRows(context).find(row => row.id === selected(context)?.id)?.start || 0;
    }
    current = context;
    currentStage = stage;
    return stage === 3 ? arrangement(context) : generation(context);
  }
  Cimora.videoStoryboardView = render;
  Cimora.flushVideoStoryboard = flush;
  Cimora.videoCanvasShotEditor = (context, shot) => shotCard(context, shot, board.shots(context).indexOf(shot), true);
  Cimora.videoStoryboardCanvasView = context => {
    stop();
    current = context;
    currentStage = 3;
    const shots = board.shots(context);
    const active = shots.find(shot => shot.id === context.e.selectedShotId) || selected(context);
    if (active) {
      context.e.selectedShotId = active.id;
      flow.ensure(context).selectedShotId = active.id;
    }
    const workspace = board.state(context);
    const episode = workspace.episodes.find(item => item.id === workspace.selectedEpisodeId);
    return `<div class="vsb-workbench vf-video-canvas" data-vsb-stage="3">${rail(context,3)}<div class="vsb-main"><header class="vsb-page-heading"><div><span class="cm-kicker">STORYBOARD CANVAS</span><h2>${escape(episode?.title || '当前集')}</h2><p>拖动镜头整理画布，点击镜头编辑内容。画布位置不改变播放顺序。</p></div><a class="cm-button primary" href="#${route(context,4)}">下一步：整集制作 →</a></header>${shots.length ? Cimora.creationCanvasView(context) : `<section class="cm-panel vf-empty"><h3>先把本集正文整理成分镜</h3>${button('AI 整理分镜','prepare')}</section>`}</div></div>`;
  };
  // A drag redraws the canvas; persist the visible shot form before it can be replaced.
  window.addEventListener('pointerdown', event => {
    if (!event.target.closest('.vf-video-canvas .bc-viewport') || event.target.closest('button,input,textarea,select')) return;
    try { flush(); } catch (error) { event.preventDefault(); event.stopImmediatePropagation(); site.toast(error.message); }
  }, true);
  const oldAfter = Cimora.afterRender;
  Cimora.afterRender = context => {
    oldAfter(context);
    if (!document.querySelector('.vsb-workbench')) { stop(); pageKey = ''; return; }
    if (focusAfterRender) {
      const target = focusAfterRender;
      focusAfterRender = '';
      requestAnimationFrame(() => focusView(target));
    }
  };
  function tick() {
    if (!playing || !document.querySelector('[data-vsb-stage="4"]')) { stop(); return; }
    const workspace = board.state(current);
    const rows = sequenceRows(current);
    const total = rows.at(-1)?.end || 0;
    position = Math.min(total, position + (Date.now() - stamp) / 1000);
    stamp = Date.now();
    const row = sequence.locate(rows, position);
    const changed = row && row.id !== selected(current)?.id;
    if (changed) flow.ensure(current).selectedShotId = row.id;
    if (changed && timelineSelection.kind === 'video') timelineSelection.id = row.id;
    if(currentStage===4) audioPlayer.sync(position,finish.audioRows(current),finish.musicRow(current),finish.state(current).mix,finish.effectRows(current));
    const complete = position >= total;
    if (complete) stop();
    if (changed || complete) paint();
    else {
      const clock = document.querySelector('.vsb-clock');
      const seek = document.querySelector('.vsb-seek');
      if (clock) clock.textContent = time(position) + ' / ' + time(total);
      if (seek) seek.value = position;
      const playhead = document.querySelector('.vsb-timeline-playhead');
      if (playhead) playhead.style.left = `calc(70px + (100% - 70px) * ${total ? position / total : 0})`;
    }
  }
  document.addEventListener('click', event => {
    const target = event.target.closest('[data-vsb]');
    if (!target || !target.closest('.vsb-workbench')) return;
    event.preventDefault();
    const action = target.dataset.vsb;
    if (action === 'asset-detail') { showAssetDetail(target.dataset.id); return; }
    if (action === 'timeline-select' && suppressTimelineClick) { suppressTimelineClick = false; return; }
    try {
      if (action !== 'play' && action !== 'audio-preview') stop();
      if (currentStage === 4) saveAudioDrafts();
      if (currentStage === 3 && action !== 'batch-cancel') flush();
      switch (action) {
        case 'describe':
          if (selected(current)?.storyboardInput?.prompt && !window.confirm('重新整理将替换本镜提示词，是否继续？')) return;
          board.describe(current,target.dataset.id);
          site.toast('已整理分镜描述，可在中间继续修改。'); break;
        case 'reference-remove': board.reference(current,target.dataset.shot,null,target.dataset.id); break;
        case 'prepare': board.prepare(current); site.toast('已保留当前分镜，缺失时按本集正文整理。'); break;
        case 'episode': board.selectEpisode(current, target.dataset.id); activeVersion = ''; batch = null; position = 0; break;
        case 'shot': case 'seek-shot': move(current, target.dataset.id); break;
        case 'timeline-select':
          timelineSelection = { kind: target.dataset.kind, id: target.dataset.id };
          if (target.dataset.kind !== 'music') {
            const effect=target.dataset.kind==='effect'?finish.effectRows(current).find(row=>row.id===target.dataset.id):null;
            move(current, effect?.shotId||target.dataset.id);
            if(effect)position=effect.start;
            if (target.dataset.kind === 'audio') position = finish.audioRows(current).find(row => row.id === target.dataset.id)?.start || 0;
          } else position = finish.musicRow(current)?.start || 0;
          break;
        case 'effect-remove': finish.removeEffect(current,target.dataset.id);timelineSelection={kind:'audio',id:selected(current)?.id};break;
        case 'timeline-music': timelineSelection = { kind: 'music', id: 'music' }; break;
        case 'timeline-audio': timelineSelection = { kind: 'audio', id: selected(current)?.id || finish.rows(current)[0]?.id || '' }; break;
        case 'timeline-zoom': timelineZoom = Math.max(12, Math.min(192, timelineZoom * (Number(target.dataset.offset) > 0 ? 2 : 0.5))); break;
        case 'version': activeVersion = target.dataset.id; break;
        case 'lock': board.lock(current, target.dataset.id); break;
        case 'generate': activeVersion = board.generate(current, target.dataset.id).id; site.toast('已新增静态示意候选，请核对后采用。'); break;
        case 'adopt': board.adopt(current, target.dataset.shot, target.dataset.id); break;
        case 'batch': batch = board.batchPlan(current, batchScope); break;
        case 'batch-cancel': batch = null; break;
        case 'batch-confirm': {
          let result;
          try { result = board.runBatch(current, batch); }
          catch (error) { batch = null; paint(); throw error; }
          batch = null;
          site.toast(`已准备 ${result.completed} 镜静态候选${result.skipped.length ? `，${result.skipped.length} 镜缺少参考，保留待准备` : ''}`);
          break;
        }
        case 'edit-shot': focusAfterRender = '.vsb-expanded'; site.route(route(current, 3)); return;
        case 'previous': case 'next': {
          const shots = currentStage === 4 ? finish.rows(current).map(row => row.shot) : board.shots(current);
          const index = shots.findIndex(shot => shot.id === selected(current)?.id);
          const next = shots[index + (action === 'next' ? 1 : -1)];
          if (next) move(current, next.id);
          if (next && currentStage === 4) timelineSelection = { kind: 'video', id: next.id };
          break;
        }
        case 'play': {
          const rows = sequenceRows(current);
          const total = rows.at(-1)?.end || 0;
          if (!total) return;
          if (playing) stop();
          else { audioPlayer.stop(); audioPlayer.unlock(); if (position >= total) position = 0; playing = true; stamp = Date.now(); if(currentStage===4) audioPlayer.sync(position,finish.audioRows(current),finish.musicRow(current),finish.state(current).mix,finish.effectRows(current)); player.start(tick); }
          break;
        }
        case 'apply-edit': flow.applyEdit(current, target.dataset.id); break;
        case 'cancel-edit': flow.cancelEdit(current, target.dataset.id); break;
        case 'voice-generate': saveSound(); finish.generateVoice(current,target.dataset.id); site.toast('配音候选已生成，试听后可替换到时间线。'); break;
        case 'music-generate': saveMusicDraft(); finish.generateMusic(current); site.toast('背景音候选已生成，试听后可替换到时间线。'); break;
        case 'audio-preview': {
          if(playing) stop();
          const candidate=(target.dataset.kind==='effect' ? finish.effectCandidates(current,target.dataset.shot) : target.dataset.kind==='voice' ? finish.voiceCandidates(current,target.dataset.shot) : finish.musicCandidates(current)).find(c=>c.id===target.dataset.id);
          if(!candidate) throw Error('候选不存在，请重新选择。');
          audioPlayer.preview(candidate);return;
        }
        case 'audio-stop': break;
        case 'audio-adopt':
          if(target.dataset.kind==='voice') finish.adoptVoice(current,target.dataset.shot,target.dataset.id);
          else if(target.dataset.kind==='effect')finish.adoptEffect(current,target.dataset.shot,target.dataset.id);
          else finish.adoptMusic(current,target.dataset.id);
          site.toast('已替换到时间线，播放整集可预览声音效果。');break;
        case 'clip-move': finish.move(current,target.dataset.id,Number(target.dataset.offset)); move(current,target.dataset.id); break;
        case 'assemble': {
          saveMix();
          const form = document.querySelector('#vsb-clip');
          if (form) finish.clip(current,form.dataset.shot,Object.fromEntries(new FormData(form)));
          finish.assemble(current); site.toast('整集拼接方案已保存，当前未输出视频。'); break;
        }
      }
      paint();
      if (action === 'shot' || action === 'prepare') focusView('.vsb-expanded');
      if (action === 'episode') focusView('.vsb-main');
      if (action === 'batch') focusView('.vsb-batch');
      if (action === 'seek-shot') focusView('.vsb-player-panel');
    } catch (error) { site.toast(error.message || '操作失败'); }
  });
  document.addEventListener('submit', event => {
    if (!event.target.matches('.vsb-shot-form,#vsb-modify,#vsb-sound,#vsb-music-ai,#vsb-mix,#vsb-clip,#vsb-audio-clip,#vsb-effect-clip,#vsb-music-clip,#vsb-original-volume')) return;
    event.preventDefault();
    try {
      stop();
      const modifying = event.target.id === 'vsb-modify';
      if (event.target.id === 'vsb-music-ai') { saveMusicDraft(); paint(); site.toast('背景音描述已保存。'); return; }
      if (event.target.id === 'vsb-sound') { flush(); saveSound(); paint(); site.toast('本镜声音设置已保存。'); return; }
      if (event.target.id === 'vsb-mix') { saveMix(); paint(); site.toast('整集声音设置已保存。'); return; }
      if (event.target.id === 'vsb-original-volume') { finish.mix(current,Object.fromEntries(new FormData(event.target))); paint(); return; }
      if (event.target.id === 'vsb-effect-clip') {finish.effectClip(current,event.target.dataset.id,Object.fromEntries(new FormData(event.target)));paint();return;}
      if (event.target.id === 'vsb-audio-clip') { finish.audioClip(current,event.target.dataset.shot,Object.fromEntries(new FormData(event.target))); paint(); return; }
      if (event.target.id === 'vsb-music-clip') { finish.musicClip(current,Object.fromEntries(new FormData(event.target))); paint(); return; }
      if (event.target.id === 'vsb-clip') { finish.clip(current,event.target.dataset.shot,Object.fromEntries(new FormData(event.target))); move(current,event.target.dataset.shot); paint(); site.toast('裁切与衔接已保存。'); return; }
      if (modifying) {
        flow.requestEdit(current, String(new FormData(event.target).get('prompt') || ''), event.target.dataset.shot);
        editDrafts.delete(draftKey(current, event.target.dataset.shot));
      } else flush();
      paint();
      site.toast(modifying ? '已整理修改要求，请确认后应用到分镜文字。' : '已保存本镜要求，当前采用结果保留。');
    } catch (error) { site.toast(error.message); }
  });
  document.addEventListener('change', async event => {
    const input = event.target;
    if (input.matches('#vsb-sound select[name="mode"]')) { try { stop(); flush(); saveSound(); timelineSelection = { kind: 'audio', id: input.closest('form').dataset.shot }; paint(); } catch (error) { site.toast(error.message); } return; }
    if (input.id === 'vsb-batch-scope') { batchScope = input.value; return; }
    if (input.matches('.vsb-shot-form input[name="mode"]')) {
      const frames = input.closest('form').querySelector('.vsb-frame-inputs');
      if (frames) frames.hidden = input.value !== 'keyframes';
      return;
    }
    if (input.matches('.vsb-seek')) {
      stop(); position = Number(input.value);
      const row = sequence.locate(sequenceRows(current), position);
      if (row) board.select(current, row.id);
      activeVersion = ''; paint(); return;
    }
    if (!input.matches('[data-vsb-upload],[data-vsb-frame],[data-vsb-reference]') || !input.files?.[0]) return;
    const context = current;
    const key = pageKey;
    const capturedShotId = selected(current)?.id;
    try {
      stop(); flush();
      const file = input.files[0];
      if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 4 * 1024 * 1024) throw Error('请上传小于 4MB 的 PNG、JPG 或 WebP 图片。');
      const image = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(Error('图片读取失败。')); reader.readAsDataURL(file); });
      if (current !== context || pageKey !== key || selected(context)?.id !== capturedShotId) return;
      if (input.dataset.vsbReference) board.reference(context,input.dataset.vsbReference,{name:file.name,image:await compactReference(image, () => current === context && pageKey === key && selected(context)?.id === capturedShotId)});
      else if (input.dataset.vsbFrame) board.frame(context, input.dataset.shot, input.dataset.vsbFrame, image);
      else activeVersion = board.upload(context, input.dataset.vsbUpload, image).id;
      paint();
    } catch (error) { site.toast(error.message); }
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  window.addEventListener('pagehide',stop);
  document.addEventListener('input', event => {
    if (event.target.matches('#vsb-modify textarea[name="prompt"]')) {
      editDrafts.set(draftKey(current, event.target.closest('form').dataset.shot), event.target.value);
    }
  });
  const clampTime = (value, min, max) => Math.max(min, Math.min(max, Math.round(value * 10) / 10));
  document.addEventListener('pointerdown', event => {
    if (event.button !== 0 || currentStage !== 4 || !event.target.closest('.vsb-timeline')) return;
    const ruler = event.target.closest('[data-vsb-ruler]');
    const rows = finish.rows(current), total = rows.at(-1)?.end || 0;
    if (ruler && total) {
      stop();
      position = clampTime((event.clientX - ruler.getBoundingClientRect().left) / ruler.clientWidth * total, 0, total);
      const row = sequence.locate(rows, position);
      if (row) { board.select(current, row.id); timelineSelection = { kind: 'video', id: row.id }; }
      paint(); return;
    }
    const element = event.target.closest('.vsb-track-clip');
    if (!element || !total) return;
    const kind = element.dataset.kind, id = element.dataset.id;
    const row = kind === 'video' ? rows.find(value => value.id === id) : kind === 'audio' ? finish.audioRows(current).find(value => value.id === id) : kind === 'effect' ? finish.effectRows(current).find(value=>value.id===id) : finish.musicRow(current);
    if (!row || row.linked) return;
    event.preventDefault(); stop(); suppressTimelineClick = false;
    timelineDrag = { key: pageKey, context: current, pointer: event.pointerId, element, kind, id, row, total, rows, handle: event.target.closest('[data-vsb-handle]')?.dataset.vsbHandle || '', origin: event.clientX, track: element.parentElement, moved: false };
    element.setPointerCapture(event.pointerId);
  });
  document.addEventListener('pointermove', event => {
    const drag = timelineDrag;
    if (!drag || drag.pointer !== event.pointerId || drag.key !== pageKey) return;
    const delta = (event.clientX - drag.origin) / drag.track.clientWidth * drag.total;
    if (Math.abs(event.clientX - drag.origin) < 3 && !drag.moved) return;
    drag.moved = true;
    drag.element.classList.add('dragging');
    const row = drag.row;
    let start = row.start, duration = row.duration;
    if (drag.kind === 'video' && !drag.handle) {
      const bounds = drag.track.getBoundingClientRect();
      const at = (event.clientX - bounds.left) / bounds.width * drag.total;
      drag.beforeId = drag.rows.filter(value => value.id !== drag.id).find(value => at < value.start + value.duration / 2)?.id || null;
      drag.track.querySelectorAll('.drop-before').forEach(element => element.classList.remove('drop-before'));
      const target = [...drag.track.children].find(element => element.dataset.id === drag.beforeId);
      if (target) target.classList.add('drop-before');
      drag.element.style.transform = `translateX(${event.clientX - drag.origin}px)`;
      return;
    }
    if (drag.kind === 'music') {
      if (drag.handle === 'left') start = clampTime(row.start + delta, 0, row.end - 0.1);
      else if (drag.handle === 'right') duration = clampTime(row.duration + delta, 0.1, drag.total - row.start);
      else start = clampTime(row.start + delta, 0, drag.total - row.duration);
      if (drag.handle === 'left') duration = row.end - start;
      drag.values = { start, end: start + duration };
    } else {
      let begin = row.in, end = row.out;
      const sourceDuration = drag.kind === 'video' ? row.shot.duration : row.sourceDuration;
      if (drag.handle === 'left') {
        begin = clampTime(row.in + delta, 0, row.out - 0.1);
        if (['audio','effect'].includes(drag.kind)) begin = Math.max(begin, row.in - row.start);
        start = row.start + begin - row.in;
      } else if (drag.handle === 'right') end = clampTime(row.out + delta, row.in + 0.1, ['audio','effect'].includes(drag.kind) ? Math.min(sourceDuration, row.in + drag.total - row.start) : sourceDuration);
      else start = clampTime(row.start + delta, 0, drag.total - row.duration);
      duration = end - begin;
      drag.values = { in: begin, out: end, ...(['audio','effect'].includes(drag.kind) ? { start } : {}) };
    }
    drag.element.style.setProperty('--clip-left', `${start / drag.total * 100}%`);
    drag.element.style.setProperty('--clip-width', `${duration / drag.total * 100}%`);
    drag.element.querySelector('small').textContent = `${duration.toFixed(1)}秒`;
  });
  function endTimelineDrag(event, cancelled = false) {
    const drag = timelineDrag;
    if (!drag || drag.pointer !== event.pointerId) return;
    timelineDrag = null;
    suppressTimelineClick = drag.moved;
    if (drag.key !== pageKey || drag.context !== current) return;
    try {
      if (!cancelled && drag.moved) {
        if (drag.kind === 'video') {
          if (drag.handle) finish.clip(current, drag.id, drag.values);
          else finish.reorder(current, drag.id, drag.beforeId);
        } else if (drag.kind==='effect')finish.effectClip(current,drag.id,drag.values);
        else if (drag.kind==='audio')finish.audioClip(current,drag.id,drag.values);
        else finish.musicClip(current, drag.values);
      }
      timelineSelection = { kind: drag.kind, id: drag.id };
      if (drag.kind !== 'music') move(current, drag.kind==='effect'?drag.row.shotId:drag.id);
      paint();
    } catch (error) { paint(); site.toast(error.message); }
  }
  document.addEventListener('pointerup', event => endTimelineDrag(event));
  document.addEventListener('pointercancel', event => endTimelineDrag(event, true));
  document.addEventListener('click', event => {
    const link = event.target.closest('.vf-page a[href]');
    if (!link || !document.querySelector('.vsb-workbench')) return;
    try { flush(); stop(); } catch (error) { event.preventDefault(); event.stopImmediatePropagation(); site.toast(error.message); }
  }, true);
})();

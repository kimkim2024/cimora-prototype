(()=>{
  const D=FrameData;
  const aliases={'keyframes':{id:'image-motion',mode:'keyframes'},'comic-to-motion':{id:'image-motion',preset:'漫画单格'},'live2d-layers':{id:'live2d-generation',legacy:'live2d-layers'},'live2d-rig':{id:'live2d-generation',legacy:'live2d-rig'},'image-gen':{id:'anime-draw',legacy:'image-gen'},'image-edit':{id:'anime-draw',legacy:'image-edit'}};
  const advanced=['batch-assets'];
  for(const t of D.tools){
    t.group=['oc-sheet','expressions','live2d-layers','live2d-rig','pngtuber','consistency-check'].includes(t.id)?'角色创作':['comic-to-motion','motion-quality'].includes(t.id)?'视频与动态':'图片与漫画';
    t.secondary=advanced.includes(t.id);
    if(['consistency-check','continuity','motion-quality'].includes(t.id)){t.hidden=true;t.retired=true;}
    if(['panel-splitter','storyboard'].includes(t.id))t.hidden=true;
    if(['live2d-layers','live2d-rig'].includes(t.id))t.hidden=true;
    if(t.id==='oc-sheet')Object.assign(t,{desc:'整理人物介绍，一次建立三视图与头像，再按需更换服饰配饰，保存或带入作品。',options:['日漫角色设定','清新韩漫','赛璐璐动画'],output:'人物介绍、三视图与头像'});
    if(t.id==='expressions')Object.assign(t,{desc:'沿用已有角色，补充表情与动作参考，逐项挑选并带回角色。',options:['表情','姿势'],output:'角色表情与姿势参考'});
    if(t.id==='pngtuber')Object.assign(t,{desc:'把喜欢的角色变成会说话的小伙伴，生成四状态，试演后下载透明素材包。',input:'上传或选择角色',output:'四状态透明 PNG 与离线试演'});
    if(t.id==='colorize')Object.assign(t,{desc:'上传草稿或线稿，选择清理或上色，参考角色配色并对比处理效果。',options:['AI 推荐','赛璐璐','柔和厚涂'],output:'原图与处理结果'});
    if(t.id==='lettering')Object.assign(t,{title:'漫画翻译与排字',desc:'上传漫画，核对原文、修改译文并排回画面，下载排字图片。',input:'上传漫画图片',param:'目标语言',output:'翻译排字图片'});
    if(t.id==='storyboard'){t.title='剧情生成分镜';t.desc='把一段剧情整理成视觉分镜候选，逐镜核对人物与动作。';}
    if(t.id==='batch-assets')Object.assign(t,{title:'图片高清与压缩',desc:'放大图片或减小文件，查看前后细节，下载或带回作品。',input:'上传图片或选择已有资产',param:'处理方式',options:['高清放大','压缩图片'],output:'放大预览或压缩图片',asset:'图片',kind:'optimize',secondary:false});
  }
  const create=(id,title,group,kind,desc,options,art=1)=>({id,title,group,kind,desc,options,art,stage:'P1',icon:kind==='motion'?'▷':'✧',en:'CREATION TOOL',input:'描述或上传参考',param:'创作预设',output:'示例结果',asset:'图片'});
  const motion=D.tools.find(t=>t.id==='comic-to-motion');
  Object.assign(motion,{id:'image-motion',title:'图片动起来',desc:'从单图或首尾帧出发，描述动作，预览并保留动态方案。',input:'上传图片或漫画单格（整页可框选区域）',param:'运镜方式',options:['缓慢推进','横向摇移','缓慢拉远','漫画单格'],group:'视频与动态'});
  D.tools.push(
    {id:'live2d-generation',title:'Live2D 生成',en:'LIVE2D GENERATION',group:'角色创作',kind:'live2d',stage:'P1',icon:'⌘',desc:'从角色立绘出发，一起整理分层、补画和绑定，预览角色动作。',input:'上传角色立绘或分层 PSD',param:'生成范围',options:['基础角色','头部精细','全身角色'],output:'分层与绑定方案、动作预览',asset:'Live2D 资料',art:1},
    create('anime-draw','二次元绘图','图片与漫画','drawing','从文字或图片开始，生成二次元画面，继续做图片修改并保留版本。',['AI 推荐','赛璐璐动画','清新手绘','漫画插画']),
    {...create('image-gen','二次元图片生成','角色创作','image','原绘图工具资料保留。',['赛璐璐动画','清新手绘','漫画插画']),hidden:true},
    {...create('image-edit','图片修改','图片与漫画','edit','原改图工具资料保留。',['修改服装','调整表情','更换背景','局部修改']),hidden:true},
    {...create('remove-bg','抠图与透明背景','图片与漫画','transparent','分离人物或物件，检查并修补边缘，下载透明 PNG 或带入作品。',['保留角色','保留物件']),input:'上传图片或选择已有资产',output:'透明 PNG 素材'},
    {...create('keyframes','首尾帧创作','视频与动态','keyframes','首尾帧已并入图片动起来。',['自然过渡','动作衔接','镜头转场']),hidden:true},
    {...create('video-redraw','视频转绘','视频与动态','redraw','沿用视频动作与镜头，描述画风或关联角色，对比修改并保留版本。',['赛璐璐动画','漫画风格','手绘风格']),input:'上传视频或选择已有片段',output:'转绘视频候选'},
    {...create('voiceover','角色配音与旁白','配音与声音','audio','描述角色或情境，试听三个声音方向，再用选定的声音配台词。',['清澈少女','沉稳青年男声','自然旁白']),param:'音色',input:'描述角色或带入已有角色',output:'角色声音与配音',asset:'声音',icon:'♫'},
    {...create('background-music','背景音乐','配音与声音','audio','描述情境，比较三个音乐方向，打磨完整配乐并带入视频。',['雨夜钢琴','温暖日常','悬疑氛围']),param:'音乐情境',output:'完整配乐与 WAV',asset:'声音',icon:'♪'},
    {...create('sound-effects','环境音与音效','配音与声音','audio','描述环境或动作，比较三个完整声音，修改后采用并带入视频镜头。',['雨声','脚步声','消息提示']),param:'场景与动作描述',output:'完整声音试听与 WAV',asset:'声音',icon:'♬'},
    {...create('music-sound','音乐与音效','配音与声音','audio','为作品制作背景音乐、环境音或动作音效，试听比较、修改并带入视频。',['背景音乐','环境音与动作音效']),output:'音乐、音效与 WAV',asset:'声音',icon:'♬'}
  );
  for(const tool of D.tools)if(['background-music','sound-effects'].includes(tool.id))tool.mergedInto='music-sound';
  for(const tool of D.tools)tool.reviewRound=['image-motion','lettering','oc-sheet','expressions','colorize','live2d-generation','anime-draw','remove-bg','video-redraw','pngtuber','voiceover','background-music','music-sound'].includes(tool.id)?1:0;
  const popular=['anime-draw','oc-sheet','remove-bg','expressions','image-motion','colorize','lettering'];
  window.ToolCatalog={groups:['全部','角色创作','图片与漫画','视频与动态','配音与声音'],aliases,resolve:id=>aliases[id]?.id||id,find:id=>D.tools.find(t=>t.id===(aliases[id]?.id||id)),all:()=>D.tools.filter(t=>!t.hidden&&!t.mergedInto),popular:()=>popular.map(id=>D.tools.find(t=>t.id===id)),home:()=>['image-motion','video-redraw'].map(id=>D.tools.find(t=>t.id===id))};
})();

window.ComicLabSample={
title:'借一把晴天',seed:'下雨天女孩在旧书店借到黄伞，次日送还，在伞里留下纸太阳。',
story:'傍晚，小满抱着深蓝色的书站在旧书店门内。雨丝忽然密起来，她望着门外，小声想：小雨怎么变大雨了……\n周叔从靠门的柜台旁拿来一把合拢的黄伞，问她：没带伞？小满不好意思地点头：嗯……\n周叔把深棕色弯柄递到她面前，笑着说：先借你一把晴天。小满撑开黄伞，回头挥手：明天还您！黄伞在暮色里亮得像一小片太阳。\n\n第二天下午，雨停了。小满仍穿着浅绿开衫，挎着米色帆布包，来到绿色门框前，把合拢的伞递给周叔：晴天还给您。\n周叔打开伞，发现里面藏着一枚纸太阳，不禁轻轻地：咦？纸太阳旁有一张卡片，上面写着：下雨也有好心情。\n小满已沿着湿润的街道跑远。周叔站在旧书店门口，笑着想：还真是个晴天。',
assets:[
{id:'xiaoman',kind:'人物',name:'小满',stable:'20岁；黑色齐耳短发、圆眼镜；浅绿开衫、米色帆布包、深蓝书。次日服装一致。'},
{id:'zhou',kind:'人物',name:'周叔',stable:'60岁；灰短发、方眼镜；棕围裙、米白衬衫。温和书店店主。'},
{id:'store',kind:'场景',name:'旧书店',stable:'木门、绿色门框、暖光书架、靠门木柜台。两天空间一致。'},
{id:'umbrella',kind:'道具',name:'黄长柄伞',stable:'纯黄伞面，深棕弯柄；第一场借出，第二场归还。'},
{id:'sun',kind:'道具',name:'纸太阳与卡片',stable:'手工纸太阳、米白卡片；只在第二场出现，文字独立叠加。'}],
scenes:[
{name:'第一场 · 雨中傍晚',state:'雨势变大，室内暖光；小满从为难到开心；无纸太阳。',beat:'看雨受阻 → 周叔询问 → 借伞 → 挥手约定',assetIds:['xiaoman','zhou','store','umbrella'],actions:['小满在书店门内抱着深蓝书看雨；中景，门外雨线清晰。','周叔在靠门柜台旁拿合拢黄伞，小满抬头；双人中景。','近景：周叔将黄伞深棕弯柄递给小满，两人的手形成视线重点。','小满撑开黄伞回头挥手，米色包在肩上；周叔留在绿门框内。'],texts:[[['thought','小雨怎么变大雨了……','小满']],[['dialogue','没带伞？','周叔'],['dialogue','嗯……','小满']],[['dialogue','先借你一把晴天。','周叔']],[['dialogue','明天还您！','小满']]]},
{name:'第二场 · 次日雨停',state:'第二天下午，雨停地面微湿；人物服装不变，纸太阳仅本场出现。',beat:'归还 → 发现 → 纸太阳与卡片 → 微笑呼应',assetIds:['xiaoman','zhou','store','umbrella','sun'],actions:['小满在书店门口归还合拢黄伞；相同绿色门框，次日光线。','周叔打开黄伞，惊讶发现伞内纸太阳，小满在旁微笑。','特写：黄伞内纸太阳与米白空白卡片；卡片文字由独立对象叠加。','周叔站在书店绿色门框旁微笑，小满背影沿街跑远。'],texts:[[['caption','第二天下午',''],['dialogue','晴天还给您。','小满']],[['dialogue','咦？','周叔']],[['caption','下雨也有好心情','卡片']],[['thought','还真是个晴天。','周叔']]]}
],load(M){let d=M.create(this.seed);d.title=this.title;d.story=this.story;d.isSample=true;d.assets=structuredClone(this.assets);d.scenes=this.scenes.map((s,si)=>({...structuredClone(s),id:M.id(),generated:false,panels:s.actions.map((a,i)=>{let p=M.panel(a);p.sampleImage=`assets/scene${si+1}-${i+1}.jpg`;s.texts[i].forEach((t,j)=>{let x=M.addText(p,...t);x.speaker=t[2];x.y=j?70:5;x.x=j?52:5;x.w=43;x.h=20;x.size=25;x.tailX=t[2]==='周叔'?76:34;x.tailY=29;if(si===0&&i===0){x.x=51;x.y=4;x.size=23;x.w=46;x.h=18;x.tailX=45;x.tailY=27;}if(si===1&&i===2){x.x=22;x.y=48;x.w=53;x.h=23;x.size=25;}});if(si===0&&i===2){p.texts[0].w=52;p.texts[0].h=17;p.texts[0].tailX=18;p.texts[0].tailY=28;}if(si===1&&i===0){p.texts[0].w=33;p.texts[0].h=12;}return p;})}));return d;}
};



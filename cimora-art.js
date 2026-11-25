/* 2026-10-29 由生图模型制作的原创二次元示例。仅作为预置素材，不代表页面操作调用模型。 */
(()=>{const fallback=Art.url.bind(Art),map=[0,1,2,3,2,4,4,0,5,4];Art.originalUrl=fallback;Art.url=function(i=0){if(typeof i==='string'&&/^(data:image\/(?:png|jpeg|webp|gif);base64,|https?:\/\/|\/?[\w.-]+\/)/i.test(i))return i;return i>=10?'assets/cimora-cover.webp':`assets/cimora-story-${map[(i+10)%10]}.webp`;};})();

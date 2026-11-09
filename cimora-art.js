/* 2026-10-29 Original anime-style sample made with an image model. Preset material only; page actions do not call any model. */
(()=>{const fallback=Art.url.bind(Art),map=[0,1,2,3,2,4,4,0,5,4];Art.originalUrl=fallback;Art.url=function(i=0){return i>=10?'assets/cimora-cover.webp':`assets/cimora-story-${map[(i+10)%10]}.webp`;};})();

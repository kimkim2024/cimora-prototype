/* ShaderCanvas reference, native implementation scoped to the homepage hero. */
(()=>{
 const vertexSource='attribute vec2 a_position; void main(){gl_Position=vec4(a_position,0.0,1.0);}';
 const fragmentSource=`precision mediump float;
 uniform float u_time; uniform vec2 u_resolution; uniform vec2 u_pointer;
 uniform vec3 u_accent; uniform vec3 u_surface; uniform vec3 u_ink;
 void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 p=uv*2.0-1.0;
  p.x*=u_resolution.x/u_resolution.y;
  vec2 m=(u_pointer*2.0-1.0)*vec2(u_resolution.x/u_resolution.y,1.0);
  float t=u_time*0.25;
  float wave=sin(p.x*2.1+t*2.0+sin(p.y*3.0-t)*0.8)*0.5+0.5;
  float glow=0.35/(0.35+length(p-m)*length(p-m)*6.25);
  float band=smoothstep(0.15,0.95,wave*0.7+glow*0.6-uv.y*0.35);
  vec3 colour=mix(u_surface,u_accent,band*0.85);
  colour=mix(colour,u_ink,smoothstep(0.92,1.0,band)*0.12);
  gl_FragColor=vec4(colour,1.0);
 }`;
 const carried=new Map();
 const hostKey=host=>host.classList&&host.classList.contains('cm-sidebar')?'sidebar':host.classList&&host.classList.contains('public-ambient')?'ambient':'hero';
 function mount(host,key=hostKey(host)){
  const canvas=document.createElement('canvas');canvas.className='hm-shader-canvas';canvas.setAttribute('aria-hidden','true');host.prepend(canvas);
  const abort=new AbortController(),on=(el,event,fn)=>el.addEventListener(event,fn,{signal:abort.signal,passive:event==='pointermove'});
  let frame=0,last=0,time=carried.get(key)||0,visible=true,lost=false,failed=false,disposed=false,program=null,buffer=null,shaders=[];
  let ro,io,mo;const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const pointer={x:.5,y:.5,tx:.5,ty:.5};
  const stop=()=>{cancelAnimationFrame(frame);frame=0;last=0;carried.set(key,time);host.dataset.shaderAnimating='false';};
  const fail=error=>{failed=true;stop();host.dataset.shaderStatus='error';console.error('[Cimora shader]',error);};
  host.dataset.shaderStatus='starting';
  const gl=canvas.getContext('webgl',{antialias:false,premultipliedAlpha:false,alpha:false});
  const dispose=()=>{disposed=true;carried.set(key,time);stop();abort.abort();ro?.disconnect();io?.disconnect();mo?.disconnect();if(gl){if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s));gl.getExtension('WEBGL_lose_context')?.loseContext();}canvas.remove();};
  if(!gl){host.dataset.shaderStatus='unsupported';return dispose;}
  try{
   const compile=(type,source)=>{const s=gl.createShader(type);if(!s)throw Error('Cannot allocate shader');shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s)||'Shader compilation failed');return s;};
   const vertex=compile(gl.VERTEX_SHADER,vertexSource),fragment=compile(gl.FRAGMENT_SHADER,fragmentSource);
   program=gl.createProgram();if(!program)throw Error('Cannot allocate program');gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program)||'Shader linking failed');
   gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
   const pos=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
   const uTime=gl.getUniformLocation(program,'u_time'),uResolution=gl.getUniformLocation(program,'u_resolution'),uPointer=gl.getUniformLocation(program,'u_pointer');
   const probe=document.createElement('canvas');probe.width=probe.height=1;const ctx=probe.getContext('2d',{willReadFrequently:true});
   function palette(){if(lost||failed)return;const cs=getComputedStyle(host);for(const key of ['accent','surface','ink']){ctx.clearRect(0,0,1,1);ctx.fillStyle=cs.getPropertyValue('--shader-'+key).trim();ctx.fillRect(0,0,1,1);const rgb=ctx.getImageData(0,0,1,1).data;gl.uniform3fv(gl.getUniformLocation(program,'u_'+key),[rgb[0]/255,rgb[1]/255,rgb[2]/255]);}}
   function resize(){const r=host.getBoundingClientRect(),ratio=Math.min(2,devicePixelRatio||1)*.5;const max=gl.getParameter(gl.MAX_VIEWPORT_DIMS);canvas.width=Math.max(1,Math.min(max[0],Math.round(r.width*ratio)));canvas.height=Math.max(1,Math.min(max[1],Math.round(r.height*ratio)));gl.viewport(0,0,canvas.width,canvas.height);}
   function draw(t){if(lost||failed||disposed)return;gl.uniform1f(uTime,t);gl.uniform2f(uResolution,canvas.width,canvas.height);gl.uniform2f(uPointer,pointer.x,pointer.y);gl.drawArrays(gl.TRIANGLES,0,3);}
   function loop(now){frame=0;if(disposed||lost||failed||!visible||document.hidden||motion.matches){stop();return;}if(last)time+=Math.min(.1,(now-last)/1000);last=now;pointer.x+=(pointer.tx-pointer.x)*.06;pointer.y+=(pointer.ty-pointer.y)*.06;draw(time);frame=requestAnimationFrame(loop);}
   function start(){stop();if(lost||failed||disposed)return;if(motion.matches)draw(4);else if(visible&&!document.hidden){frame=requestAnimationFrame(loop);host.dataset.shaderAnimating='true';}}
   resize();palette();draw(motion.matches?4:0);host.dataset.shaderStatus='running';start();
   ro=new ResizeObserver(()=>{if(lost||disposed)return;resize();draw(motion.matches?4:time);});ro.observe(host);
   io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;start();});io.observe(host);
   mo=new MutationObserver(()=>{palette();draw(motion.matches?4:time);});mo.observe(document.documentElement,{attributes:true,attributeFilter:['class','style','data-theme','data-cimora-theme']});
   on(document,'visibilitychange',start);on(motion,'change',start);
   on(host,'pointermove',e=>{const r=host.getBoundingClientRect();if(!r.width||!r.height)return;pointer.tx=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));pointer.ty=Math.max(0,Math.min(1,1-(e.clientY-r.top)/r.height));});
   on(canvas,'webglcontextlost',e=>{e.preventDefault();lost=true;stop();host.dataset.shaderStatus='unsupported';});
   on(canvas,'webglcontextrestored',()=>{if(disposed)return;dispose();if(host.isConnected)mounted.set(host,mount(host,key));});
  }catch(error){fail(error);}
  return dispose;
 }
 const mounted=new Map();
 const isAmbient=host=>host.classList&&host.classList.contains('public-ambient');
const ambientPage=()=>document.body.classList.contains('public-body')&&!document.body.classList.contains('cimora-home-public');
function sync(){mounted.forEach((dispose,host)=>{if(!host.isConnected||(isAmbient(host)&&!ambientPage())){dispose();mounted.delete(host);}});document.querySelectorAll('.hm-official .hm-hero-vignette, body.cimora-app .cm-sidebar, .public-ambient').forEach(host=>{if(isAmbient(host)&&!ambientPage())return;if(!mounted.has(host))mounted.set(host,mount(host,hostKey(host)));});}
 new MutationObserver(sync).observe(document.documentElement,{childList:true,subtree:true});sync();
})();

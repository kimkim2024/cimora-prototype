import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../lib/hooks';

const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColor;
uniform float uScale;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}

float fbm(vec2 p){
  float v = 0., a = .5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= .5; }
  return v;
}

// compact 4x4 Bayer matrix, values in [0,1)
float bayer2(vec2 a){ a = floor(a); return fract(a.x / 2. + a.y * a.y * .75); }
float bayer4(vec2 a){ return bayer2(.5 * a) * .25 + bayer2(a); }

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float ar = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * ar, uv.y) * 3.2 * uScale;
  float t = uTime;

  // two rounds of warping so the field curls instead of boiling
  vec2 q = vec2(fbm(p + t * .12), fbm(p + vec2(3.1, 1.7) - t * .1));
  float f = fbm(p + 1.7 * q + vec2(t * .06, -t * .05));

  // a smooth field over the whole card, so the dither density varies instead of
  // collapsing into solid blobs; kept light and bottom-weighted so the type on
  // top stays clean
  float field = clamp((f - .12) * 1.7, 0., 1.);
  field *= .45;
  field *= mix(.12, 1., smoothstep(.1, .62, uv.y));

  float d = bayer4(gl_FragCoord.xy);
  float on = step(d, field);

  gl_FragColor = vec4(uColor, on * .55);
}`;

type Props = { speed: number; color?: string; scale?: number; className?: string };

/**
 * Dithered warp field behind the hero. Hand-rolled (no shader library): a 4x4
 * Bayer threshold over warped noise, in one accent colour on transparency, so
 * the card underneath provides the paper. Hover speeds it up; reduced motion
 * draws a single frame.
 */
export function DitherField({ speed, color = '#9ccc0f', scale = 1, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const speedRef = useRef(speed);
  const reduced = useReducedMotion();

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram();
    const vertex = compile(gl.VERTEX_SHADER, VERT);
    const fragment = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!program || !vertex || !fragment) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'uRes');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uColor = gl.getUniformLocation(program, 'uColor');
    const uScale = gl.getUniformLocation(program, 'uScale');

    // one accent colour, read from the CSS token so it never drifts
    const probe = document.createElement('canvas').getContext('2d');
    let rgb: [number, number, number] = [0.784, 0.949, 0.306];
    if (probe) {
      probe.fillStyle = color;
      probe.fillRect(0, 0, 1, 1);
      const data = probe.getImageData(0, 0, 1, 1).data;
      rgb = [data[0] / 255, data[1] / 255, data[2] / 255];
    }
    gl.uniform3f(uColor, rgb[0], rgb[1], rgb[2]);
    gl.uniform1f(uScale, scale);

    const draw = (t: number) => {
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = () => {
      // render small and let the browser upscale: the 4x4 dither then reads as
      // 3px blocks instead of a flat tint, and the shader gets cheaper
      const ratio = 1 / 4;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    let frame = 0;
    let last = 0;
    let clock = 0;
    const loop = (now: number) => {
      if (!canvas.isConnected) return;
      frame = requestAnimationFrame(loop);
      if (now - last < 1000 / 30 - 2) return; // a slow field does not need 60fps
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      clock += dt * speedRef.current;
      draw(clock);
    };

    const ro = new ResizeObserver(() => {
      resize();
      draw(clock);
    });
    ro.observe(canvas);
    resize();

    if (reduced) {
      clock = 4;
      draw(clock);
    } else {
      frame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [color, scale, reduced]);

  return <canvas ref={canvasRef} aria-hidden className={'size-full [image-rendering:pixelated] ' + className} />;
}

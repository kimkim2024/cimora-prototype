import { useEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from '../../lib/hooks';

const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';

// port of the prototype's hero vignette (cimora-shader-background.js)
const FRAG = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform vec3 u_accent;
uniform vec3 u_surface;
uniform vec3 u_ink;

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_resolution.x / u_resolution.y;
  vec2 m = (u_pointer * 2.0 - 1.0) * vec2(u_resolution.x / u_resolution.y, 1.0);
  float t = u_time * 0.25;

  float wave = sin(p.x * 2.1 + t * 2.0 + sin(p.y * 3.0 - t) * 0.8) * 0.5 + 0.5;
  float glow = 0.35 / (0.35 + length(p - m) * length(p - m) * 6.25);
  float band = smoothstep(0.15, 0.95, wave * 0.7 + glow * 0.6 - uv.y * 0.35);

  vec3 colour = mix(u_surface, u_accent, band * 0.85);
  colour = mix(colour, u_ink, smoothstep(0.92, 1.0, band) * 0.12);
  gl_FragColor = vec4(colour, 1.0);
}`;

type Props = { children: ReactNode };

/**
 * The breathing background behind the home hero: the prototype's vignette
 * shader, masked so it fades in and out at the edges of the stage.
 */
export function BreathingStage({ children }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointer = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 });
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false });
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

    const uTime = gl.getUniformLocation(program, 'u_time');
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uPointer = gl.getUniformLocation(program, 'u_pointer');
    const uAccent = gl.getUniformLocation(program, 'u_accent');
    const uSurface = gl.getUniformLocation(program, 'u_surface');
    const uInk = gl.getUniformLocation(program, 'u_ink');

    // read the palette from the page so the shader follows the tokens
    const probe = document.createElement('canvas').getContext('2d');
    const palette = (name: string, fallback: [number, number, number]) => {
      if (!probe) return fallback;
      const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      if (!value) return fallback;
      probe.clearRect(0, 0, 1, 1);
      probe.fillStyle = value;
      probe.fillRect(0, 0, 1, 1);
      const data = probe.getImageData(0, 0, 1, 1).data;
      return [data[0] / 255, data[1] / 255, data[2] / 255] as [number, number, number];
    };
    const accent = palette('--color-accent', [0.784, 0.949, 0.306]);
    const surface = palette('--color-paper', [1, 1, 1]);
    const ink = palette('--color-ink', [0.09, 0.09, 0.09]);
    gl.uniform3fv(uAccent, accent);
    gl.uniform3fv(uSurface, surface);
    gl.uniform3fv(uInk, ink);

    const draw = (time: number) => {
      gl.uniform1f(uTime, time);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uPointer, pointer.current.x, pointer.current.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = () => {
      const ratio = Math.min(devicePixelRatio || 1, 2) * 0.5;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const onMove = (event: PointerEvent) => {
      const box = host.getBoundingClientRect();
      if (!box.width || !box.height) return;
      pointer.current.tx = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
      pointer.current.ty = Math.max(0, Math.min(1, 1 - (event.clientY - box.top) / box.height));
    };

    let frame = 0;
    let last = 0;
    let time = 0;
    const loop = (now: number) => {
      if (!canvas.isConnected) return;
      frame = requestAnimationFrame(loop);
      if (now - last < 1000 / 30 - 2) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      time += dt;
      pointer.current.x += (pointer.current.tx - pointer.current.x) * 0.06;
      pointer.current.y += (pointer.current.ty - pointer.current.y) * 0.06;
      draw(time);
    };

    const ro = new ResizeObserver(() => {
      resize();
      draw(time);
    });
    ro.observe(canvas);
    resize();

    if (reduced) {
      time = 4;
      draw(time);
    } else {
      document.addEventListener('pointermove', onMove, { passive: true });
      frame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      document.removeEventListener('pointermove', onMove);
    };
  }, [reduced]);

  return (
    <div ref={hostRef} className="relative isolate">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent 0, rgba(0,0,0,.5) 96px, #000 240px, #000 calc(100% - 260px), rgba(0,0,0,.5) calc(100% - 120px), transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0, rgba(0,0,0,.5) 96px, #000 240px, #000 calc(100% - 260px), rgba(0,0,0,.5) calc(100% - 120px), transparent 100%)',
        }}
      >
        <canvas ref={canvasRef} aria-hidden className="block h-full w-full" />
      </div>
      {children}
    </div>
  );
}

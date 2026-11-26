import { Bounds } from '../simulation/simulation-options';

/** Float buffer on the GPU together with its CPU-side data. */
export class GLBuffer {
  readonly buffer: WebGLBuffer;
  readonly count: number;

  constructor(
    private readonly gl: WebGLRenderingContext,
    readonly data: Float32Array,
    readonly itemSize: number,
  ) {
    this.buffer = gl.createBuffer();
    this.count = Math.floor(data.length / itemSize);
    this.flush();
  }

  /** Transfers the data to the GPU, needed after each change of `data`. */
  flush() {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}

export function createProgram(gl: WebGLRenderingContext, vertSrc: string, fragSrc: string): WebGLProgram {
  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl, vertSrc, gl.VERTEX_SHADER));
  gl.attachShader(program, compileShader(gl, fragSrc, gl.FRAGMENT_SHADER));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error("Couldn't link shader program");
  }
  return program;
}

function compileShader(gl: WebGLRenderingContext, src: string, type: number): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Couldn't create shader");
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const kind = type == gl.VERTEX_SHADER ? 'vertex' : 'fragment';
    throw new Error(`Couldn't compile ${kind} shader!\n${gl.getShaderInfoLog(shader)}`);
  }
  return shader;
}

/** Column-major orthographic projection matrix (same as gl-matrix mat4.ortho). */
export function orthoMatrix(b: Bounds, near: number, far: number): Float32Array {
  const lr = 1 / (b.xMin - b.xMax);
  const bt = 1 / (b.yMin - b.yMax);
  const nf = 1 / (near - far);
  // prettier-ignore
  return new Float32Array([
    -2 * lr, 0, 0, 0,
    0, -2 * bt, 0, 0,
    0, 0, 2 * nf, 0,
    (b.xMin + b.xMax) * lr, (b.yMax + b.yMin) * bt, (far + near) * nf, 1,
  ]);
}

/**
 * Bounds for an orthographic projection with the aspect ratio of the canvas.
 * The domain is always fully visible and centered.
 */
export function orthographicBounds(canvasW: number, canvasH: number, domain: Bounds): Bounds {
  const domainW = domain.xMax - domain.xMin;
  const domainH = domain.yMax - domain.yMin;
  if (canvasH <= 0 || domainH <= 0) return { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };

  const canvasRatio = canvasW / canvasH;
  const domainRatio = domainW / domainH;
  const xMiddle = (domain.xMax + domain.xMin) / 2;
  const yMiddle = (domain.yMax + domain.yMin) / 2;

  if (canvasRatio > domainRatio) {
    // canvas is wider than the domain
    const halfW = (domainW / 2) * (canvasRatio / domainRatio);
    return { xMin: xMiddle - halfW, xMax: xMiddle + halfW, yMin: domain.yMin, yMax: domain.yMax };
  } else {
    // canvas is higher than the domain
    const halfH = (domainH / 2) * (domainRatio / canvasRatio);
    return { xMin: domain.xMin, xMax: domain.xMax, yMin: yMiddle - halfH, yMax: yMiddle + halfH };
  }
}

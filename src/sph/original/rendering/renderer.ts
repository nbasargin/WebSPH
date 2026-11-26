import { Environment, FluidState } from '../simulation/environment';
import { GRAVITY } from '../simulation/simulation-options';
import { AnalyticalDamBreak } from '../simulation/validation/analytical-dam-break';
import { createProgram, GLBuffer, orthographicBounds, orthoMatrix } from './gl-utils';
import { RendererOptions } from './renderer-options';

const vertexShader = `
  attribute vec3 aVertexPosition;
  attribute vec4 aVertexColor;
  uniform mat4 uPMatrix;
  uniform float uPointSize;
  varying vec4 vColor;

  void main(void) {
    gl_Position = uPMatrix * vec4(aVertexPosition, 1.0);
    vColor = aVertexColor;
    gl_PointSize = uPointSize;
  }
`;

const fragmentShader = `
  precision mediump float;
  varying vec4 vColor;

  void main(void) {
    gl_FragColor = vColor;
  }
`;

const heightSamples = 500;
const validationSamples = 1000;

/** Renders the state of the environment to the canvas: particles, fluid, ground and dam break validation. */
export class Renderer {
  private readonly gl: WebGLRenderingContext;
  private readonly program: WebGLProgram;
  private readonly attrPosition: number;
  private readonly attrColor: number;
  private readonly unifProjection: WebGLUniformLocation | null;

  private readonly particlePos: GLBuffer;
  private readonly particleCol: GLBuffer;
  private readonly waterPos: GLBuffer;
  private readonly waterCol: GLBuffer;
  private readonly groundPos: GLBuffer;
  private readonly groundCol: GLBuffer;
  private readonly validationPos: GLBuffer;
  private readonly validationCol: GLBuffer;

  private drawParticles = true;
  private readonly drawValidationUntil: number;
  private readonly validation = new AnalyticalDamBreak(GRAVITY);

  /** smoothing length used to draw the fluid height, can differ from the simulation */
  visualizationSmoothingLength: number;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly env: Environment,
    options: RendererOptions,
  ) {
    const gl = canvas.getContext('webgl');
    if (!gl) throw new Error('WebGL is not supported');
    this.gl = gl;
    this.visualizationSmoothingLength = options.smoothingLength;
    this.drawValidationUntil = options.drawValidationUntil;

    this.program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(this.program);
    this.attrPosition = gl.getAttribLocation(this.program, 'aVertexPosition');
    this.attrColor = gl.getAttribLocation(this.program, 'aVertexColor');
    this.unifProjection = gl.getUniformLocation(this.program, 'uPMatrix');
    gl.enableVertexAttribArray(this.attrPosition);
    gl.enableVertexAttribArray(this.attrColor);

    const n = env.state.particles.length;
    this.particlePos = new GLBuffer(gl, new Float32Array(n * 2), 2);
    this.particleCol = new GLBuffer(gl, new Float32Array(n * 4), 4);

    // triangle strips: (x, y bottom), (x, y top) for each sample
    const { xMin, xMax, yMin } = env.bounds;
    const sampleX = (i: number, count: number) => xMin + ((xMax - xMin) * i) / (count - 1);
    const waterPos = new Float32Array(heightSamples * 4);
    const groundPos = new Float32Array(heightSamples * 4);
    for (let i = 0; i < heightSamples; i++) {
      const x = sampleX(i, heightSamples);
      waterPos.set([x, env.groundHeight(x), x, 0], i * 4);
      groundPos.set([x, yMin, x, env.groundHeight(x)], i * 4);
    }
    this.waterPos = new GLBuffer(gl, waterPos, 2);
    this.waterCol = new GLBuffer(gl, constantColor(heightSamples * 2, [0, 0, 1, 1]), 4);
    this.groundPos = new GLBuffer(gl, groundPos, 2);
    this.groundCol = new GLBuffer(gl, constantColor(heightSamples * 2, [0, 0, 0, 1]), 4);

    const validationPos = new Float32Array(validationSamples * 2);
    for (let i = 0; i < validationSamples; i++) {
      validationPos[i * 2] = sampleX(i, validationSamples);
    }
    this.validationPos = new GLBuffer(gl, validationPos, 2);
    this.validationCol = new GLBuffer(gl, constantColor(validationSamples, [1, 1, 0, 1]), 4);

    this.setPointSize(options.particleSize);
  }

  /** Particles are hidden for sizes < 1. */
  setPointSize(size: number) {
    this.drawParticles = size >= 1;
    this.gl.uniform1f(this.gl.getUniformLocation(this.program, 'uPointSize'), size);
  }

  render() {
    const gl = this.gl;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    if (this.canvas.width != width) this.canvas.width = width;
    if (this.canvas.height != height) this.canvas.height = height;

    const projection = orthoMatrix(orthographicBounds(width, height, this.env.bounds), -1, 1);
    gl.uniformMatrix4fv(this.unifProjection, false, projection);

    gl.clearColor(0.5, 0.7, 0.9, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // everything is at z = 0: with depth test, elements drawn first stay on top
    if (this.drawParticles) {
      this.updateParticles();
      this.draw(gl.POINTS, this.particlePos, this.particleCol);
    }
    this.updateWater();
    this.draw(gl.TRIANGLE_STRIP, this.waterPos, this.waterCol);
    this.updateGround();
    this.draw(gl.TRIANGLE_STRIP, this.groundPos, this.groundCol);

    if (this.env.state.time <= this.drawValidationUntil) {
      gl.clear(gl.DEPTH_BUFFER_BIT);
      this.updateValidation();
      this.draw(gl.LINE_STRIP, this.validationPos, this.validationCol);
    }
  }

  private draw(mode: number, pos: GLBuffer, col: GLBuffer) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, pos.buffer);
    gl.vertexAttribPointer(this.attrPosition, pos.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, col.buffer);
    gl.vertexAttribPointer(this.attrColor, col.itemSize, gl.FLOAT, false, 0, 0);
    gl.drawArrays(mode, 0, pos.count);
  }

  /** Particles on the fluid surface, colored by speed: red moving right, green moving left. */
  private updateParticles() {
    const particles = this.env.state.particles;
    let maxSpeed = Number.MIN_VALUE;
    let minSpeed = Number.MAX_VALUE;
    for (const p of particles) {
      const speed = Math.abs(p.speedX);
      maxSpeed = Math.max(maxSpeed, speed);
      minSpeed = Math.min(minSpeed, speed);
    }
    const speedDiff = maxSpeed - minSpeed;

    const pos = this.particlePos.data;
    const col = this.particleCol.data;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      pos[i * 2] = p.posX;
      pos[i * 2 + 1] = this.env.fluidHeight(p.posX) + this.env.groundHeight(p.posX);

      const c = speedDiff > 0 ? Math.sqrt((Math.abs(p.speedX) - minSpeed) / speedDiff) : 0;
      col.set(p.speedX > 0 ? [c, 0, 0, 1] : [0, c, 0, 1], i * 4);
    }
    this.particlePos.flush();
    this.particleCol.flush();
  }

  private updateWater() {
    const h = this.visualizationSmoothingLength;
    const env = this.env;
    // ghost particles depend on the smoothing length
    const state: FluidState =
      h == env.smoothingLength ? env.state : { ...env.state, ghosts: env.boundary.ghosts(env.state.particles, h) };
    const pos = this.waterPos.data;
    for (let i = 0; i < heightSamples; i++) {
      const x = pos[i * 4];
      const groundHeight = env.groundHeight(x);
      pos[i * 4 + 1] = groundHeight;
      pos[i * 4 + 3] = groundHeight + env.fluidHeight(x, state, h);
    }
    this.waterPos.flush();
  }

  private updateGround() {
    const pos = this.groundPos.data;
    for (let i = 0; i < heightSamples; i++) {
      pos[i * 4 + 3] = this.env.groundHeight(pos[i * 4]);
    }
    this.groundPos.flush();
  }

  private updateValidation() {
    const t = this.env.state.time;
    const pos = this.validationPos.data;
    for (let i = 0; i < validationSamples; i++) {
      pos[i * 2 + 1] = this.validation.h(pos[i * 2], t);
    }
    this.validationPos.flush();
  }
}

function constantColor(vertices: number, rgba: number[]): Float32Array {
  const data = new Float32Array(vertices * 4);
  for (let i = 0; i < vertices; i++) data.set(rgba, i * 4);
  return data;
}

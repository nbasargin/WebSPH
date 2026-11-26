/** Calls the callback on every animation frame while running, passes the average FPS of the last frames. */
export class RenderLoop {
  private static readonly framesToAverage = 10;

  private running = false;
  private lastFrameStart = 0;
  private frameDurations: number[] = [];

  constructor(private readonly callback: (avgFps: number) => void) {}

  start() {
    if (this.running) return;
    this.running = true;
    this.lastFrameStart = performance.now();
    this.frameDurations = [];
    requestAnimationFrame(() => this.loop());
  }

  stop() {
    this.running = false;
  }

  private loop() {
    if (!this.running) return;
    this.callback(this.avgFps());

    const now = performance.now();
    this.frameDurations.push(now - this.lastFrameStart);
    if (this.frameDurations.length > RenderLoop.framesToAverage) this.frameDurations.shift();
    this.lastFrameStart = now;

    requestAnimationFrame(() => this.loop());
  }

  private avgFps(): number {
    if (this.frameDurations.length == 0) return 0;
    const avgDuration = this.frameDurations.reduce((a, b) => a + b, 0) / this.frameDurations.length;
    return avgDuration == 0 ? 0 : 1000 / avgDuration;
  }
}

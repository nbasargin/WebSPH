import { FrameTiming } from '../util/Timing';

export class RenderLoop2 {


    private static numberOfFramesToAvgFPS = 10;
    private callback: (lastFrameDuration: number, avgFPS: number) => void;
    private timing: FrameTiming;
    private running: boolean;


    public constructor(callback: (lastFrameDuration: number, avgFPS: number) => void) {
        this.callback = callback;
        this.timing = new FrameTiming(RenderLoop2.numberOfFramesToAvgFPS);
        this.running = false;
    }


    public start() {
        if (this.running) {
            console.log('RenderLoop already running!');
            return;
        }

        this.running = true;
        this.timing.reset(RenderLoop2.numberOfFramesToAvgFPS);
        //this.loop();
        window.requestAnimationFrame(() => {
            this.loop()
        });
    }


    private loop() {
        // check if running
        if (!this.running) return;

        // call callback
        this.callback(this.timing.getLastFrameDuration(), this.timing.getAvgFPS());

        // update fps
        this.timing.nextFrame();

        // request next frame
        window.requestAnimationFrame(() => {
            this.loop()
        });

    }


    public stop() {
        this.running = false;
    }

    public isRunning(): boolean {
        return this.running;
    }

}

import {FrameTiming} from "../util/Timing";

/**
 * Render loop will repeatedly call the callback function and update the FPS.
 */
export class RenderLoop {

    private static numberOfFramesToAvgFPS = 10;
    private callback : (dt : number) => void;
    private timing : FrameTiming;
    private fpsElement : HTMLElement;
    private running : boolean;

    public constructor(callback : (dt : number) => void, fpsElm? : HTMLElement) {
        this.callback = callback;
        this.timing = new FrameTiming(RenderLoop.numberOfFramesToAvgFPS);
        this.fpsElement = fpsElm;
        this.running = false;
    }

    public start() {
        if (this.running) {
            console.log("RenderLoop already running!");
            return;
        }

        this.running = true;
        this.timing.reset(RenderLoop.numberOfFramesToAvgFPS);
        this.loop();
    }

    private loop() {
        // check if running
        if (!this.running) {
            if (this.fpsElement) {
                this.fpsElement.innerHTML = "<s>" + this.timing.getAvgFPS().toFixed(1) + "</s>";
            }
            return;
        }

        // is running -> next frame
        this.timing.nextFrame();

        this.callback(this.timing.getLastFrameDuration());
        window.requestAnimationFrame(() => {this.loop()});

        if (this.fpsElement) {
            this.fpsElement.innerText = this.timing.getAvgFPS().toFixed(1);
        }

    }

    public stop() {
        this.running = false;
    }

    public isRunning() : boolean {
        return this.running;
    }


    public getAvgFPS() : number {
    	return this.timing.getAvgFPS();
	}
}

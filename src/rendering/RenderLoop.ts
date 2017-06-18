import {Timing} from "../util/Timing";
import {ShallowWater1D} from "./ShallowWater1D";

export class RenderLoop {

    private static numberOfFramesToAvgFPS = 10;
    private scene : ShallowWater1D;
    private timing : Timing;
    private fpsElement : HTMLElement;
    private running : boolean;

    public constructor(scene : ShallowWater1D, fpsElm? : HTMLElement) {
        this.scene = scene;
        this.timing = new Timing(RenderLoop.numberOfFramesToAvgFPS);
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

        this.scene.update(this.timing.getLastFrameDuration());
        this.scene.render();
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

}
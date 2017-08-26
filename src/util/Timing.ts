import {RingBuffer} from "./RingBuffer";

/**
 * Contains functions to measure frame durations and calculate FPS.
 */
export class FrameTiming {

    private lastFrameStartTime : number;
    private lastFrameDuration : number;
    private framesTotal : number;

    private frameDurations : RingBuffer;

    public constructor(numberOfFramesToAvgFPS : number = 10) {
        this.reset(numberOfFramesToAvgFPS);
    }


    public reset(numberOfFramesToAvgFPS : number = 10) {
        this.lastFrameStartTime = performance.now();
        this.framesTotal = 0;
        this.lastFrameDuration = 0;
        this.frameDurations = new RingBuffer(Math.max(numberOfFramesToAvgFPS, 1));
    }

    public nextFrame() {
        let now = performance.now();
        this.framesTotal++;
        this.lastFrameDuration = now - this.lastFrameStartTime;
        this.lastFrameStartTime = now;
        this.frameDurations.push(this.lastFrameDuration);
    }

    public getLastFrameDuration() : number {
        return this.lastFrameDuration;
    }

    public getAvgFPS() : number {
        let avgDuration = this.frameDurations.avg();
        if (avgDuration == 0) return 0;
        return 1000 / avgDuration;
    }

    public getInstFPS() : number {
        if (this.lastFrameDuration == 0) return 0;
        return 1000 / this.lastFrameDuration;
    }


}

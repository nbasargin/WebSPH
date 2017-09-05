import {GroundProfile} from "./GroundProfile";
import {SmoothingKernel} from "../SmoothingKernel";

export class DynamicSmoothingKernelGround extends GroundProfile {

    private maxScale : number;
    private growSpeed : number;
    private smoothingLength : number;

    public constructor(maxScale : number, growSpeed : number, smoothingLength : number) {
        super();
        this.maxScale = maxScale;
        this.growSpeed = growSpeed;
        this.smoothingLength = smoothingLength;
    }

    public getGroundHeight(x: number, t: number) : number {
        return Math.min(this.maxScale, this.growSpeed * t) * SmoothingKernel.cubic1D(x, this.smoothingLength);
    }

    public getGroundSlope(x: number, t: number) : number {
        return -Math.min(this.maxScale, this.growSpeed * t) * SmoothingKernel.dCubic1D(x, this.smoothingLength);
    }

}

import {Bounds} from "../util/Bounds";

export class Domain implements Bounds {
    xMin : number;
    xMax : number;
    yMin : number;
    yMax : number;


    public constructor(bounds : Bounds) {
        this.xMin = bounds.xMin;
        this.xMax = bounds.xMax;
        this.yMin = bounds.yMin;
        this.yMax = bounds.yMax;
    }









}
import {Bounds} from "../../util/Bounds";

export class GLCanvas {

    private canvas : HTMLCanvasElement;
    public gl : WebGLRenderingContext;

    public constructor(canvas : HTMLCanvasElement) {
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl");
    }

    /**
     * Returns the width of the canvas in pixels.
     * @returns {number}
     */
    public viewWidthPx() {
        return this.canvas.width;
    }

    /**
     * Returns the height of the canvas in pixels.
     * @returns {number}
     */
    public viewHeightPx() {
        return this.canvas.height;
    }


    /**
     * Returns bounds for orthographic projection based on the canvas size.
     * The original square (x 0 to 1; y 0 to 1) is always inside that bounds.
     * If yMore is != 0, the aspect ration will not be 1:1
     */
    public getOrthographicBounds() : Bounds {
        let w = this.viewWidthPx();
        let h = this.viewHeightPx();
        let yMore = 0.5;

        if (0 < h && h < w) {
            let ratio = w / h;
            return { xMin : -(ratio - 1) / 2, xMax : 1 + (ratio - 1) / 2, yMin : 0, yMax : 1 + yMore};
        } else if (0 < w && w < h) {
            let ratio = h / w;
            return { xMin : 0, xMax : 1, yMin : -(ratio - 1) / 2, yMax : 1 + Math.max((ratio - 1) / 2, yMore)};
        } else {
            return { xMin : 0, xMax : 1, yMin : 0, yMax : 1 + yMore};
        }
    }



}
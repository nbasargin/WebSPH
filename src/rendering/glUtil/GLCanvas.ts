import {Bounds} from "../../util/Bounds";

export class GLCanvas {

    private canvas : HTMLCanvasElement;
    public gl : WebGLRenderingContext;

    public constructor(canvas : HTMLCanvasElement) {
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl");
    }

    public updateCanvasDimensions() {
		this.canvas.width = this.viewWidthPx();
		this.canvas.height = this.viewHeightPx();
	}

    /**
     * Returns the width of the canvas in pixels.
     * @returns {number}
     */
    public viewWidthPx() {
        return this.canvas.clientWidth;
    }

    /**
     * Returns the height of the canvas in pixels.
     * @returns {number}
     */
    public viewHeightPx() {
        return this.canvas.clientHeight;
    }


    /**
     * Returns bounds for orthographic projection based on the canvas size.
     * The area defined by domain is always inside that bounds.
     *
	 * @param domain    area defined by domain will be inside the canvas
     */
    public getOrthographicBounds(domain : Bounds) : Bounds {
        let canvasW = this.viewWidthPx();
        let canvasH = this.viewHeightPx();
		let domainW = domain.xMax - domain.xMin;
		let domainH = domain.yMax - domain.yMin;

        if (canvasH <= 0 || domainH <= 0) return {xMin : 0, xMax : 1, yMin : 0, yMax : 1};

        let canvasRatio = canvasW / canvasH;
        let domainRatio = domainW / domainH;
        let xMiddle = (domain.xMax + domain.xMin) / 2;
        let yMiddle = (domain.yMax + domain.yMin) / 2;


        if (canvasRatio > domainRatio) {
        	// canvas is longer (x) than domain
			return {
				xMin : xMiddle - domainW / 2 * (canvasRatio / domainRatio),
				xMax : xMiddle + domainW / 2 * (canvasRatio / domainRatio),
				yMin : domain.yMin,
				yMax : domain.yMax
			};

		} else {
        	// canvas is higher (y) than domain
			return {
				xMin : domain.xMin,
				xMax : domain.xMax,
				yMin : yMiddle - domainH / 2 * (domainRatio / canvasRatio),
				yMax : yMiddle + domainH / 2 * (domainRatio / canvasRatio)
			};
		}


    }

}

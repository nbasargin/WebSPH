import {MatrixStack} from "../util/MatrixStack";
import {GLContext} from "../util/GLContext";
import {mat4} from "gl-matrix";

/**
 * Scene abstraction. Contains basic matrix and perspective/orthographic projection setup.
 */
export abstract class Scene {

    public mvMatrix : MatrixStack;
    public pMatrix : MatrixStack;
    public glContext : GLContext;

    public constructor(glContext : GLContext) {
        this.glContext = glContext;

        this.mvMatrix = new MatrixStack();
        this.pMatrix = new MatrixStack();
    }

    /**
     * Set up perspective projection.
     * @param fovy      field of view (y) in degrees(!)
     * @param near      near clipping distance
     * @param far       far clipping distance
     */
    public setPerspectiveProjection(fovy : number, near : number, far : number) {
        let w = this.glContext.viewWidthPx();
        let h = this.glContext.viewHeightPx();
        if (h != 0) {
            mat4.perspective(this.pMatrix.get(), fovy, w / h, near, far);
        } else {
            mat4.perspective(this.pMatrix.get(), fovy, 1, near, far);
        }
    }

    /**
     * Set up orthographic projection.
     * @param near      near clipping distance
     * @param far       far clipping distance
     */
    public setOrthographicProjection(near : number, far : number) {
        let b = this.getOrthographicBounds();
        mat4.ortho(this.pMatrix.get(), b.xMin, b.xMax, b.yMin, b.yMax, near, far);
    }

    /**
     * Returns bounds for orthographic projection based on the canvas size.
     * The original square (x -1 to 1; y -1 to 1) is always inside that bounds.
     */
    public getOrthographicBounds() : {xMin : number, xMax : number, yMin : number, yMax : number} {
        let w = this.glContext.viewWidthPx();
        let h = this.glContext.viewHeightPx();
        if (h != 0 && w > h) {
            let ratio = w / h;
            return { xMin : -ratio, xMax : ratio, yMin : -1, yMax : 1};
        }else if (w != 0 && h > w) {
            let ratio = h / w;
            return { xMin : -1, xMax : 1, yMin : -ratio, yMax : ratio};
        } else {
            return { xMin : -1, xMax : 1, yMin : -1, yMax : 1};
        }
    }


    /**
     * Update is normally called in the render loop before a new frame is rendered.
     * @param dt    time passed since the last frame
     */
    public abstract update(dt : number) : void;

    /**
     * Renders this scene.
     */
    public abstract render() : void;

}
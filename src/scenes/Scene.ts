import {MatrixStack} from "../util/MatrixStack";
import {GLContext} from "../util/GLContext";
import {mat4} from "gl-matrix";

export abstract class Scene {

    public mvMatrix : MatrixStack;
    public pMatrix : MatrixStack;
    public glContext : GLContext;

    public constructor(glContext : GLContext) {
        this.glContext = glContext;

        this.mvMatrix = new MatrixStack();
        this.pMatrix = new MatrixStack();
    }

    public setPerspectiveProjection(fovy : number, near : number, far : number) {
        let w = this.glContext.viewportWidth;
        let h = this.glContext.viewportHeight;
        if (h != 0) {
            mat4.perspective(this.pMatrix.get(), fovy, w / h, near, far);
        } else {
            mat4.perspective(this.pMatrix.get(), fovy, 1, near, far);
        }
    }

    public setOrthographicProjection(near : number, far : number) {
        let w = this.glContext.viewportWidth;
        let h = this.glContext.viewportHeight;
        if (h != 0 && w > h) {
            let ratio = w / h;
            mat4.ortho(this.pMatrix.get(), -ratio, ratio, -1, 1, near, far);
        }else if (w != 0 && h > w) {
            let ratio = h / w;
            mat4.ortho(this.pMatrix.get(), -1, 1, -ratio, ratio, near, far);
        } else {
            mat4.ortho(this.pMatrix.get(), -1, 1, -1, 1, near, far);
        }
    }



    public abstract update(dt : number) : void;

    public abstract render() : void;

}
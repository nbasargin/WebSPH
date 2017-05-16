import {MatrixStack} from "../util/MatrixStack";
import {GLContext} from "../util/GLContext";

export abstract class Scene {

    public mvMatrix : MatrixStack;
    public pMatrix : MatrixStack;
    public glContext : GLContext;

    public constructor(glContext : GLContext) {
        this.mvMatrix = new MatrixStack();
        this.pMatrix = new MatrixStack();
        this.glContext = glContext;
    }


    public abstract update(dt : number) : void;

    public abstract render() : void;

}
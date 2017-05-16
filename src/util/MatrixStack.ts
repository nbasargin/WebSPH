import {mat4} from "gl-matrix";

export class MatrixStack {

    private matrix : mat4;
    private stack : Array<mat4>;

    public constructor() {
        this.matrix = mat4.create();
        this.stack = [];
    }

    public get() : mat4 {
        return this.matrix;
    }

    public push() {
        let copy = mat4.clone(this.matrix);
        this.stack.push(copy);
    }

    public pop() {
        if (this.stack.length < 1) {
            throw new Error("Matrix stack is empty!");
        }
        this.matrix = this.stack.pop();
    }

    public loadIdentity() {
        mat4.identity(this.matrix);
    }

    public translate3f(x: number, y : number, z : number) {
        mat4.translate(this.matrix, this.matrix, [x,y,z]);
    }

    public translate3fp(vec : Array<number>) {
        mat4.translate(this.matrix, this.matrix, vec);
    }

    public scale3f(x: number, y : number, z : number) {
        mat4.scale(this.matrix, this.matrix, [x,y,z]);
    }

    public scale3fp(vec : Array<number>) {
        mat4.scale(this.matrix, this.matrix, vec);
    }


}
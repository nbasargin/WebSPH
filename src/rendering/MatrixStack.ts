import {mat4} from "gl-matrix";

/**
 * Matrix stack:
 * - contains the actual matrix,
 * - simulates glPushMatrix() and glPopMatrix()
 * - has some utility functions
 */
export class MatrixStack {

    private matrix : mat4;
    private stack : Array<mat4>;

    public constructor() {
        this.matrix = mat4.create();
        this.stack = [];
    }

    /**
     * Get the actual matrix.
     * @returns {mat4}
     */
    public get() : mat4 {
        return this.matrix;
    }

    /**
     * Push a copy of the actual matrix to the stack.
     */
    public push() {
        let copy = mat4.clone(this.matrix);
        this.stack.push(copy);
    }

    /**
     * Pop matrix from the stack, copy values into the actual matrix.
     */
    public pop() {
        if (this.stack.length < 1) {
            throw new Error("Matrix stack is empty!");
        }
        let fromStack = this.stack.pop();
        mat4.copy(this.matrix, fromStack);
    }

    /**
     * Actual matrix becomes the identity matrix.
     */
    public loadIdentity() {
        mat4.identity(this.matrix);
    }

    /**
     * Translates the actual matrix by (x,y,z).
     * @param x
     * @param y
     * @param z
     */
    public translate3f(x: number, y : number, z : number) {
        mat4.translate(this.matrix, this.matrix, [x,y,z]);
    }

    /**
     * Translates the actual matrix by vec = (x,y,z).
     * @param vec
     */
    public translate3fp(vec : Array<number>) {
        mat4.translate(this.matrix, this.matrix, vec);
    }

    /**
     * Scales the actual matrix by  (x,y,z).
     * @param x
     * @param y
     * @param z
     */
    public scale3f(x: number, y : number, z : number) {
        mat4.scale(this.matrix, this.matrix, [x,y,z]);
    }

    /**
     * Scales the actual matrix by vec = (x,y,z).
     * @param vec
     */
    public scale3fp(vec : Array<number>) {
        mat4.scale(this.matrix, this.matrix, vec);
    }


}
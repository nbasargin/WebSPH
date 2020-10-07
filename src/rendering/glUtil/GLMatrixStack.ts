import { mat4 } from 'gl-matrix';
import { Bounds } from '../../util/Bounds';
import { GLCanvas } from './GLCanvas';

/**
 * Matrix stack:
 * - contains the actual matrix,
 * - simulates glPushMatrix() and glPopMatrix()
 * - has some utility functions
 */
export class GLMatrixStack {

    private gl: WebGLRenderingContext;
    private matrixUniform: WebGLUniformLocation;

    private matrix: mat4;
    private stack: Array<mat4>;

    public constructor(gl: WebGLRenderingContext, matrixUniformLoc: WebGLUniformLocation) {
        this.gl = gl;
        this.matrixUniform = matrixUniformLoc;

        this.matrix = mat4.create();
        this.stack = [];
    }

    /**
     * Transfer actual matrix to the GPU.
     */
    public updateUniform() {
        this.gl.uniformMatrix4fv(this.matrixUniform, false, this.matrix);
    }

    /**
     * Get the actual matrix.
     * @returns {mat4}
     */
    public get(): mat4 {
        return this.matrix;
    }

    //region push/pop

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
            throw new Error('Matrix stack is empty!');
        }
        let fromStack = this.stack.pop();
        mat4.copy(this.matrix, fromStack);
    }

    //endregion

    // region identity, scale, translate

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
    public translate3f(x: number, y: number, z: number) {
        mat4.translate(this.matrix, this.matrix, [x, y, z]);
    }

    /**
     * Translates the actual matrix by vec = (x,y,z).
     * @param vec
     */
    public translate3fp(vec: Array<number>) {
        mat4.translate(this.matrix, this.matrix, vec);
    }

    /**
     * Scales the actual matrix by  (x,y,z).
     * @param x
     * @param y
     * @param z
     */
    public scale3f(x: number, y: number, z: number) {
        mat4.scale(this.matrix, this.matrix, [x, y, z]);
    }

    /**
     * Scales the actual matrix by vec = (x,y,z).
     * @param vec
     */
    public scale3fp(vec: Array<number>) {
        mat4.scale(this.matrix, this.matrix, vec);
    }

    //endregion

    //region projection

    /**
     * Set up perspective projection.
     * @param glCanvas
     * @param fovy      field of view (y) in degrees(!)
     * @param near      near clipping distance
     * @param far       far clipping distance
     */
    public setPerspectiveProjection(glCanvas: GLCanvas, fovy: number, near: number, far: number) {
        let w = glCanvas.viewWidthPx();
        let h = glCanvas.viewHeightPx();
        if (h != 0) {
            mat4.perspective(this.matrix, fovy, w / h, near, far);
        } else {
            mat4.perspective(this.matrix, fovy, 1, near, far);
        }
    }

    /**
     * Set up orthographic projection.
     * @param glCanvas
     * @param domain    area defined by domain will be inside the canvas
     * @param near      near clipping distance
     * @param far       far clipping distance
     */
    public setOrthographicProjection(glCanvas: GLCanvas, domain: Bounds, near: number, far: number) {
        let b = glCanvas.getOrthographicBounds(domain);
        mat4.ortho(this.matrix, b.xMin, b.xMax, b.yMin, b.yMax, near, far);
    }

    //endregion

}

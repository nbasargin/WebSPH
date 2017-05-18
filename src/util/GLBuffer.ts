/**
 * Wrapper for WebGLBuffer.
 * Contains information about item size and number of items.
 */
export class GLBuffer {

    private gl : WebGLRenderingContext;
    public buffer : WebGLBuffer;
    public itemSize : number;
    public numItems : number;

    /**
     * Construct a buffer that stored float values
     * @param gl            handle to WebGLRenderingContext
     * @param vertices      Float32Array with new vertices
     * @param itemSize      number of array elements that define one vertex
     */
    public constructor(gl : WebGLRenderingContext, vertices : Float32Array, itemSize : number = 3) {
        this.gl = gl;
        this.buffer = gl.createBuffer();
        this.updateData(vertices, itemSize);
    }

    /**
     * Updates vertices stored in this buffer.
     * @param vertices      Float32Array with new vertices
     * @param itemSize      number of array elements that define one vertex
     */
    public updateData(vertices : Float32Array, itemSize : number = 3) {
        let gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        this.itemSize = itemSize;
        this.numItems = Math.floor(vertices.length / itemSize);
        gl.bindBuffer(gl.ARRAY_BUFFER, null); // unbind the buffer

    }


}
/**
 * Wrapper for WebGLBuffer.
 * Contains information about item size and number of items.
 */
export class GLBuffer {

    private gl : WebGLRenderingContext;
    public buffer : WebGLBuffer;
    private data : Float32Array;
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
        this.setData(vertices, itemSize);
    }

    /**
     * Updates vertices stored in this buffer.
     * New data will be flushed to the GPU.
     * @param vertices      Float32Array with new vertices
     * @param itemSize      number of array elements that define one vertex
     */
    public setData(vertices : Float32Array, itemSize : number = 3) {
        this.data = vertices;
        this.itemSize = itemSize;
        this.numItems = Math.floor(vertices.length / itemSize);
        this.flushData();

    }

    /**
     * Get data of this buffer.
     * @returns {Float32Array}
     */
    public getData() : Float32Array {
        return this.data;
    }

    /**
     * Transfer data of this buffer to the GPU.
     *
     * This does not happen automatically when changing values
     * in the array returned by "getData()". If that array
     * was changed, call this function!
     */
    public flushData() {
        let gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null); // unbind the buffer
    }




}
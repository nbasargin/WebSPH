export class GLBuffer {

    public buffer : WebGLBuffer;
    public itemSize : number;
    public numItems : number;

    public constructor(gl : WebGLRenderingContext, vertices : Array<number>, itemSize : number = 3) {
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.itemSize = itemSize;
        this.numItems = Math.floor(vertices.length / itemSize);
        gl.bindBuffer(gl.ARRAY_BUFFER, null); // unbind the buffer
    }


}
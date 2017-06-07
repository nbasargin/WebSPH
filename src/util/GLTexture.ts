export class GLTexture {

    public image : HTMLImageElement;
    public gl : WebGLRenderingContext;

    public constructor(gl : WebGLRenderingContext) {
        this.gl = gl;

    }

}
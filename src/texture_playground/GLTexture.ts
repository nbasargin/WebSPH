export class GLTexture {

    public image : HTMLImageElement;
    public texture : WebGLTexture;
    public gl : WebGLRenderingContext;

    public constructor(gl : WebGLRenderingContext) {
        this.gl = gl;
        this.texture = gl.createTexture();
    }

    public setImage(path : string) {
        this.image = new Image();
        this.image.onload = this.imageLoaded;
        this.image.src = path;
    }

    private imageLoaded() {
        let gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

}
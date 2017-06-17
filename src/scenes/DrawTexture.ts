import {GLContext} from "../rendering/GLContext";
import {GLTexture} from "./GLTexture";
import {GLBuffer} from "../rendering2/GLBuffer";

export class DrawTexture {

    // texture
    private image = require("../../textures/nehe.gif");
    private neheTexture : GLTexture;

    // buffers
    private quadVertPosBuffer : GLBuffer;
    private quadTexPosBuffer : GLBuffer;

    public constructor(glContext : GLContext) {
        // shaders
        // TODO

        // matrices TODO

        // buffers
        let quadPos = [
            -1.0, -1.0,  1.0,
            1.0, -1.0,  1.0,
            1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0
        ];
        this.quadVertPosBuffer = new GLBuffer(glContext.gl, new Float32Array(quadPos), 3);

        let texPos = [
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
        ];
        this.quadTexPosBuffer = new GLBuffer(glContext.gl, new Float32Array(texPos), 2);

        // textures
        this.neheTexture = new GLTexture(glContext.gl);
        this.neheTexture.setImage(this.image);

    }

    public update(dt: number): void {

    }

    public render(): void {
        // TODO
    }

}
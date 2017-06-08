import {Scene} from "./Scene";
import {GLContext} from "../util/GLContext";
import {GLTexture} from "../util/GLTexture";
import {GLBuffer} from "../util/GLBuffer";

export class DrawTexture extends Scene {

    // texture
    private image = require("../../textures/nehe.gif");
    private neheTexture : GLTexture;

    // buffers
    private quadVertPosBuffer : GLBuffer;
    private quadTexPosBuffer : GLBuffer;

    public constructor(glContext : GLContext) {
        super(glContext);

        // shaders
        // TODO

        // buffers
        let quadPos = [
            -1.0, -1.0,  1.0,
            1.0, -1.0,  1.0,
            1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0
        ];
        this.quadVertPosBuffer = new GLBuffer(this.glContext.gl, new Float32Array(quadPos), 3);

        let texPos = [
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
        ];
        this.quadTexPosBuffer = new GLBuffer(this.glContext.gl, new Float32Array(texPos), 2);

        // textures
        this.neheTexture = new GLTexture(this.glContext.gl);
        this.neheTexture.setImage(this.image);

    }

    public update(dt: number): void {
        this.setOrthographicProjection(-1, 1);
    }

    public render(): void {
        // TODO
    }

}
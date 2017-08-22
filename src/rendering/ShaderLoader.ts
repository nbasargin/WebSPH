/**
 * Loads shaders from separate files.
 */
export class ShaderLoader {

    public static getDummyColorFragShader() {
        return `
			precision mediump float;

			varying vec4 vColor;
			
			void main(void) {
				gl_FragColor = vColor;
			}
		`;
    }

    public static getDummyColorVertShader() {
        return `
			attribute vec3 aVertexPosition;
			attribute vec4 aVertexColor;
			
			uniform mat4 uMVMatrix;
			uniform mat4 uPMatrix;
			uniform float uPointSize;
			
			varying vec4 vColor;
			
			void main(void) {
				gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
				vColor = aVertexColor;
				gl_PointSize = uPointSize;
			}
		`;
    }
}

/**
 * Loads shaders from separate files.
 */
export class ShaderLoader {

    private static dummy_color_frag_shader = require("../../shader/dummy_color_frag_shader.frag");
    private static dummy_color_vert_shader = require("../../shader/dummy_color_vert_shader.vert");

    public static getDummyColorFragShader() {
        return ShaderLoader.dummy_color_frag_shader;
    }

    public static getDummyColorVertShader() {
        return ShaderLoader.dummy_color_vert_shader;
    }
}
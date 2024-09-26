class WaveShaderPipeline extends Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline {
    constructor(game) {
        super({
            game: game,
            renderer: game.renderer,
            fragShader: `
                precision mediump float;
                uniform float uTime;
                varying vec2 vTexCoord;
                void main(void) {
                    vec2 uv = vTexCoord;
                    uv.y += sin(uv.x * 10.0 + uTime) * 0.1;
                    gl_FragColor = vec4(uv, 0.5 + 0.5 * sin(uTime), 1.0);
                }
            `
        });
    }
}

export default WaveShaderPipeline;


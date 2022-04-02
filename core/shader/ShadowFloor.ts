import { IWebGLRenderingContext } from "../interface";
import Matrix from "../math/Matrix";
import Shader from "./Shader";

export default class ShadowFloor {
    gl: IWebGLRenderingContext;
    desc: any;
    lightCount: any;
    shadowCount: any;
    nativeDepth: any;
    shader: Shader;
    quadGeom: any;
    constructor(gl: IWebGLRenderingContext, c, b, d) {
        this.gl = gl;
        this.desc = c;
        this.lightCount = d.count;
        this.shadowCount = b.shadowCount;
        c = this.nativeDepth ? ["#define SHADOW_NATIVE_DEPTH"] : [];
        c.push("#define LIGHT_COUNT " + this.lightCount);
        c.push("#define SHADOW_COUNT " + this.shadowCount);
        this.gl.hints.mobile && c.push("#define MOBILE");
        this.shader = this.gl.shaderCache.fromURLs("shadowfloorvert.glsl", "shadowfloorfrag.glsl", c) as Shader;
        c = new Float32Array([-1, 0, -1, -1, 0, 1, 1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0, -1]);
        this.quadGeom = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadGeom);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, c, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null)
    }
    draw(a) {
        var c = a.view
            , b = a.lights
            , d = a.shadow
            , params = this.shader.params
            , g = this.shader.samplers;
        this.shader.bind();
        c = Matrix.mul(Matrix.empty(), c.projectionMatrix, c.viewMatrix);
        Matrix.mul(c, c, this.desc.transform);
        this.gl.uniformMatrix4fv(params.uModelViewProjectionMatrix, false, c);
        c = Matrix.mul(Matrix.empty(), b.matrix, this.desc.transform);
        this.gl.uniformMatrix4fv(params.uModelSkyMatrix, false, c);
        0 < b.count && (this.gl.uniform4fv(params.uLightPositions, b.positionBuffer),
            this.gl.uniform3fv(params.uLightDirections, b.directionBuffer),
            this.gl.uniform3fv(params.uLightColors, b.colors),
            this.gl.uniform3fv(params.uLightParams, b.parameters),
            this.gl.uniform3fv(params.uLightSpot, b.spot),
            a = 0.392699 * a.postRender.currentSample(),
            this.gl.uniform2f(params.uShadowKernelRotation, 0.5 * Math.cos(a), 0.5 * Math.sin(a)),
            0 < b.shadowCount && (a = d.depthTextures[0].desc.width,
                this.gl.uniform2f(params.uShadowMapSize, a, 1 / a),
                this.gl.uniformMatrix4fv(params.uShadowMatrices, false, b.finalTransformBuffer),
                this.gl.uniformMatrix4fv(params.uInvShadowMatrices, false, b.inverseTransformBuffer),
                this.gl.uniform4fv(params.uShadowTexelPadProjections, b.shadowTexelPadProjections),
                d.bindDepthTexture(g.tDepth0, 0),
                d.bindDepthTexture(g.tDepth1, 1),
                d.bindDepthTexture(g.tDepth2, 2)));
        this.gl.uniform3f(params.uShadowCatcherParams, this.desc.simple ? 1 : 0, this.desc.alpha, this.desc.edgeFade);
        this.gl.depthMask(false);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.ZERO, this.gl.SRC_COLOR);
        b = this.shader.attribs.vPosition;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadGeom);
        this.gl.enableVertexAttribArray(b);
        this.gl.vertexAttribPointer(b, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        this.gl.disableVertexAttribArray(b);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.disable(this.gl.BLEND);
        this.gl.depthMask(true)
    }

    complete() {
        return this.shader.complete()
    }

}
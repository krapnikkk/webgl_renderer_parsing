import { IWebGLRenderingContext } from "./interface";
import Matrix from "./math/Matrix";
import Vect from "./math/Vector";
import Scene from "./scene/Scene";
import Shader from "./shader/Shader";

export default class Fog{
    desc: any;
    gl: IWebGLRenderingContext;
    iblShader: Shader;
    dirShader: Shader;
    dirShaderShadow: any;
    spotShader: Shader;
    spotShaderShadow: any;
    omniShaderShadow: any;
    omniShader: Shader;
    fullscreenTriangle: any;
    constructor(gl:IWebGLRenderingContext, c) {
        this.desc = c;
        this.gl = gl;
        this.iblShader = this.gl.shaderCache.fromURLs("fogvert.glsl", "fogfrag.glsl", ["#define FOG_IBL"]);
        var b = c.newAttenuation ? "#define NEW_ATTENUATION" : ""
            , d = [b, "#define FOG_DIR"];
        this.dirShader = this.gl.shaderCache.fromURLs("fogvert.glsl", "fogfrag.glsl", d);
        d.push("#define FOG_SHADOWS");
        this.dirShaderShadow = this.gl.shaderCache.fromURLs("fogvert.glsl", "fogfrag.glsl", d);
        d = [b, "#define FOG_SPOT"];
        this.spotShader = this.gl.shaderCache.fromURLs("fogvert.glsl", "fogfrag.glsl", d);
        d.push("#define FOG_SHADOWS");
        this.spotShaderShadow = this.gl.shaderCache.fromURLs("fogvert.glsl", "fogfrag.glsl", d);
        d = [b, "#define FOG_OMNI"];
        this.omniShaderShadow = this.omniShader = this.gl.shaderCache.fromURLs("fogvert.glsl", "fogfrag.glsl", d);
        this.fullscreenTriangle = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.fullscreenTriangle);
        let data = new Float32Array([0, 0, 2, 0, 0, 2]);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null)
    }

    draw(scene:Scene, c) {
        var view = scene.view
            , e = view.projectionMatrix
            , f = Matrix.empty();
        Matrix.mul(f, view.viewMatrix, view.projectionMatrix);
        Matrix.invert(f, view.viewProjectionMatrix);
        f = [e[10] + e[11], -e[14], -2 * e[11]];
        e = [-2 / e[0], -2 / e[5], (1 - e[8]) / e[0], (1 - e[9]) / e[5]];
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
        for (var g = 0; g < scene.lights.count + 1; ++g) {
            var h = g - 1, k = h < scene.lights.shadowCount, n;
            n = 0 == g ? this.iblShader : 0 < scene.lights.spot[3 * h] ? k ? this.spotShaderShadow : this.spotShader : 0 < scene.lights.getLightPos(h)[3] ? this.omniShader : k ? this.dirShaderShadow : this.dirShader;
            n.bind();
            var m = n.params;
            this.gl.uniform3fv(m.uDepthToZ, f);
            this.gl.uniform4fv(m.uUnproject, e);
            this.gl.uniformMatrix4fv(m.uInvViewMatrix, false, view.transform);
            this.gl.uniform1f(m.uFogInvDistance, 1 / this.desc.distance);
            this.gl.uniform1f(m.uFogOpacity, this.desc.opacity * (1 - scene.stripData.activeFade()));
            this.gl.uniform1f(m.uFogDispersion, 1 - this.desc.dispersion);
            var l = [0, 0, 0];
            l[this.desc.type] = 1;
            this.gl.uniform3fv(m.uFogType, l);
            this.gl.uniform3fv(m.uFogColor, this.desc.color);
            this.gl.uniform1f(m.uFogIllum, 0 == g ? this.desc.skyIllum : this.desc.lightIllum);
            this.gl.uniformMatrix4fv(m.uLightMatrix, false, scene.lights.invMatrix);
            if (0 == g) {
                h = new Float32Array(scene.sky.diffuseCoefficients);
                for (k = 4; 16 > k; ++k)
                    h[k] *= 1 - this.desc.dispersion;
                for (k = 16; 36 > k; ++k)
                    h[k] *= 1 - this.desc.dispersion * this.desc.dispersion;
                this.gl.uniform4fv(m.uFogLightSphere, h)
            } else {
                var p = scene.lights.getLightPos(h)
                    , p = Matrix.mul4(Vect.empty(), scene.lights.invMatrix, p[0], p[1], p[2], p[3])
                    , l = scene.lights.getLightDir(h)
                    , l = Matrix.mulVec(Vect.empty(), scene.lights.invMatrix, l[0], l[1], l[2]);
                this.gl.uniform4fv(m.uLightPosition, p);
                this.gl.uniform3fv(m.uLightColor, scene.lights.getColor(h));
                var p = 0.01745329251 * scene.lights.spot[3 * h]
                    , r = Math.cos(0.5 * p);
                this.gl.uniform4fv(m.uSpotParams, [-l[0], -l[1], -l[2], 0 < p ? r * r : 0]);
                this.gl.uniform4fv(m.uLightAttenuation, [scene.lights.parameters[3 * h + 0], scene.lights.parameters[3 * h + 1], scene.lights.parameters[3 * h + 2], r]);
                k && (k = Matrix.mul(Matrix.empty(), scene.lights.finalTransformBuffer.subarray(16 * h), scene.lights.matrix),
                    this.gl.uniformMatrix4fv(m.uShadowProj, false, k),
                    scene.shadow.depthTextures[h].bind(n.samplers.uShadowMap),
                    h = 0,
                    1 < scene.postRender.sampleCount && (h = scene.postRender.currentSample() / scene.postRender.sampleCount),
                    this.gl.uniform1f(m.uDitherOffset, h),
                    this.gl.uniform3fv(m.uAABBMin, scene.bounds.min),
                    this.gl.uniform3fv(m.uAABBMax, scene.bounds.max),
                    h = Vect.lerp(Vect.empty(), scene.bounds.min, scene.bounds.max, 0.5),
                    k = Vect.distance(h, scene.bounds.min),
                    this.gl.uniform4f(m.uCylinder, h[0], h[1], h[2], k * k))
            }
            c.bind(n.samplers.tDepth);
            n = n.attribs.vCoord;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.fullscreenTriangle);
            this.gl.enableVertexAttribArray(n);
            this.gl.vertexAttribPointer(n, 2, this.gl.FLOAT, false, 0, 0);
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
            this.gl.disableVertexAttribArray(n);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null)
        }
        this.gl.disable(this.gl.BLEND)
    }
    complete() {
        return this.iblShader.complete() && this.dirShader.complete() && this.dirShaderShadow.complete() && this.spotShader.complete() && this.spotShaderShadow.complete() && this.omniShader.complete() && this.omniShaderShadow.complete()
    }
}

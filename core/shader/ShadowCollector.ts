import Framebuffer from "../Framebuffer";
import { IFramebufferOptions, IWebGLRenderingContext } from "../interface";
import Matrix from "../math/Matrix";
import Texture from "../Texture";

export default class ShadowCollector{
    gl: IWebGLRenderingContext;
    shadowCount: any;
    nativeDepth: boolean;
    desc: { width: number; height: number; clamp: boolean; mipmap: boolean; nofilter: boolean; };
    shaderSolid: any;
    shaderAlphaTest: any;
    depthTextures: any[];
    depthTargets: any[];
    constructor(gl:IWebGLRenderingContext, c) {
        this.gl = gl;
        this.shadowCount = c;
        this.nativeDepth = !!this.gl.ext.textureDepth;
        let defineArr = this.nativeDepth ? ["#define SHADOW_NATIVE_DEPTH"] : [];
        this.shaderSolid = this.gl.shaderCache.fromURLs("shadowvert.glsl", "shadowfrag.glsl", defineArr);
        defineArr.push("#define ALPHA_TEST 1");
        this.shaderAlphaTest = this.gl.shaderCache.fromURLs("shadowvert.glsl", "shadowfrag.glsl", defineArr);
        this.depthTextures = [];
        this.depthTargets = [];
        if (0 < this.shadowCount) {
            var b = {
                width: 2048,
                height: 2048,
                clamp: true,
                mipmap: false,
                nofilter: true
            };
            this.gl.hints.mobile && (b.width = b.height = 1536);
            var d:IFramebufferOptions = {
                width: b.width,
                height: b.height
            }, e, f;
            this.nativeDepth ? (e = this.gl.DEPTH_COMPONENT,
                f = this.gl.UNSIGNED_SHORT) : (d.depthBuffer = Framebuffer.createDepthBuffer(this.gl, b.width, b.height),
                    e = this.gl.RGB,
                    f = this.gl.UNSIGNED_BYTE);
            for (var g = 0; g < this.shadowCount; ++g)
                this.depthTextures[g] = new Texture(this.gl, b),
                    this.depthTextures[g].loadArray(null, e, f),
                    this.nativeDepth ? d.depth = this.depthTextures[g] : d.color0 = this.depthTextures[g],
                    this.depthTargets[g] = new Framebuffer(this.gl, d)
        }
    }
    bindDepthTexture(a, c) {
        this.shadowCount > c && this.depthTextures[c].bind(a)
    }
        ;
    collect(a, c) {
        for (var b = this.gl, d = a.lights, e = d.shadowCount, f = d.modelViewBuffer, g = d.projectionBuffer, h = d.matrix, k = 0 != a.sceneAnimator, n = Matrix.empty(), m = false, l = 0; l < e; ++l)
            if (d.shadowsNeedUpdate[l]) {
                d.shadowsNeedUpdate[l] = 0;
                m = true;
                Matrix.mul(n, f.subarray(16 * l, 16 * (l + 1)), h);
                Matrix.mul(n, g.subarray(16 * l, 16 * (l + 1)), n);
                this.depthTargets[l].bind();
                b.clearColor(1, 1, 1, 1);
                b.clear(b.COLOR_BUFFER_BIT | b.DEPTH_BUFFER_BIT);
                var p = this.shaderSolid;
                p.bind();
                b.uniformMatrix4fv(p.params.uViewProjection, false, n);
                b.uniformMatrix4fv(p.params.uMeshTransform, false, Matrix.identity());
                for (var r = 0; r < a.meshRenderables.length; ++r) {
                    var s = a.meshRenderables[r]
                        , u = s.material;
                    !s.mesh.desc.castShadows || !u.castShadows || 0 < u.shadowAlphaTest || (k && b.uniformMatrix4fv(p.params.uMeshTransform, false, s.mesh.displayMatrix),
                        s.drawShadow(p.attribs.vPosition))
                }
                p = this.shaderAlphaTest;
                p.bind();
                b.uniformMatrix4fv(p.params.uViewProjection, false, n);
                b.uniformMatrix4fv(p.params.uMeshTransform, false, Matrix.identity());
                for (r = 0; r < a.meshRenderables.length; ++r)
                    s = a.meshRenderables[r],
                        u = s.material,
                        s.mesh.desc.castShadows && u.castShadows && 0 < u.shadowAlphaTest && (u.textures.albedo.bind(p.samplers.tAlbedo),
                            k && (b.uniform2f(p.params.uUVOffset, u.uOffset, u.vOffset),
                                b.uniformMatrix4fv(p.params.uMeshTransform, false, s.mesh.displayMatrix)),
                            s.drawAlphaShadow(p.attribs.vPosition, p.attribs.vTexCoord))
            }
        m && (c.bind(),
            b.enable(b.CULL_FACE),
            b.cullFace(b.BACK))
    }
        ;
    complete() {
        return this.shaderSolid.complete() && this.shaderAlphaTest.complete()
    }
        ;
}


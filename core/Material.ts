import { IAnisoParams, IExtrasTexCoordRanges, IMaterialDesc, IMicrofiberParams, IRefractionParams, IskinParams, ITextureDesc, IWebGLRenderingContext } from "./interface";
import Matrix from "./math/Matrix";
import Vect from "./math/Vector";
import Texture from "./Texture";
import Archive from "./utils/Archive";

export default class Material {
    gl: IWebGLRenderingContext;
    name: string;
    textures: { albedo: any; reflectivity: any; normal: any; extras: any; };
    extrasTexCoordRanges: IExtrasTexCoordRanges = {};
    blend: any;
    alphaTest: number;
    usesBlending: boolean;
    usesRefraction: boolean;
    shadowAlphaTest: any;
    castShadows: boolean;
    horizonOcclude: any;
    fresnel: Float32Array;
    emissiveIntensity: number;
    skinParams: IskinParams;
    anisoParams: IAnisoParams;
    microfiberParams: IMicrofiberParams;
    refractionParams: IRefractionParams;
    horizonSmoothing: any;
    vOffset: number;
    uOffset: number;
    shader: any;
    stripShader: any;
    wireShader: any;
    prepassShader: any;
    refractionShader: any;
    constructor(gl: IWebGLRenderingContext, archive: Archive, b: IMaterialDesc) {
        this.gl = gl;
        this.name = b.name;
        var d = {
            mipmap: true,
            aniso: this.gl.hints.mobile ? 0 : 4,
            clamp: !!b.textureWrapClamp,
            mirror: !!b.textureWrapMirror
        }
            , e: ITextureDesc = {
                mipmap: d.mipmap,
                clamp: d.clamp,
                mirror: d.mirror,
                nofilter: b.textureFilterNearest || false
            };
        e.nofilter || (e.aniso = this.gl.hints.mobile ? 2 : 4);
        this.textures = {
            albedo: this.gl.textureCache.fromFilesMergeAlpha(archive.get(b.albedoTex), archive.get(b.alphaTex), e),
            reflectivity: this.gl.textureCache.fromFilesMergeAlpha(archive.get(b.reflectivityTex), archive.get(b.glossTex), d),
            normal: this.gl.textureCache.fromFile(archive.get(b.normalTex), d),
            extras: this.gl.textureCache.fromFilesMergeAlpha(archive.get(b.extrasTex), archive.get(b.extrasTexA), d)
        };
        this.extrasTexCoordRanges = {};
        if (b.extrasTexCoordRanges) {
            for (var f in b.extrasTexCoordRanges) {
                this.extrasTexCoordRanges[f] = new Float32Array(b.extrasTexCoordRanges[f].scaleBias);
            }
        }
        let extrasTex: Texture;
        this.textures.extras || (extrasTex = new Texture(this.gl, {
            width: 1,
            height: 1
        }),
            extrasTex.loadArray(new Uint8Array([255, 255, 255, 255])),
            this.textures.extras = extrasTex);
        var g = b.blendTint || [1, 1, 1];
        let blend = {
            none: function () {
                this.gl.disable(this.gl.BLEND)
            },
            alpha: function () {
                this.gl.enable(this.gl.BLEND);
                this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE_MINUS_DST_ALPHA, this.gl.ONE)
            },
            add: function () {
                this.gl.enable(this.gl.BLEND);
                this.gl.blendColor(g[0], g[1], g[2], 1);
                this.gl.blendFunc(this.gl.ONE, this.gl.CONSTANT_COLOR)
            }
        };
        this.blend = blend[b.blend] || blend.none;
        this.alphaTest = b.alphaTest || 0;
        this.usesBlending = this.blend !== blend.none;
        this.usesRefraction = !!b.refraction;
        this.shadowAlphaTest = this.alphaTest;
        0 >= this.shadowAlphaTest && this.blend === blend.alpha && (this.shadowAlphaTest = 0.5);
        this.castShadows = this.blend !== blend.add;
        this.horizonOcclude = b.horizonOcclude || 0;
        this.fresnel = new Float32Array(b.fresnel ? b.fresnel : [1, 1, 1]);
        this.emissiveIntensity = b.emissiveIntensity || 1;
        let defines = [];
        let flag = false;
        0 < b.lightCount && defines.push("#define LIGHT_COUNT " + b.lightCount);
        b.useNewAttenuation && defines.push("#define NEW_ATTENUATION");
        if(0 < b.shadowCount){
            let min = Math.min(b.lightCount, b.shadowCount);
            if(this.usesRefraction && 8 >= this.gl.limits.textureCount) {
                min = 2 < min ? 2 : min
            }
            defines.push("#define SHADOW_COUNT " + min);
        };
        0 < b.alphaTest && defines.push("#define ALPHA_TEST");
        b.ggxSpecular && defines.push("#define GGX_SPECULAR");
        this.blend === blend.alpha ? defines.push("#define TRANSPARENCY_DITHER") : this.blend === blend.none && defines.push("#define NOBLEND");
        this.gl.hints.mobile && defines.push("#define MOBILE");
        this.gl.ext.textureDepth && defines.push("#define SHADOW_NATIVE_DEPTH");
        let transIntegral = function (a) {
            return 1 / (2 / 3 * 3.1415962 * (a * a + a + 1))
        }
            ;
        b.useSkin && (defines.push("#define SKIN"),
            this.skinParams = b.skinParams || {
                subdermisColor: [1, 1, 1],
                transColor: [1, 0, 0, 1],
                fresnelColor: [0.2, 0.2, 0.2, 0.5],
                fresnelOcc: 1,
                fresnelGlossMask: 1,
                transSky: 0.5,
                shadowBlur: 0.5,
                normalSmooth: 0.5,
                transScatter: 0,
                transDepth: 0,
                millimeterScale: 1
            },
            this.extrasTexCoordRanges.subdermisTex || defines.push("#define SKIN_NO_SUBDERMIS_TEX"),
            this.extrasTexCoordRanges.translucencyTex || defines.push("#define SKIN_NO_TRANSLUCENCY_TEX"),
            this.extrasTexCoordRanges.fuzzTex || defines.push("#define SKIN_NO_FUZZ_TEX"),
            void 0 === this.skinParams.version && (this.skinParams.version = 1),
            2 == this.skinParams.version ? (defines.push("#define SKIN_VERSION_2"),
                this.skinParams.shadowBlur *= 4,
                this.skinParams.shadowBlur = Math.min(this.skinParams.shadowBlur, 40),
                this.skinParams.transIntegral = transIntegral(0.5 * this.skinParams.transScatter),
                this.skinParams.fresnelIntegral = 1 / 3.14159 * (1 - 0.5 * this.skinParams.fresnelColor[3]),
                this.skinParams.transSky = 0) : (defines.push("#define SKIN_VERSION_1"),
                    this.skinParams.shadowBlur = 8 * Math.min(this.skinParams.shadowBlur, 1),
                    this.skinParams.transDepth = 0,
                    this.skinParams.transScatter = this.skinParams.transColor[3],
                    this.skinParams.transIntegral = 1 / 3.14159 * (1 - 0.5 * this.skinParams.transScatter),
                    this.skinParams.fresnelIntegral = 1 / 3.14159 * (1 - 0.5 * this.skinParams.fresnelColor[3]),
                    this.skinParams.transSky *= 1.25,
                    this.skinParams.transIntegral *= 1.25));
        b.aniso && (defines.push("#define ANISO"),
            this.anisoParams = b.anisoParams || {
                strength: 1,
                tangent: [1, 0, 0],
                integral: 0.5
            },
            this.extrasTexCoordRanges.anisoTex || defines.push("#define ANISO_NO_DIR_TEX"));
        b.microfiber && (defines.push("#define MICROFIBER"),
            this.microfiberParams = b.microfiberParams || {
                fresnelColor: [0.2, 0.2, 0.2, 0.5],
                fresnelOcc: 1,
                fresnelGlossMask: 1
            },
            this.microfiberParams.fresnelIntegral = 1 / 3.14159 * (1 - 0.5 * this.microfiberParams.fresnelColor[3]),
            this.extrasTexCoordRanges.fuzzTex || defines.push("#define MICROFIBER_NO_FUZZ_TEX"));
        b.refraction && (defines.push("#define REFRACTION"),
            this.refractionParams = b.refractionParams || {
                distantBackground: false,
                tint: [1, 1, 1],
                useAlbedoTint: false,
                IOR: 1.5
            },
            this.extrasTexCoordRanges.refractionMaskTex || defines.push("#define REFRACTION_NO_MASK_TEX"));
        b.vertexColor && (defines.push("#define VERTEX_COLOR"),
            b.vertexColorsRGB && defines.push("#define VERTEX_COLOR_SRGB"),
            b.vertexColorAlpha && defines.push("#define VERTEX_COLOR_ALPHA"));
        this.horizonSmoothing = b.horizonSmoothing || 0;
        0 < this.horizonSmoothing && defines.push("#define HORIZON_SMOOTHING");
        b.unlitDiffuse && defines.push("#define DIFFUSE_UNLIT");
        this.extrasTexCoordRanges.emissiveTex && (defines.push("#define EMISSIVE"),
            b.emissiveSecondaryUV && (defines.push("#define EMISSIVE_SECONDARY_UV"),
                flag = true));
        this.extrasTexCoordRanges.aoTex && (defines.push("#define AMBIENT_OCCLUSION"),
            b.aoSecondaryUV && (defines.push("#define AMBIENT_OCCLUSION_SECONDARY_UV"),
                flag = true));
        b.tangentOrthogonalize && defines.push("#define TSPACE_ORTHOGONALIZE");
        b.tangentNormalize && defines.push("#define TSPACE_RENORMALIZE");
        b.tangentGenerateBitangent && defines.push("#define TSPACE_COMPUTE_BITANGENT");
        flag && defines.push("#define TEXCOORD_SECONDARY");
        this.vOffset = this.uOffset = 0;
        defines.push("#define UV_OFFSET ");
        this.shader = this.gl.shaderCache.fromURLs("matvert.glsl", "matfrag.glsl", defines);
        defines.push("#define STRIPVIEW");
        this.stripShader = this.gl.shaderCache.fromURLs("matvert.glsl", "matfrag.glsl", defines);
        this.wireShader = this.gl.shaderCache.fromURLs("wirevert.glsl", "wirefrag.glsl");
        this.blend === blend.alpha && (this.prepassShader = this.gl.shaderCache.fromURLs("alphaprepassvert.glsl", "alphaprepassfrag.glsl"))
    }
    bind(a, c) {
        if (!this.complete())
            return false;
        var b = a.view, d = a.lights, e = a.sky, f = a.shadow, g = a.stripData.active() ? this.stripShader : this.shader, h = this.skinParams, k = this.anisoParams, n = this.microfiberParams, m, l = this.gl, p = g.params, r = this.textures, s = g.samplers;
        g.bind();
        this.blend();
        var u = c.mesh.displayMatrix
            , q = Matrix.mul(Matrix.empty(), b.viewMatrix, u)
            , x = Matrix.mul(Matrix.empty(), b.projectionMatrix, b.viewMatrix)
            , q = Matrix.mul(Matrix.empty(), b.projectionMatrix, q)
            , u = Matrix.mul(Matrix.empty(), d.matrix, u);
        l.uniformMatrix4fv(p.uModelViewProjectionMatrix, false, q);
        l.uniformMatrix4fv(p.uSkyMatrix, false, u);
        u = Matrix.mulPoint(Vect.empty(), d.matrix, b.transform[12], b.transform[13], b.transform[14]);
        l.uniform3f(p.uCameraPosition, u[0], u[1], u[2]);
        l.uniform3fv(p.uFresnel, this.fresnel);
        l.uniform1f(p.uAlphaTest, this.alphaTest);
        l.uniform1f(p.uHorizonOcclude, this.horizonOcclude);
        l.uniform1f(p.uHorizonSmoothing, this.horizonSmoothing);
        l.uniform4fv(p.uDiffuseCoefficients, e.diffuseCoefficients);
        0 < d.count && (l.uniform4fv(p.uLightPositions, d.positionBuffer),
            l.uniform3fv(p.uLightDirections, d.directionBuffer),
            l.uniform3fv(p.uLightColors, d.colors),
            d.useNewAttenuation || l.uniform3fv(p.uLightParams, d.parameters),
            l.uniform3fv(p.uLightSpot, d.spot),
            u = 0.392699 * a.postRender.currentSample(),
            l.uniform2f(p.uShadowKernelRotation, 0.5 * Math.cos(u), 0.5 * Math.sin(u)),
            0 < d.shadowCount && (u = f.depthTextures[0].desc.width,
                l.uniform2f(p.uShadowMapSize, u, 1 / u),
                l.uniformMatrix4fv(p.uShadowMatrices, false, d.finalTransformBuffer),
                l.uniformMatrix4fv(p.uInvShadowMatrices, false, d.inverseTransformBuffer),
                l.uniform4fv(p.uShadowTexelPadProjections, d.shadowTexelPadProjections),
                f.bindDepthTexture(s.tDepth0, 0),
                f.bindDepthTexture(s.tDepth1, 1),
                f.bindDepthTexture(s.tDepth2, 2)));
        h && (l.uniform3fv(p.uSubdermisColor, h.subdermisColor),
            l.uniform4fv(p.uTransColor, h.transColor),
            l.uniform1f(p.uTransScatter, h.transScatter),
            l.uniform4fv(p.uFresnelColor, h.fresnelColor),
            l.uniform1f(p.uFresnelOcc, h.fresnelOcc),
            l.uniform1f(p.uFresnelGlossMask, h.fresnelGlossMask),
            l.uniform1f(p.uFresnelIntegral, h.fresnelIntegral),
            l.uniform1f(p.uTransIntegral, h.transIntegral),
            l.uniform1f(p.uSkinTransDepth, h.transDepth),
            l.uniform1f(p.uTransSky, h.transSky),
            l.uniform1f(p.uSkinShadowBlur, h.shadowBlur),
            l.uniform1f(p.uNormalSmooth, h.normalSmooth),
            (m = this.extrasTexCoordRanges.subdermisTex) && l.uniform4fv(p.uTexRangeSubdermis, m),
            (m = this.extrasTexCoordRanges.translucencyTex) && l.uniform4fv(p.uTexRangeTranslucency, m),
            (m = this.extrasTexCoordRanges.fuzzTex) && l.uniform4fv(p.uTexRangeFuzz, m));
        n && (l.uniform4fv(p.uFresnelColor, n.fresnelColor),
            l.uniform1f(p.uFresnelOcc, n.fresnelOcc),
            l.uniform1f(p.uFresnelGlossMask, n.fresnelGlossMask),
            l.uniform1f(p.uFresnelIntegral, n.fresnelIntegral),
            (m = this.extrasTexCoordRanges.fuzzTex) && l.uniform4fv(p.uTexRangeFuzz, m));
        k && (l.uniform3fv(p.uAnisoTangent, k.tangent),
            l.uniform1f(p.uAnisoStrength, k.strength),
            l.uniform1f(p.uAnisoIntegral, k.integral),
            (m = this.extrasTexCoordRanges.anisoTex) && l.uniform4fv(p.uTexRangeAniso, m));
        this.usesRefraction && (a.refractionSurface && a.refractionSurface.bind(s.tRefraction),
            d = Matrix.mul(Matrix.empty(), x, d.invMatrix),
            l.uniformMatrix4fv(p.uRefractionViewProjection, false, d),
            this.refractionParams.newRefraction ? (d = 0.8 * c.mesh.bounds.averageExtent,
                f = this.refractionParams.IOR - 1,
                l.uniform1f(p.uRefractionRayDistance, d * (0 < f ? f : 0))) : l.uniform1f(p.uRefractionRayDistance, this.refractionParams.distantBackground ? 1E10 : 4 * c.mesh.bounds.maxExtent),
            l.uniform3fv(p.uRefractionTint, this.refractionParams.tint),
            l.uniform1f(p.uRefractionAlbedoTint, this.refractionParams.useAlbedoTint ? 1 : 0),
            l.uniform1f(p.uRefractionIOREntry, 1 / this.refractionParams.IOR),
            (m = this.extrasTexCoordRanges.refractionMaskTex) && l.uniform4fv(p.uTexRangeRefraction, m));
        if (m = this.extrasTexCoordRanges.emissiveTex)
            l.uniform4fv(p.uTexRangeEmissive, m),
                l.uniform1f(p.uEmissiveScale, this.emissiveIntensity);
        (m = this.extrasTexCoordRanges.aoTex) && l.uniform4fv(p.uTexRangeAO, m);
        r.albedo.bind(s.tAlbedo);
        r.reflectivity.bind(s.tReflectivity);
        r.normal.bind(s.tNormal);
        r.extras.bind(s.tExtras);
        e.specularTexture.bind(s.tSkySpecular);
        g === this.stripShader && (l.uniform1fv(p.uStrips, a.stripData.strips),
            l.uniform2f(p.uStripRes, 2 / b.size[0], 2 / b.size[1]));
        l.uniform2f(p.uUVOffset, this.uOffset, this.vOffset);
        return true
    }
    bindAlphaPrepass(a, c) {
        if (!this.complete() || !this.prepassShader)
            return false;
        var b = this.gl
            , d = this.prepassShader.params
            , e = this.prepassShader.samplers;
        this.prepassShader.bind();
        var f = Matrix.mul(Matrix.empty(), a.view.viewMatrix, c.mesh.displayMatrix)
            , f = Matrix.mul(Matrix.empty(), a.view.projectionMatrix, f);
        b.uniformMatrix4fv(d.uModelViewProjectionMatrix, false, f);
        b.uniform2f(d.uUVOffset, this.uOffset, this.vOffset);
        this.textures.albedo.bind(e.tAlbedo);
        return true
    }
    bindWire(a, c) {
        if (!this.complete())
            return false;
        var b = this.gl
            , d = this.wireShader.params
            , e = a.view;
        b.enable(b.BLEND);
        b.blendFunc(b.SRC_ALPHA, b.ONE_MINUS_SRC_ALPHA);
        b.depthMask(false);
        this.wireShader.bind();
        var f = Matrix.mul(Matrix.empty(), a.view.viewMatrix, c.mesh.displayMatrix)
            , f = Matrix.mul(Matrix.empty(), a.view.projectionMatrix, f);
        b.uniformMatrix4fv(d.uModelViewProjectionMatrix, false, f);
        b.uniform4f(d.uStripParams, 2 / e.size[0], 2 / e.size[1], a.stripData.strips[3], a.stripData.strips[4]);
        return true
    }
    complete() {
        return this.wireShader.complete() && this.shader.complete() && this.stripShader.complete() && (!this.prepassShader || this.prepassShader.complete()) && (!this.refractionShader || this.refractionShader.complete()) && this.textures.albedo.complete() && this.textures.reflectivity.complete() && this.textures.normal.complete()
    }
}


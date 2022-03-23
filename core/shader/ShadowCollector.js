function ShadowCollector(a, c) {
    this.gl = a;
    this.shadowCount = c;
    this.nativeDepth = !!a.ext.textureDepth;
    this.desc = b;
    b = this.nativeDepth ? ["#define SHADOW_NATIVE_DEPTH"] : [];
    this.shaderSolid = a.shaderCache.fromURLs("shadowvert.glsl", "shadowfrag.glsl", b);
    b.push("#define ALPHA_TEST 1");
    this.shaderAlphaTest = a.shaderCache.fromURLs("shadowvert.glsl", "shadowfrag.glsl", b);
    this.depthTextures = [];
    this.depthTargets = [];
    if (0 < this.shadowCount) {
        var b = {
            width: 2048,
            height: 2048,
            clamp: !0,
            mipmap: !1,
            nofilter: !0
        };
        a.hints.mobile && (b.width = b.height = 1536);
        var d = {
            width: b.width,
            height: b.height
        }, e, f;
        this.nativeDepth ? (e = a.DEPTH_COMPONENT,
            f = a.UNSIGNED_SHORT) : (d.depthBuffer = Framebuffer.createDepthBuffer(a, b.width, b.height),
                e = a.RGB,
                f = a.UNSIGNED_BYTE);
        for (var g = 0; g < this.shadowCount; ++g)
            this.depthTextures[g] = new Texture(a, b),
                this.depthTextures[g].loadArray(null, e, f),
                this.nativeDepth ? d.depth = this.depthTextures[g] : d.color0 = this.depthTextures[g],
                this.depthTargets[g] = new Framebuffer(a, d)
    }
}
ShadowCollector.prototype.bindDepthTexture = function (a, c) {
    this.shadowCount > c && this.depthTextures[c].bind(a)
}
    ;
ShadowCollector.prototype.collect = function (a, c) {
    for (var b = this.gl, d = a.lights, e = d.shadowCount, f = d.modelViewBuffer, g = d.projectionBuffer, h = d.matrix, k = 0 != a.sceneAnimator, n = Matrix.empty(), m = !1, l = 0; l < e; ++l)
        if (d.shadowsNeedUpdate[l]) {
            d.shadowsNeedUpdate[l] = 0;
            m = !0;
            Matrix.mul(n, f.subarray(16 * l, 16 * (l + 1)), h);
            Matrix.mul(n, g.subarray(16 * l, 16 * (l + 1)), n);
            this.depthTargets[l].bind();
            b.clearColor(1, 1, 1, 1);
            b.clear(b.COLOR_BUFFER_BIT | b.DEPTH_BUFFER_BIT);
            var p = this.shaderSolid;
            p.bind();
            b.uniformMatrix4fv(p.params.uViewProjection, !1, n);
            b.uniformMatrix4fv(p.params.uMeshTransform, !1, Matrix.identity());
            for (var r = 0; r < a.meshRenderables.length; ++r) {
                var s = a.meshRenderables[r]
                    , u = s.material;
                !s.mesh.desc.castShadows || !u.castShadows || 0 < u.shadowAlphaTest || (k && b.uniformMatrix4fv(p.params.uMeshTransform, !1, s.mesh.displayMatrix),
                    s.drawShadow(p.attribs.vPosition))
            }
            p = this.shaderAlphaTest;
            p.bind();
            b.uniformMatrix4fv(p.params.uViewProjection, !1, n);
            b.uniformMatrix4fv(p.params.uMeshTransform, !1, Matrix.identity());
            for (r = 0; r < a.meshRenderables.length; ++r)
                s = a.meshRenderables[r],
                    u = s.material,
                    s.mesh.desc.castShadows && u.castShadows && 0 < u.shadowAlphaTest && (u.textures.albedo.bind(p.samplers.tAlbedo),
                        k && (b.uniform2f(p.params.uUVOffset, u.uOffset, u.vOffset),
                            b.uniformMatrix4fv(p.params.uMeshTransform, !1, s.mesh.displayMatrix)),
                        s.drawAlphaShadow(p.attribs.vPosition, p.attribs.vTexCoord))
        }
    m && (c.bind(),
        b.enable(b.CULL_FACE),
        b.cullFace(b.BACK))
}
    ;
ShadowCollector.prototype.complete = function () {
    return this.shaderSolid.complete() && this.shaderAlphaTest.complete()
}
    ;
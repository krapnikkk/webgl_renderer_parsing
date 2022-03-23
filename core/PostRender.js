function PostRender(a, c, b) {
    this.gl = a;
    this.desc = c;
    c = [];
    0 != this.desc.sharpen && c.push("#define SHARPEN");
    (this.useBloom = 0 < this.desc.bloomColor[0] * this.desc.bloomColor[3] || 0 < this.desc.bloomColor[1] * this.desc.bloomColor[3] || 0 < this.desc.bloomColor[2] * this.desc.bloomColor[3]) && c.push("#define BLOOM");
    0 != this.desc.vignette[3] && c.push("#define VIGNETTE");
    1 == this.desc.saturation[0] * this.desc.saturation[3] && 1 == this.desc.saturation[1] * this.desc.saturation[3] && 1 == this.desc.saturation[2] * this.desc.saturation[3] || c.push("#define SATURATION");
    1 == this.desc.contrast[0] * this.desc.contrast[3] && 1 == this.desc.contrast[1] * this.desc.contrast[3] && 1 == this.desc.contrast[2] * this.desc.contrast[3] && 1 == this.desc.brightness[0] * this.desc.brightness[3] && 1 == this.desc.brightness[1] * this.desc.brightness[3] && 1 == this.desc.brightness[2] * this.desc.brightness[3] || c.push("#define CONTRAST");
    0 != this.desc.grain && c.push("#define GRAIN");
    1 == this.desc.toneMap ? c.push("#define REINHARD") : 2 == this.desc.toneMap ? c.push("#define HEJL") : 3 == this.desc.toneMap && c.push("#define ACES");
    this.desc.colorLUT && c.push("#define COLOR_LUT");
    this.sampleIndex = 0;
    this.sampleCount = 1;
    b && (this.sampleCount = 4,
        this.sampleOffsets = [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]);
    this.aaShader = a.shaderCache.fromURLs("postvert.glsl", "postaa.glsl");
    this.shader = a.shaderCache.fromURLs("postvert.glsl", "postfrag.glsl", c);
    this.plainShader = a.shaderCache.fromURLs("postvert.glsl", "postfrag.glsl", []);
    this.fullscreenTriangle = a.createBuffer();
    a.bindBuffer(a.ARRAY_BUFFER, this.fullscreenTriangle);
    b = new Float32Array([0, 0, 2, 0, 0, 2]);
    a.bufferData(a.ARRAY_BUFFER, b, a.STATIC_DRAW);
    a.bindBuffer(a.ARRAY_BUFFER, null);
    if (this.useBloom) {
        this.bloomTextures = [];
        this.bloomTargets = [];
        for (b = 0; 2 > b; ++b)
            c = {
                width: 256,
                height: 256,
                clamp: !0
            },
                this.bloomTextures[b] = new Texture(a, c),
                this.bloomTextures[b].loadArray(null, a.RGBA, a.ext.textureHalf && a.ext.textureHalfLinear ? a.ext.textureHalf.HALF_FLOAT_OES : a.UNSIGNED_BYTE),
                this.bloomTargets[b] = new Framebuffer(a, {
                    width: c.width,
                    height: c.height,
                    color0: this.bloomTextures[b]
                });
        for (this.bloomSamples = 64; this.bloomSamples + 16 >= a.limits.fragmentUniforms;)
            this.bloomSamples /= 2;
        this.bloomShader = a.shaderCache.fromURLs("postvert.glsl", "bloom.glsl", ["#define BLOOM_SAMPLES " + this.bloomSamples]);
        this.shrinkShader = a.shaderCache.fromURLs("postvert.glsl", "bloomshrink.glsl")
    }
    a = new Uint8Array(16384);
    for (b = 0; 16384 > b; b++) {
        c = 255 * Math.random();
        var d = 255 * Math.random();
        a[b] = 0.5 * (c + d)
    }
    this.noiseTexture = new Texture(this.gl, {
        width: 128,
        height: 128
    });
    this.noiseTexture.loadArray(a, this.gl.LUMINANCE);
    this.desc.colorLUT && (a = this.desc.colorLUT,
        this.colorLUT = new Texture(this.gl, {
            width: a.length / 3 | 0,
            height: 1,
            clamp: !0
        }),
        this.colorLUT.loadArray(new Uint8Array(a), this.gl.RGB));
    this.blackTexture = new Texture(this.gl, {
        width: 1,
        height: 1
    });
    this.blackTexture.loadArray(new Uint8Array([0, 0, 0, 0]));
    this.bloomResult = this.blackTexture
}
PostRender.prototype.prepareBloom = function (a) {
    if (this.useBloom && this.bloomShader.complete() && this.shrinkShader.complete()) {
        this.shrinkShader.bind();
        this.bloomTargets[1].bind();
        a.bind(this.shrinkShader.samplers.tInput);
        this.fillScreen(this.shrinkShader.attribs.vCoord);
        this.bloomShader.bind();
        var c = [];
        this.bloomTargets[0].bind();
        this.bloomTextures[1].bind(this.bloomShader.samplers.tInput);
        for (var b = 0, d = 0; d < this.bloomSamples; ++d) {
            var e = -1 + 2 * d / (this.bloomSamples - 1), f;
            f = 4 * e;
            f = Math.exp(-0.5 * f * f / 1) / 2.50662827463;
            b += f;
            c[4 * d + 0] = e * this.desc.bloomSize;
            c[4 * d + 1] = 0;
            c[4 * d + 2] = f;
            c[4 * d + 3] = 0
        }
        for (d = 0; d < this.bloomSamples; ++d)
            c[4 * d + 2] /= b;
        this.gl.uniform4fv(this.bloomShader.params.uKernel, c);
        this.fillScreen(this.bloomShader.attribs.vCoord);
        this.bloomTargets[1].bind();
        this.bloomTextures[0].bind(this.bloomShader.samplers.tInput);
        for (d = 0; d < this.bloomSamples; ++d)
            b = c[4 * d + 0],
                b *= a.desc.width / a.desc.height,
                c[4 * d + 0] = 0,
                c[4 * d + 1] = b;
        this.gl.uniform4fv(this.bloomShader.params.uKernel, c);
        this.fillScreen(this.bloomShader.attribs.vCoord);
        this.bloomResult = this.bloomTextures[1]
    } else
        this.bloomResult = this.blackTexture
}
    ;
PostRender.prototype.computeParams = function (a, c) {
    var b = this.desc
        , d = {};
    d.scale = [b.contrast[0] * b.contrast[3], b.contrast[1] * b.contrast[3], b.contrast[2] * b.contrast[3]];
    d.bias = [b.bias[0] * b.bias[3], b.bias[1] * b.bias[3], b.bias[2] * b.bias[3]];
    d.bias = [-d.bias[0] * d.scale[0] + d.bias[0], -d.bias[1] * d.scale[1] + d.bias[1], -d.bias[2] * d.scale[2] + d.bias[2]];
    var e = [b.brightness[0] * b.brightness[3], b.brightness[1] * b.brightness[3], b.brightness[2] * b.brightness[3]];
    d.scale = [d.scale[0] * e[0], d.scale[1] * e[1], d.scale[2] * e[2]];
    d.bias = [d.bias[0] * e[0], d.bias[1] * e[1], d.bias[2] * e[2]];
    d.saturation = [b.saturation[0] * b.saturation[3], b.saturation[1] * b.saturation[3], b.saturation[2] * b.saturation[3]];
    d.bloomColor = [b.bloomColor[0] * b.bloomColor[3], b.bloomColor[1] * b.bloomColor[3], b.bloomColor[2] * b.bloomColor[3]];
    d.sharpen = [b.sharpen, 0.25 * b.sharpen, b.sharpenLimit];
    d.sharpenKernel = [1 / a, 0, 0, 1 / c];
    e = a > c ? a : c;
    d.vignetteAspect = [a / e, c / e, 0.5 * a / e, 0.5 * c / e];
    d.vignette = [2 * (1 - b.vignette[0]) * b.vignette[3], 2 * (1 - b.vignette[1]) * b.vignette[3], 2 * (1 - b.vignette[2]) * b.vignette[3], b.vignetteCurve];
    var e = 1 / this.noiseTexture.desc.width
        , f = 1 / this.noiseTexture.desc.height
        , g = 1 - b.grainSharpness;
    d.grainCoord = [e * a, f * c, 0.5 * g * e, 0.5 * g * f];
    d.grainScaleBias = [2 * b.grain, -b.grain];
    return d
}
    ;
PostRender.prototype.present = function (a, c, b, d) {
    d || this.prepareBloom(a);
    1 < this.sampleCount && this.allocAABuffer(c, b);
    d = d ? this.plainShader : this.shader;
    if (d.bind()) {
        var e = this.gl
            , f = d.samplers
            , g = d.params
            , h = this.computeParams(c, b);
        a.bind(f.tInput);
        this.bloomResult.bind(f.tBloom);
        this.noiseTexture.bind(f.tGrain);
        this.colorLUT && this.colorLUT.bind(f.tLUT);
        e.uniform3fv(g.uScale, h.scale);
        e.uniform3fv(g.uBias, h.bias);
        e.uniform3fv(g.uSaturation, h.saturation);
        e.uniform4fv(g.uSharpenKernel, h.sharpenKernel);
        e.uniform3fv(g.uSharpness, h.sharpen);
        e.uniform3fv(g.uBloomColor, h.bloomColor);
        e.uniform4fv(g.uVignetteAspect, h.vignetteAspect);
        e.uniform4fv(g.uVignette, h.vignette);
        e.uniform4fv(g.uGrainCoord, h.grainCoord);
        e.uniform2fv(g.uGrainScaleBias, h.grainScaleBias);
        if (a = 1 < this.sampleCount && 0 <= this.sampleIndex) {
            var k = 1 / (1 + this.sampleIndex);
            this.sampleIndex += 1;
            1 > k && (e.enable(e.BLEND),
                e.blendColor(k, k, k, k),
                e.blendFunc(e.CONSTANT_ALPHA, e.ONE_MINUS_CONSTANT_ALPHA));
            this.aaTarget.bind()
        } else
            Framebuffer.bindNone(e),
                1 < this.sampleCount && (this.sampleIndex += 1);
        e.viewport(0, 0, c, b);
        this.fillScreen(d.attribs.vCoord);
        a && (1 > k && e.disable(e.BLEND),
            Framebuffer.bindNone(e),
            this.aaShader.bind(),
            this.aaBuffer.bind(this.aaShader.samplers.tInput),
            this.fillScreen(this.aaShader.attribs.vCoord))
    }
}
    ;
PostRender.prototype.allocAABuffer = function (a, c) {
    this.aaBuffer && this.aaBuffer.desc.width == a && this.aaBuffer.desc.height == c || (this.aaBuffer && this.aaBuffer.destroy(),
        this.aaBuffer = new Texture(this.gl, {
            width: a,
            height: c,
            clamp: !0
        }),
        this.aaBuffer.loadArray(),
        this.aaTarget = new Framebuffer(this.gl, {
            color0: this.aaBuffer,
            ignoreStatus: !0
        }))
}
    ;
PostRender.prototype.adjustProjectionForSupersampling = function (a) {
    if (1 < this.sampleCount) {
        var c = this.currentSample()
            , b = this.sampleOffsets[c][0] / a.size[0]
            , c = this.sampleOffsets[c][1] / a.size[1]
            , b = Matrix.translation(Matrix.empty(), b, c, 0);
        Matrix.mul(a.projectionMatrix, b, a.projectionMatrix)
    }
}
    ;
PostRender.prototype.discardAAHistory = function () {
    this.sampleIndex = -1
}
    ;
PostRender.prototype.currentSample = function () {
    return (0 > this.sampleIndex ? 0 : this.sampleIndex) % this.sampleCount
}
    ;
PostRender.prototype.fillScreen = function (a) {
    var c = this.gl;
    c.bindBuffer(c.ARRAY_BUFFER, this.fullscreenTriangle);
    c.enableVertexAttribArray(a);
    c.vertexAttribPointer(a, 2, c.FLOAT, !1, 0, 0);
    c.drawArrays(c.TRIANGLES, 0, 3);
    c.disableVertexAttribArray(a);
    c.bindBuffer(c.ARRAY_BUFFER, null)
}
    ;
PostRender.prototype.blitTexture = function (a) {
    this.aaShader.bind();
    a.bind(this.aaShader.samplers.tInput);
    this.fillScreen(this.aaShader.attribs.vCoord)
}
    ;
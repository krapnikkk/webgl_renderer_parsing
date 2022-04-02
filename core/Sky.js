function Sky(a, c, b) {
    this.gl = a;
    var d = c.extract("sky.dat") || c.extract("sky.png");
    if (void 0 !== d) {
        this.specularTexture = new Texture(a, {
            width: 256,
            height: 2048,
            clamp: true
        });
        c = d.data;
        for (var d = d.data.length, e = d / 4, f = new Uint8Array(d), g = 0, h = 0; g < d; ++h)
            f[g++] = c[h + 2 * e],
                f[g++] = c[h + e],
                f[g++] = c[h],
                f[g++] = c[h + 3 * e];
        this.specularTexture.loadArray(f)
    }
    this.diffuseCoefficients = new Float32Array(b.diffuseCoefficients);
    this.backgroundMode = b.backgroundMode || 0;
    this.backgroundBrightness = b.backgroundBrightness || 1;
    this.backgroundColor = new Float32Array(b.backgroundColor);
    if (1 <= this.backgroundMode)
        if (this.backgroundShader = a.shaderCache.fromURLs("skyvert.glsl", 3 == this.backgroundMode ? "skySH.glsl" : "sky.glsl", ["#define SKYMODE " + this.backgroundMode]),
            this.vertexBuffer = a.createBuffer(),
            a.bindBuffer(a.ARRAY_BUFFER, this.vertexBuffer),
            b = 1 / 256,
            c = 0.5 / 256,
            d = 2.8 * c,
            e = 0.5 * c,
            b = new Float32Array([0, 1, 0, 0.49609375 + b, 0.49609375 + b, 1, 0, 0, 0.9921875 + b, 0.49609375 + b, 0, 0, 1, 0.49609375 + b, 0.9921875 + b, -1, 0, 0, 0 + b, 0.49609375 + b, 0, 0, -1, 0.49609375 + b, 0 + b, 0, -1, 0, 0.9921875 + b, 0 + b, 0, -1, 0, 0.9921875 + b, 0.9921875 + b, 0, -1, 0, 0 + b, 0.9921875 + b, 0, -1, 0, 0 + b, 0 + b, d, 1 - d, -d, 0.5 + c, 0.5 - c, d, 1 - d, d, 0.5 + c, 0.5 + c, -d, 1 - d, d, 0.5 - c, 0.5 + c, -d, 1 - d, -d, 0.5 - c, 0.5 - c, -d, 0, -1 + d, 0.5 - c, 0 + b + c, d, 0, -1 + d, 0.5 + c, 0 + b + c, 1 - d, 0, -d, 0.9921875 + b - c, 0.5 - c, 1 - d, 0, d, 0.9921875 + b - c, 0.5 + c, d, 0, 1 - d, 0.5 + c, 0.9921875 + b - c, -d, 0, 1 - d, 0.5 - c, 0.9921875 + b - c, -1 + d, 0, d, 0 + b + c, 0.5 + c, -1 + d, 0, -d, 0 + b + c, 0.5 - c, 1, 0, 0, 0.9921875 + b - e, 0.49609375 + b, 0, 0, 1, 0.49609375 + b, 0.9921875 + b - e, -1, 0, 0, 0 + b + e, 0.49609375 + b, 0, 0, -1, 0.49609375 + b, 0 + b + e, 0, 1, 0, 0.49609375 + b - e, 0.49609375 + b, 0, 1, 0, 0.49609375 + b, 0.49609375 + b - e, 0, 1, 0, 0.49609375 + b + e, 0.49609375 + b, 0, 1, 0, 0.49609375 + b, 0.49609375 + b + e]),
            a.bufferData(a.ARRAY_BUFFER, b, a.STATIC_DRAW),
            a.bindBuffer(a.ARRAY_BUFFER, null),
            this.indexBuffer = a.createBuffer(),
            a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, this.indexBuffer),
            b = new Uint16Array([2, 1, 6, 3, 2, 7, 8, 4, 3, 4, 5, 1, 9, 14, 15, 17, 10, 16, 18, 19, 11, 20, 13, 12, 28, 12, 13, 13, 24, 28, 28, 24, 9, 9, 24, 14, 25, 9, 15, 25, 15, 21, 10, 25, 21, 10, 21, 16, 22, 26, 10, 22, 10, 17, 18, 11, 26, 22, 18, 26, 19, 23, 27, 19, 27, 11, 23, 20, 27, 27, 20, 12]),
            this.skyIndexCount = b.length,
            a.bufferData(a.ELEMENT_ARRAY_BUFFER, b, a.STATIC_DRAW),
            a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, null),
            3 == this.backgroundMode)
            for (this.backgroundCoefficients = new Float32Array(this.diffuseCoefficients),
                g = 0; g < this.backgroundCoefficients.length; ++g)
                this.backgroundCoefficients[g] *= this.backgroundBrightness;
        else {
            this.backgroundTexture = new Texture(a, {
                width: 256,
                height: 256,
                clamp: true
            });
            b = false;
            var k;
            a.ext.textureHalf && a.ext.textureHalfLinear && (this.backgroundTexture.loadArray(null, a.RGB, a.ext.textureHalf.HALF_FLOAT_OES),
                k = new Framebuffer(a, {
                    color0: this.backgroundTexture
                }),
                b = k.valid);
            !b && a.ext.textureFloat && a.ext.textureFloatLinear && !a.hints.mobile && (this.backgroundTexture.loadArray(null, a.RGB, a.FLOAT),
                k = new Framebuffer(a, {
                    color0: this.backgroundTexture
                }),
                b = k.valid);
            b || (this.backgroundTexture.loadArray(),
                k = new Framebuffer(a, {
                    color0: this.backgroundTexture
                }));
            k.bind();
            k = new Shader(a);
            k.build("precision highp float; varying vec2 tc; attribute vec4 p; void main(){ gl_Position=p; tc=vec2(0.5,0.5/8.0)*p.xy+vec2(0.5,6.5/8.0); }", "precision highp float; varying vec2 tc; uniform sampler2D tex; uniform float b; void main(){vec4 s=texture2D(tex,tc); gl_FragColor.xyz=s.xyz*(b*s.w);}");
            k.bind();
            a.uniform1f(k.params.b, 7 * Math.sqrt(this.backgroundBrightness));
            this.specularTexture.bind(k.samplers.tex);
            b = a.createBuffer();
            a.bindBuffer(a.ARRAY_BUFFER, b);
            b = new Float32Array([-1, -1, 0.5, 1, 3, -1, 0.5, 1, -1, 3, 0.5, 1]);
            a.bufferData(a.ARRAY_BUFFER, b, a.STATIC_DRAW);
            a.enableVertexAttribArray(k.attribs.p);
            a.vertexAttribPointer(k.attribs.p, 4, a.FLOAT, false, 0, 0);
            a.drawArrays(a.TRIANGLES, 0, 3);
            a.disableVertexAttribArray(k.attribs.p)
        }
}
Sky.prototype.setClearColor = function () {
    if (marmoset.transparentBackground)
        this.gl.clearColor(0, 0, 0, 0);
    else if (1 > this.backgroundMode) {
        var a = this.backgroundColor;
        this.gl.clearColor(a[0], a[1], a[2], 1)
    } else
        this.gl.clearColor(0.0582, 0.06772, 0.07805, 1)
}
    ;
Sky.prototype.draw = function (a) {
    if (1 > this.backgroundMode || marmoset.transparentBackground)
        return false;
    if (this.complete()) {
        var c = this.gl
            , b = this.backgroundShader
            , d = a.view
            , e = a.lights.invMatrix;
        b.bind();
        c.uniformMatrix4fv(b.params.uInverseSkyMatrix, false, e);
        c.uniformMatrix4fv(b.params.uViewProjection, false, d.viewProjectionMatrix);
        3 == this.backgroundMode ? c.uniform4fv(b.params.uSkyCoefficients, this.backgroundCoefficients) : this.backgroundTexture.bind(b.samplers.tSkyTexture);
        a = 0.07 + 0.94 * (1 - a.stripData.activeFade());
        c.uniform1f(b.params.uAlpha, a);
        c.bindBuffer(c.ARRAY_BUFFER, this.vertexBuffer);
        c.enableVertexAttribArray(b.attribs.vPosition);
        c.vertexAttribPointer(b.attribs.vPosition, 3, c.FLOAT, false, 20, 0);
        c.enableVertexAttribArray(b.attribs.vTexCoord);
        c.vertexAttribPointer(b.attribs.vTexCoord, 2, c.FLOAT, false, 20, 12);
        c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        1 > a && (c.enable(c.BLEND),
            c.blendFunc(c.SRC_ALPHA, c.ONE_MINUS_SRC_ALPHA));
        c.depthMask(false);
        c.disable(c.DEPTH_TEST);
        c.drawElements(c.TRIANGLES, this.skyIndexCount, c.UNSIGNED_SHORT, 0);
        c.enable(c.DEPTH_TEST);
        c.depthMask(true);
        1 > a && c.disable(c.BLEND);
        c.disableVertexAttribArray(b.attribs.vPosition);
        c.disableVertexAttribArray(b.attribs.vTexCoord)
    }
}
    ;
Sky.prototype.complete = function () {
    return this.backgroundShader && !this.backgroundShader.complete() ? false : this.specularTexture.complete()
}
    ;
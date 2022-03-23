function TextureCache(a) {
    this.gl = a;
    this.cache = []
}
TextureCache.prototype.fromURL = function (a, c) {
    var b = this.cache[a];
    if (void 0 !== b)
        return b;
    var d = new Texture(this.gl, c);
    Network.fetchImage(a, function (a) {
        d.loadImage(a)
    });
    return this.cache[a] = d
}
    ;
TextureCache.prototype.fromFile = function (a, c) {
    if (!a)
        return null;
    var b = this.cache[a.name];
    if (void 0 !== b)
        return b;
    var d = new Texture(this.gl, c);
    this.cache[a.name] = d;
    TextureCache.parseFile(a, function (a) {
        d.loadImage(a);
        TextureCache.closeImage(a)
    });
    return d
}
    ;
TextureCache.prototype.fromFilesMergeAlpha = function (a, c, b) {
    if (!c)
        return this.fromFile(a, b);
    var d = a.name + "|" + c.name
        , e = this.cache[d];
    if (void 0 !== e)
        return e;
    var f = this.gl;
    this.blitShader || (this.blitShader = new Shader(this.gl),
        this.blitShader.build("precision highp float; varying vec2 c; attribute vec2 pos; void main(){ gl_Position.xy = 2.0*pos-vec2(1.0); gl_Position.zw = vec2(0.5,1.0); c=pos; }", "precision highp float; varying vec2 c; uniform sampler2D tTex; void main(){ gl_FragColor=texture2D(tTex,c).rgbr; }"),
        this.mergeVerts = f.createBuffer(),
        f.bindBuffer(f.ARRAY_BUFFER, this.mergeVerts),
        e = new Float32Array([0, 0, 2, 0, 0, 2]),
        f.bufferData(f.ARRAY_BUFFER, e, f.STATIC_DRAW),
        f.bindBuffer(f.ARRAY_BUFFER, null));
    var g = function (a) {
        this.blitShader.bind();
        a.bind(this.blitShader.samplers.tTex);
        f.bindBuffer(f.ARRAY_BUFFER, this.mergeVerts);
        f.enableVertexAttribArray(this.blitShader.attribs.pos);
        f.vertexAttribPointer(this.blitShader.attribs.pos, 2, f.FLOAT, !1, 0, 0);
        f.drawArrays(f.TRIANGLES, 0, 3);
        f.disableVertexAttribArray(this.blitShader.attribs.pos);
        f.bindBuffer(f.ARRAY_BUFFER, null)
    }
        .bind(this)
        , h = new Texture(this.gl, b);
    this.cache[d] = h;
    var k = 0
        , n = 0
        , m = function () {
            if (k && n) {
                var a, b;
                n.width * n.height > k.width * k.height ? (a = n.width,
                    b = n.height) : (a = k.width,
                        b = k.height);
                h.desc.width = a;
                h.desc.height = b;
                if (a <= f.limits.viewportSizes[0] && b <= f.limits.viewportSizes[1]) {
                    var c = {
                        clamp: !0
                    };
                    k.width == a && k.height == b ? (h.loadImage(k, f.RGBA),
                        a = new Framebuffer(f, {
                            color0: h,
                            ignoreStatus: !0
                        }),
                        TextureCache.closeImage(k)) : (b = new Texture(f, c),
                            b.loadImage(k, f.RGB),
                            TextureCache.closeImage(k),
                            h.loadArray(null),
                            a = new Framebuffer(f, {
                                color0: h,
                                ignoreStatus: !0
                            }),
                            a.bind(),
                            g(b),
                            b.destroy());
                    b = new Texture(f, c);
                    b.loadImage(n, f.RGB);
                    TextureCache.closeImage(n);
                    a.bind();
                    f.colorMask(!1, !1, !1, !0);
                    g(b);
                    f.colorMask(!0, !0, !0, !0);
                    b.destroy();
                    Framebuffer.bindNone(f);
                    h.rebuildMips()
                } else {
                    c = document.createElement("canvas");
                    c.width = a;
                    c.height = b;
                    var d = c.getContext("2d");
                    d.drawImage(k, 0, 0);
                    TextureCache.closeImage(k);
                    c = d.getImageData(0, 0, a, b);
                    c = new Uint8Array(c.data.buffer, c.data.byteOffset, c.data.length);
                    d.drawImage(n, 0, 0);
                    TextureCache.closeImage(n);
                    d = d.getImageData(0, 0, a, b).data;
                    a = a * b * 4;
                    for (b = 0; b < a; b += 4)
                        c[b + 3] = d[b];
                    h.loadArray(c)
                }
                TextureCache.closeImage(n)
            }
        }
            .bind(this);
    TextureCache.parseFile(a, function (a) {
        k = a;
        m()
    });
    TextureCache.parseFile(c, function (a) {
        n = a;
        m()
    });
    return h
}
    ;
TextureCache.parseFile = function (a, c, b) {
    var d = b || new Image;
    if ("undefined" != typeof URL && "undefined" != typeof URL.createObjectURL) {
        a = new Blob([a.data], {
            type: a.type
        });
        var e = URL.createObjectURL(a);
        d.onload = function () {
            URL.revokeObjectURL(e);
            c && c(d)
        }
            ;
        d.src = e
    } else {
        a = new Blob([a.data], {
            type: a.type
        });
        var f = new FileReader;
        f.onload = function (a) {
            d.src = f.result
        }
            ;
        d.onload = function () {
            c && c(d)
        }
            ;
        f.readAsDataURL(a)
    }
}
    ;
TextureCache.closeImage = function (a) {
    a && 256 < a.width * a.height && (a.onload = null,
        a.onerror = null,
        a.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D")
}
    ;
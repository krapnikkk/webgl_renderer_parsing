function ShaderCache(a) {
    this.gl = a;
    this.cache = []
}
ShaderCache.prototype.fromURLs = function (a, c, b) {
    var d = "";
    if (b)
        for (var e = 0; e < b.length; ++e)
            d = b[e] + "\n" + d;
    b = d + ":" + a + "|" + c;
    e = this.cache[b];
    if (void 0 !== e)
        return e;
    var f = new Shader(this.gl)
        , g = null
        , h = null
        , k = function () {
            null != g && null != h && f.build(g, h)
        };
    this.fetch(a, function (a) {
        g = d + a;
        k()
    });
    this.fetch(c, function (a) {
        h = d + a;
        k()
    });
    return this.cache[b] = f
}
    ;
ShaderCache.prototype.fetch = function (a, c) {
    "undefined" != typeof ShaderTable ? void 0 !== ShaderTable[a] ? this.resolveIncludes(new String(ShaderTable[a]), c) : c("") : Network.fetchText("src/shader/" + a, function (a) {
        this.resolveIncludes(a, c)
    }
        .bind(this), function () {
            c("")
        })
}
    ;
ShaderCache.prototype.resolveIncludes = function (a, c) {
    for (var b = [], d = !0, e = function (a, c, e, f, m) {
        d = !0;
        b.push({
            offset: m,
            path: c.slice(1, c.length - 1)
        });
        return ""
    }; d;)
        d = !1,
            a = a.replace(/#include\s((<[^>]+>)|("[^"]+"))/, e);
    if (0 < b.length)
        for (var f = b.length, e = 0; e < b.length; ++e)
            this.fetch(b[e].path, function (d) {
                this.src = d;
                if (0 >= --f) {
                    for (d = b.length - 1; 0 <= d; --d)
                        a = a.substring(0, b[d].offset) + b[d].src + a.substring(b[d].offset);
                    c(a)
                }
            }
                .bind(b[e]));
    else
        c(a)
}
    ;
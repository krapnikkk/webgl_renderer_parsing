function Shader(a) {
    this.gl = a;
    this.program = null;
    this.params = {};
    this.samplers = {};
    this.attribs = {}
}
Shader.prototype.build = function (a, c) {
    var b = this.gl;
    this.program = b.createProgram();
    this.params = {};
    this.samplers = {};
    this.attribs = {};
    var d = function (a) {
        for (var b = "", c = a.indexOf("\n"), d = 0; -1 != c;)
            d++,
                b += d + ": ",
                b += a.substring(0, c + 1),
                a = a.substring(c + 1, a.length),
                c = a.indexOf("\n");
        console.log(b)
    }
        , e = b.createShader(b.VERTEX_SHADER);
    b.shaderSource(e, a);
    b.compileShader(e);
    b.getShaderParameter(e, b.COMPILE_STATUS) || (console.log(b.getShaderInfoLog(e)),
        marmoset.verboseErrors && d(a));
    b.attachShader(this.program, e);
    e = b.createShader(b.FRAGMENT_SHADER);
    b.shaderSource(e, c);
    b.compileShader(e);
    b.getShaderParameter(e, b.COMPILE_STATUS) || (console.log(b.getShaderInfoLog(e)),
        marmoset.verboseErrors && d(c));
    b.attachShader(this.program, e);
    b.linkProgram(this.program);
    b.getProgramParameter(this.program, b.LINK_STATUS) || console.log(b.getProgramInfoLog(this.program));
    for (var e = b.getProgramParameter(this.program, b.ACTIVE_UNIFORMS), f = 0, d = 0; d < e; ++d) {
        var g = b.getActiveUniform(this.program, d)
            , h = g.name
            , k = h.indexOf("[");
        0 <= k && (h = h.substring(0, k));
        k = b.getUniformLocation(this.program, g.name);
        g.type == b.SAMPLER_2D || g.type == b.SAMPLER_CUBE ? this.samplers[h] = {
            location: k,
            unit: f++
        } : this.params[h] = k
    }
    e = b.getProgramParameter(this.program, b.ACTIVE_ATTRIBUTES);
    for (d = 0; d < e; ++d)
        f = b.getActiveAttrib(this.program, d),
            this.attribs[f.name] = b.getAttribLocation(this.program, f.name)
}
    ;
Shader.prototype.bind = function () {
    return this.program ? (this.gl.useProgram(this.program),
        !0) : !1
}
    ;
Shader.prototype.complete = function () {
    return !!this.program
}
    ;
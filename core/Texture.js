function Texture(a, c) {
    this.gl = a;
    this.id = null;
    this.type = a.TEXTURE_2D;
    this.format = a.RGBA;
    this.componentType = a.UNSIGNED_BYTE;
    c = c || {};
    this.desc = {
        width: c.width || 1,
        height: c.height || 1,
        mipmap: c.mipmap,
        clamp: c.clamp,
        mirror: c.mirror,
        aniso: c.aniso,
        nofilter: c.nofilter
    }
}
Texture.prototype.loadImage = function (a, c) {
    var b = this.gl;
    a && a.width && a.height && (this.desc.width = a.width,
        this.desc.height = a.height);
    this.id = b.createTexture();
    b.bindTexture(this.type, this.id);
    this.format = c || b.RGBA;
    this.componentType = b.UNSIGNED_BYTE;
    b.pixelStorei(b.UNPACK_FLIP_Y_WEBGL, !0);
    b.texImage2D(this.type, 0, this.format, this.format, this.componentType, a);
    this.setParams();
    b.bindTexture(this.type, null)
}
    ;
Texture.prototype.loadArray = function (a, c, b) {
    var d = this.gl;
    this.id = d.createTexture();
    d.bindTexture(this.type, this.id);
    this.format = c || d.RGBA;
    this.componentType = b || d.UNSIGNED_BYTE;
    d.pixelStorei(d.UNPACK_FLIP_Y_WEBGL, !0);
    d.texImage2D(this.type, 0, this.format, this.desc.width, this.desc.height, 0, this.format, this.componentType, a || null);
    this.setParams();
    d.bindTexture(this.type, null)
}
    ;
Texture.prototype.setParams = function () {
    var a = this.gl
        , c = function (a) {
            return 0 < a && 0 == (a & a - 1)
        };
    c(this.desc.width) && c(this.desc.height) || (this.desc.clamp = !0,
        this.desc.mipmap = !1);
    c = !this.desc.nofilter;
    this.desc.mipmap ? (a.generateMipmap(this.type),
        a.texParameteri(this.type, a.TEXTURE_MIN_FILTER, c ? a.LINEAR_MIPMAP_LINEAR : a.NEAREST_MIPMAP_NEAREST)) : a.texParameteri(this.type, a.TEXTURE_MIN_FILTER, c ? a.LINEAR : a.NEAREST);
    a.texParameteri(this.type, a.TEXTURE_MAG_FILTER, c ? a.LINEAR : a.NEAREST);
    if (this.desc.clamp || this.desc.mirror)
        c = this.desc.clamp ? a.CLAMP_TO_EDGE : a.MIRRORED_REPEAT,
            a.texParameteri(this.type, a.TEXTURE_WRAP_S, c),
            a.texParameteri(this.type, a.TEXTURE_WRAP_T, c);
    this.desc.aniso && a.ext.textureAniso && a.texParameteri(this.type, a.ext.textureAniso.TEXTURE_MAX_ANISOTROPY_EXT, this.desc.aniso)
}
    ;
Texture.prototype.rebuildMips = function () {
    this.desc.mipmap && (this.gl.bindTexture(this.type, this.id),
        this.gl.generateMipmap(this.type))
}
    ;
Texture.prototype.copyColorBuffer = function () {
    this.gl.bindTexture(this.type, this.id);
    this.gl.copyTexSubImage2D(this.type, 0, 0, 0, 0, 0, this.desc.width, this.desc.height)
}
    ;
Texture.prototype.bind = function (a) {
    if (a) {
        var c = this.gl;
        c.uniform1i(a.location, a.unit);
        c.activeTexture(c.TEXTURE0 + a.unit);
        c.bindTexture(this.type, this.id)
    }
}
    ;
Texture.prototype.destroy = function () {
    this.gl.deleteTexture(this.id);
    this.id = null
}
    ;
Texture.prototype.complete = function () {
    return !!this.id
}
    ;
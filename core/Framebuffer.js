function Framebuffer(a, c) {
    this.gl = a;
    this.fbo = a.createFramebuffer();
    a.bindFramebuffer(a.FRAMEBUFFER, this.fbo);
    c && (this.width = c.width,
        this.height = c.height,
        c.color0 && (this.color0 = c.color0,
            a.framebufferTexture2D(a.FRAMEBUFFER, a.COLOR_ATTACHMENT0, a.TEXTURE_2D, this.color0.id, 0),
            this.width = c.color0.desc.width,
            this.height = c.color0.desc.height),
        c.depth ? (this.depth = c.depth,
            a.framebufferTexture2D(a.FRAMEBUFFER, a.DEPTH_ATTACHMENT, a.TEXTURE_2D, this.depth.id, 0)) : (this.depthBuffer = c.depthBuffer,
                c.createDepth && !this.depthBuffer && (this.depthBuffer = Framebuffer.createDepthBuffer(a, this.width, this.height)),
                this.depthBuffer && (a.bindRenderbuffer(a.RENDERBUFFER, this.depthBuffer),
                    a.framebufferRenderbuffer(a.FRAMEBUFFER, a.DEPTH_ATTACHMENT, a.RENDERBUFFER, this.depthBuffer),
                    a.bindRenderbuffer(a.RENDERBUFFER, null))));
    this.valid = c && c.ignoreStatus || a.checkFramebufferStatus(a.FRAMEBUFFER) == a.FRAMEBUFFER_COMPLETE;
    a.bindFramebuffer(a.FRAMEBUFFER, null)
}
Framebuffer.createDepthBuffer = function (a, c, b) {
    var d = a.createRenderbuffer();
    a.bindRenderbuffer(a.RENDERBUFFER, d);
    a.renderbufferStorage(a.RENDERBUFFER, a.DEPTH_COMPONENT16, c, b);
    a.bindRenderbuffer(a.RENDERBUFFER, null);
    return d
}
    ;
Framebuffer.prototype.bind = function () {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
    this.gl.viewport(0, 0, this.width, this.height)
}
    ;
Framebuffer.bindNone = function (a) {
    a.bindFramebuffer(a.FRAMEBUFFER, null)
}
    ;
function ShadowFloor(a, c, b, d) {
    this.gl = a;
    this.desc = c;
    this.lightCount = d.count;
    this.shadowCount = b.shadowCount;
    c = this.nativeDepth ? ["#define SHADOW_NATIVE_DEPTH"] : [];
    c.push("#define LIGHT_COUNT " + this.lightCount);
    c.push("#define SHADOW_COUNT " + this.shadowCount);
    a.hints.mobile && c.push("#define MOBILE");
    this.shader = a.shaderCache.fromURLs("shadowfloorvert.glsl", "shadowfloorfrag.glsl", c);
    c = new Float32Array([-1, 0, -1, -1, 0, 1, 1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0, -1]);
    this.quadGeom = a.createBuffer();
    a.bindBuffer(a.ARRAY_BUFFER, this.quadGeom);
    a.bufferData(a.ARRAY_BUFFER, c, a.STATIC_DRAW);
    a.bindBuffer(a.ARRAY_BUFFER, null)
}
ShadowFloor.prototype.draw = function (a) {
    var c = a.view
        , b = a.lights
        , d = a.shadow
        , e = this.gl
        , f = this.shader.params
        , g = this.shader.samplers;
    this.shader.bind();
    c = Matrix.mul(Matrix.empty(), c.projectionMatrix, c.viewMatrix);
    Matrix.mul(c, c, this.desc.transform);
    e.uniformMatrix4fv(f.uModelViewProjectionMatrix, !1, c);
    c = Matrix.mul(Matrix.empty(), b.matrix, this.desc.transform);
    e.uniformMatrix4fv(f.uModelSkyMatrix, !1, c);
    0 < b.count && (e.uniform4fv(f.uLightPositions, b.positionBuffer),
        e.uniform3fv(f.uLightDirections, b.directionBuffer),
        e.uniform3fv(f.uLightColors, b.colors),
        e.uniform3fv(f.uLightParams, b.parameters),
        e.uniform3fv(f.uLightSpot, b.spot),
        a = 0.392699 * a.postRender.currentSample(),
        e.uniform2f(f.uShadowKernelRotation, 0.5 * Math.cos(a), 0.5 * Math.sin(a)),
        0 < b.shadowCount && (a = d.depthTextures[0].desc.width,
            e.uniform2f(f.uShadowMapSize, a, 1 / a),
            e.uniformMatrix4fv(f.uShadowMatrices, !1, b.finalTransformBuffer),
            e.uniformMatrix4fv(f.uInvShadowMatrices, !1, b.inverseTransformBuffer),
            e.uniform4fv(f.uShadowTexelPadProjections, b.shadowTexelPadProjections),
            d.bindDepthTexture(g.tDepth0, 0),
            d.bindDepthTexture(g.tDepth1, 1),
            d.bindDepthTexture(g.tDepth2, 2)));
    e.uniform3f(f.uShadowCatcherParams, this.desc.simple ? 1 : 0, this.desc.alpha, this.desc.edgeFade);
    e.depthMask(!1);
    e.enable(e.BLEND);
    e.blendFunc(e.ZERO, e.SRC_COLOR);
    b = this.shader.attribs.vPosition;
    e.bindBuffer(e.ARRAY_BUFFER, this.quadGeom);
    e.enableVertexAttribArray(b);
    e.vertexAttribPointer(b, 3, e.FLOAT, !1, 0, 0);
    e.drawArrays(e.TRIANGLES, 0, 6);
    e.disableVertexAttribArray(b);
    e.bindBuffer(e.ARRAY_BUFFER, null);
    e.disable(e.BLEND);
    e.depthMask(!0)
}
    ;
ShadowFloor.prototype.complete = function () {
    return this.shader.complete()
}
    ;
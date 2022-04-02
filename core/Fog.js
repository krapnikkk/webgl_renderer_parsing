function Fog(a, c) {
    this.desc = c;
    this.gl = a;
    this.iblShader = a.shaderCache.fromURLs("fogvert.glsl", "fogfrag.glsl", ["#define FOG_IBL"]);
    var b = c.newAttenuation ? "#define NEW_ATTENUATION" : ""
        , d = [b, "#define FOG_DIR"];
    this.dirShader = a.shaderCache.fromURLs("fogvert.glsl", "fogfrag.glsl", d);
    d.push("#define FOG_SHADOWS");
    this.dirShaderShadow = a.shaderCache.fromURLs("fogvert.glsl", "fogfrag.glsl", d);
    d = [b, "#define FOG_SPOT"];
    this.spotShader = a.shaderCache.fromURLs("fogvert.glsl", "fogfrag.glsl", d);
    d.push("#define FOG_SHADOWS");
    this.spotShaderShadow = a.shaderCache.fromURLs("fogvert.glsl", "fogfrag.glsl", d);
    d = [b, "#define FOG_OMNI"];
    this.omniShaderShadow = this.omniShader = a.shaderCache.fromURLs("fogvert.glsl", "fogfrag.glsl", d);
    this.fullscreenTriangle = a.createBuffer();
    a.bindBuffer(a.ARRAY_BUFFER, this.fullscreenTriangle);
    b = new Float32Array([0, 0, 2, 0, 0, 2]);
    a.bufferData(a.ARRAY_BUFFER, b, a.STATIC_DRAW);
    a.bindBuffer(a.ARRAY_BUFFER, null)
}
Fog.prototype.draw = function (a, c) {
    var b = this.gl
        , d = a.view
        , e = d.projectionMatrix
        , f = Matrix.empty();
    Matrix.mul(f, d.viewMatrix, d.projectionMatrix);
    Matrix.invert(f, d.viewProjectionMatrix);
    f = [e[10] + e[11], -e[14], -2 * e[11]];
    e = [-2 / e[0], -2 / e[5], (1 - e[8]) / e[0], (1 - e[9]) / e[5]];
    b.enable(b.BLEND);
    b.blendFunc(b.ONE, b.ONE_MINUS_SRC_ALPHA);
    for (var g = 0; g < a.lights.count + 1; ++g) {
        var h = g - 1, k = h < a.lights.shadowCount, n;
        n = 0 == g ? this.iblShader : 0 < a.lights.spot[3 * h] ? k ? this.spotShaderShadow : this.spotShader : 0 < a.lights.getLightPos(h)[3] ? this.omniShader : k ? this.dirShaderShadow : this.dirShader;
        n.bind();
        var m = n.params;
        b.uniform3fv(m.uDepthToZ, f);
        b.uniform4fv(m.uUnproject, e);
        b.uniformMatrix4fv(m.uInvViewMatrix, false, d.transform);
        b.uniform1f(m.uFogInvDistance, 1 / this.desc.distance);
        b.uniform1f(m.uFogOpacity, this.desc.opacity * (1 - a.stripData.activeFade()));
        b.uniform1f(m.uFogDispersion, 1 - this.desc.dispersion);
        var l = [0, 0, 0];
        l[this.desc.type] = 1;
        b.uniform3fv(m.uFogType, l);
        b.uniform3fv(m.uFogColor, this.desc.color);
        b.uniform1f(m.uFogIllum, 0 == g ? this.desc.skyIllum : this.desc.lightIllum);
        b.uniformMatrix4fv(m.uLightMatrix, false, a.lights.invMatrix);
        if (0 == g) {
            h = new Float32Array(a.sky.diffuseCoefficients);
            for (k = 4; 16 > k; ++k)
                h[k] *= 1 - this.desc.dispersion;
            for (k = 16; 36 > k; ++k)
                h[k] *= 1 - this.desc.dispersion * this.desc.dispersion;
            b.uniform4fv(m.uFogLightSphere, h)
        } else {
            var p = a.lights.getLightPos(h)
                , p = Matrix.mul4(Vect.empty(), a.lights.invMatrix, p[0], p[1], p[2], p[3])
                , l = a.lights.getLightDir(h)
                , l = Matrix.mulVec(Vect.empty(), a.lights.invMatrix, l[0], l[1], l[2]);
            b.uniform4fv(m.uLightPosition, p);
            b.uniform3fv(m.uLightColor, a.lights.getColor(h));
            var p = 0.01745329251 * a.lights.spot[3 * h]
                , r = Math.cos(0.5 * p);
            b.uniform4fv(m.uSpotParams, [-l[0], -l[1], -l[2], 0 < p ? r * r : 0]);
            b.uniform4fv(m.uLightAttenuation, [a.lights.parameters[3 * h + 0], a.lights.parameters[3 * h + 1], a.lights.parameters[3 * h + 2], r]);
            k && (k = Matrix.mul(Matrix.empty(), a.lights.finalTransformBuffer.subarray(16 * h), a.lights.matrix),
                b.uniformMatrix4fv(m.uShadowProj, false, k),
                a.shadow.depthTextures[h].bind(n.samplers.uShadowMap),
                h = 0,
                1 < a.postRender.sampleCount && (h = a.postRender.currentSample() / a.postRender.sampleCount),
                b.uniform1f(m.uDitherOffset, h),
                b.uniform3fv(m.uAABBMin, a.bounds.min),
                b.uniform3fv(m.uAABBMax, a.bounds.max),
                h = Vect.lerp(Vect.empty(), a.bounds.min, a.bounds.max, 0.5),
                k = Vect.distance(h, a.bounds.min),
                b.uniform4f(m.uCylinder, h[0], h[1], h[2], k * k))
        }
        c.bind(n.samplers.tDepth);
        n = n.attribs.vCoord;
        b.bindBuffer(b.ARRAY_BUFFER, this.fullscreenTriangle);
        b.enableVertexAttribArray(n);
        b.vertexAttribPointer(n, 2, b.FLOAT, false, 0, 0);
        b.drawArrays(b.TRIANGLES, 0, 3);
        b.disableVertexAttribArray(n);
        b.bindBuffer(b.ARRAY_BUFFER, null)
    }
    b.disable(b.BLEND)
}
    ;
Fog.prototype.complete = function () {
    return this.iblShader.complete() && this.dirShader.complete() && this.dirShaderShadow.complete() && this.spotShader.complete() && this.spotShaderShadow.complete() && this.omniShader.complete() && this.omniShaderShadow.complete()
}
    ;
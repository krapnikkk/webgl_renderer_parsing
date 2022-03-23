function Lights(a, c) {
    this.rotation = this.shadowCount = this.count = 0;
    this.positions = [];
    this.directions = [];
    this.matrixWeights = [];
    this.matrix = Matrix.identity();
    this.invMatrix = Matrix.identity();
    this.defaultmatrix = Matrix.identity();
    this.defaultviewmatrix = Matrix.identity();
    for (var b in a)
        this[b] = a[b];
    this.count = this.positions.length / 4;
    this.count = Math.min(6, this.count);
    this.shadowCount = Math.min(3, this.shadowCount);
    this.positions = new Float32Array(this.positions);
    this.positionBuffer = new Float32Array(this.positions);
    this.directions = new Float32Array(this.directions);
    this.directionBuffer = new Float32Array(this.directions);
    this.colors = new Float32Array(this.colors);
    this.colorsBuffer = new Float32Array(this.colors);
    this.modelViewBuffer = new Float32Array(16 * this.shadowCount);
    this.projectionBuffer = new Float32Array(16 * this.shadowCount);
    this.finalTransformBuffer = new Float32Array(16 * this.shadowCount);
    this.inverseTransformBuffer = new Float32Array(16 * this.shadowCount);
    this.shadowTexelPadProjections = new Float32Array(4 * this.shadowCount);
    this.shadowsNeedUpdate = new Uint8Array(this.shadowCount);
    for (var d = 0; d < this.shadowsNeedUpdate.length; ++d)
        this.shadowsNeedUpdate[d] = 1;
    Matrix.rotation(this.matrix, this.rotation, 1);
    Matrix.transpose(this.invMatrix, this.matrix);
    Matrix.copy(this.defaultmatrix, this.matrix);
    Matrix.copy(this.defaultviewmatrix, c.viewMatrix);
    for (d = 0; d < this.count; ++d) {
        b = this.positions.subarray(4 * d, 4 * d + 4);
        var e = this.directions.subarray(3 * d, 3 * d + 3);
        1 == this.matrixWeights[d] ? (Matrix.mul4(b, this.matrix, b[0], b[1], b[2], b[3]),
            Matrix.mulVec(e, this.matrix, e[0], e[1], e[2])) : 2 == this.matrixWeights[d] && (Matrix.mul4(b, c.viewMatrix, b[0], b[1], b[2], b[3]),
                Matrix.mulVec(e, c.viewMatrix, e[0], e[1], e[2]))
    }
}
Lights.prototype.getLightPos = function (a) {
    return this.positionBuffer.subarray(4 * a, 4 * a + 4)
}
    ;
Lights.prototype.setLightDistance = function (a, c) {
    0 >= c && (c = 1E-5);
    this.parameters[3 * a + 2] = 1 / c
}
    ;
Lights.prototype.setLightSpotAngle = function (a, c) {
    0 >= c && (c = 1E-6);
    this.spot[3 * a] = c;
    var b = Math.sin(3.1415926 / 180 * c / 2);
    this.spot[3 * a + 2] = 1 / (b * b) * this.spot[3 * a + 1]
}
    ;
Lights.prototype.setLightSpotSharpness = function (a, c) {
    this.spot[3 * a + 1] = c;
    this.setLightSpotAngle(this.spot[3 * a])
}
    ;
Lights.prototype.setLightPos = function (a, c) {
    this.positions[4 * a + 0] = c[0];
    this.positions[4 * a + 1] = c[1];
    this.positions[4 * a + 2] = c[2];
    var b = this.positions.subarray(4 * a, 4 * a + 4);
    1 == this.matrixWeights[a] ? Matrix.mul4(b, this.defaultmatrix, c[0], c[1], c[2], b[3]) : 2 == this.matrixWeights[a] && Matrix.mul4(b, this.defaultviewmatrix, c[0], c[1], c[2], b[3])
}
    ;
Lights.prototype.setLightDir = function (a, c) {
    this.directions[3 * a + 0] = c[0];
    this.directions[3 * a + 1] = c[1];
    this.directions[3 * a + 2] = c[2];
    var b = this.directions.subarray(3 * a, 3 * a + 3);
    1 == this.matrixWeights[a] ? Matrix.mulVec(b, this.defaultmatrix, c[0], c[1], c[2]) : 2 == this.matrixWeights[a] && Matrix.mulVec(b, this.defaultviewmatrix, c[0], c[1], c[2])
}
    ;
Lights.prototype.getLightColor = function (a) {
    return this.colors.subarray(3 * a, 3 * a + 3)
}
    ;
Lights.prototype.setLightColor = function (a, c) {
    this.colors[3 * a + 0] = c[0];
    this.colors[3 * a + 1] = c[1];
    this.colors[3 * a + 2] = c[2]
}
    ;
Lights.prototype.getLightDir = function (a) {
    return this.directionBuffer.subarray(3 * a, 3 * a + 3)
}
    ;
Lights.prototype.getColor = function (a) {
    a *= 3;
    return [this.colors[a], this.colors[a + 1], this.colors[a + 2]]
}
    ;
Lights.prototype.update = function (a, c) {
    var b = new Matrix.type(this.matrix);
    Matrix.rotation(this.matrix, this.rotation, 1);
    Matrix.transpose(this.invMatrix, this.matrix);
    for (var d = 0; d < this.count; ++d) {
        var e = this.positions.subarray(4 * d, 4 * d + 4)
            , f = this.directions.subarray(3 * d, 3 * d + 3)
            , g = this.getLightPos(d)
            , h = this.getLightDir(d);
        1 == this.matrixWeights[d] ? (g[0] = e[0],
            g[1] = e[1],
            g[2] = e[2],
            g[3] = e[3],
            h[0] = f[0],
            h[1] = f[1],
            h[2] = f[2]) : 2 == this.matrixWeights[d] ? (Matrix.mul4(g, a.transform, e[0], e[1], e[2], e[3]),
                Matrix.mulVec(h, a.transform, f[0], f[1], f[2]),
                Matrix.mul4(g, this.matrix, g[0], g[1], g[2], g[3]),
                Matrix.mulVec(h, this.matrix, h[0], h[1], h[2])) : (Matrix.mul4(g, this.matrix, e[0], e[1], e[2], e[3]),
                    Matrix.mulVec(h, this.matrix, f[0], f[1], f[2]));
        Vect.normalize(h, h)
    }
    for (var f = new Float32Array(this.finalTransformBuffer), g = Matrix.empty(), h = Matrix.empty(), k = Matrix.empty(), n = Vect.empty(), m = Vect.empty(), l = Vect.empty(), p = Vect.empty(), e = Vect.empty(), r = [], s = [], u = Matrix.create(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1), d = 0; d < this.count; ++d) {
        n = this.getLightPos(d);
        m = this.getLightDir(d);
        0.99 < Math.abs(m[1]) ? Vect.set(l, 1, 0, 0) : Vect.set(l, 0, 1, 0);
        Vect.cross(p, l, m);
        Vect.normalize(p, p);
        Vect.cross(l, m, p);
        Vect.normalize(l, l);
        Matrix.set(g, p[0], p[1], p[2], -Vect.dot(p, n), l[0], l[1], l[2], -Vect.dot(l, n), m[0], m[1], m[2], -Vect.dot(m, n), 0, 0, 0, 1);
        for (n = 0; 8 > n; ++n)
            e[0] = n & 1 ? c.max[0] : c.min[0],
                e[1] = n & 2 ? c.max[1] : c.min[1],
                e[2] = n & 4 ? c.max[2] : c.min[2],
                Matrix.mulPoint(e, this.matrix, 1.005 * e[0], 1.005 * e[1], 1.005 * e[2]),
                Matrix.mulPoint(e, g, e[0], e[1], e[2]),
                0 == n ? (r[0] = s[0] = e[0],
                    r[1] = s[1] = e[1],
                    r[2] = s[2] = e[2]) : (r[0] = Math.min(r[0], e[0]),
                        r[1] = Math.min(r[1], e[1]),
                        r[2] = Math.min(r[2], e[2]),
                        s[0] = Math.max(s[0], e[0]),
                        s[1] = Math.max(s[1], e[1]),
                        s[2] = Math.max(s[2], e[2]));
        var n = -r[2]
            , m = -s[2]
            , q = this.spot[3 * d];
        0 < q ? (n = Math.min(n, 1 / this.parameters[3 * d + 2]),
            m = Math.max(0.04 * n, m),
            Matrix.perspective(h, q, 1, m, n),
            d < this.shadowCount && (n = 2 * -Math.tan(0.00872664625 * q),
                this.shadowTexelPadProjections[4 * d + 0] = this.modelViewBuffer[16 * d + 2] * n,
                this.shadowTexelPadProjections[4 * d + 1] = this.modelViewBuffer[16 * d + 6] * n,
                this.shadowTexelPadProjections[4 * d + 2] = this.modelViewBuffer[16 * d + 10] * n,
                this.shadowTexelPadProjections[4 * d + 3] = this.modelViewBuffer[16 * d + 14] * n)) : (Matrix.ortho(h, r[0], s[0], r[1], s[1], m, n),
                    d < this.shadowCount && (this.shadowTexelPadProjections[4 * d + 0] = this.shadowTexelPadProjections[4 * d + 1] = this.shadowTexelPadProjections[4 * d + 2] = 0,
                        this.shadowTexelPadProjections[4 * d + 3] = Math.max(s[0] - r[0], s[1] - r[1])));
        Matrix.mul(k, h, g);
        Matrix.mul(k, u, k);
        Matrix.copyToBuffer(this.modelViewBuffer, 16 * d, g);
        Matrix.copyToBuffer(this.projectionBuffer, 16 * d, h);
        Matrix.copyToBuffer(this.finalTransformBuffer, 16 * d, k);
        Matrix.invert(k, k);
        Matrix.copyToBuffer(this.inverseTransformBuffer, 16 * d, k)
    }
    e = !1;
    for (d = 0; d < b.length; ++d)
        if (b[d] != this.matrix[d]) {
            e = !0;
            break
        }
    for (d = 0; d < this.shadowCount; d++)
        if (e && 1 == this.matrixWeights[d])
            this.shadowsNeedUpdate[d] = 1;
        else
            for (b = 16 * d; b < 16 * d + 16; ++b)
                if (f[b] != this.finalTransformBuffer[b]) {
                    this.shadowsNeedUpdate[d] = 1;
                    break
                }
}
    ;
Lights.prototype.flagUpdateAnimatedLighting = function () {
    for (var a = 0; a < this.shadowCount; a++)
        this.shadowsNeedUpdate[a] = 1
}
    ;
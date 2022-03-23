function AnimatedTransform(a) {
    var c = a.animatedProperties;
    this.TX = this.TY = this.TZ = this.RX = this.RY = this.RZ = this.SX = this.SY = this.SZ = 0;
    this.hostObject = a;
    this.matrix = Matrix.identity();
    this.cachedmatrix0 = Matrix.identity();
    this.cachedmatrix1 = Matrix.identity();
    this.cachedmatrix2 = Matrix.identity();
    this.cachedmatrix3 = Matrix.identity();
    this.cachedFrame3 = this.cachedFrame2 = this.cachedFrame1 = this.cachedFrame0 = -1;
    this.cachedFrameUse3 = this.cachedFrameUse2 = this.cachedFrameUse1 = this.cachedFrameUse0 = 0;
    this.debugString = "";
    for (a = 0; a < c.length; a++) {
        var b = c[a];
        "Translation X" == b.name ? this.TX = b : "Translation Y" == b.name ? this.TY = b : "Translation Z" == b.name ? this.TZ = b : "Rotation X" == b.name ? this.RX = b : "Rotation Y" == b.name ? this.RY = b : "Rotation Z" == b.name ? this.RZ = b : "Scale X" == b.name ? this.SX = b : "Scale Y" == b.name ? this.SY = b : "Scale Z" == b.name && (this.SZ = b)
    }
    this.hasTranslation = this.TX && this.TY && this.TZ;
    this.hasRotation = this.RX && this.RY && this.RZ;
    this.hasScale = this.SX && this.SY && this.SZ;
    this.lockTransform = !1
}
AnimatedTransform.prototype.getTRSValue = function (a, c, b) {
    if (!c)
        return b;
    c.evaluate(a, b, this.hostObject);
    "" != c.debugString && (this.debugString += c.debugString);
    return c.lastValue
}
    ;
AnimatedTransform.prototype.evaluateMatrix = function (a, c, b, d) {
    if (this.lockTransform)
        Matrix.copy(a, this.cachedmatrix0);
    else {
        var e = 0
            , f = c = 0
            , e = f = c = 0
            , e = f = c = 1;
        this.hasRotation ? (e = this.getTRSValue(b, this.RX, 0),
            c = this.getTRSValue(b, this.RY, 0),
            f = this.getTRSValue(b, this.RZ, 0),
            d ? (this.matrix = Matrix.rotation(Matrix.empty(), f, 2),
                d = Matrix.rotation(Matrix.empty(), e, 0),
                Matrix.mul(d, d, this.matrix),
                this.matrix = Matrix.rotation(Matrix.empty(), c, 1)) : (this.matrix = Matrix.rotation(Matrix.empty(), e, 0),
                    d = Matrix.rotation(Matrix.empty(), c, 1),
                    Matrix.mul(d, d, this.matrix),
                    this.matrix = Matrix.rotation(Matrix.empty(), f, 2)),
            Matrix.mul(this.matrix, this.matrix, d)) : Matrix.copy(this.matrix, Matrix.identity());
        this.hasTranslation && (c = this.getTRSValue(b, this.TX, 0),
            f = this.getTRSValue(b, this.TY, 0),
            e = this.getTRSValue(b, this.TZ, 0),
            this.matrix[12] = c,
            this.matrix[13] = f,
            this.matrix[14] = e);
        this.hasScale && (c = this.getTRSValue(b, this.SX, 1),
            f = this.getTRSValue(b, this.SY, 1),
            e = this.getTRSValue(b, this.SZ, 1),
            this.matrix[0] *= c,
            this.matrix[4] *= f,
            this.matrix[8] *= e,
            this.matrix[1] *= c,
            this.matrix[5] *= f,
            this.matrix[9] *= e,
            this.matrix[2] *= c,
            this.matrix[6] *= f,
            this.matrix[10] *= e,
            this.matrix[3] *= c,
            this.matrix[7] *= f,
            this.matrix[11] *= e);
        Matrix.copy(a, this.matrix)
    }
}
    ;
AnimatedTransform.prototype.clearCachedTransforms = function () {
    this.cachedFrame3 = this.cachedFrame2 = this.cachedFrame1 = this.cachedFrame0 = -1;
    this.cachedFrameUse3 = this.cachedFrameUse2 = this.cachedFrameUse1 = this.cachedFrameUse0 = 0;
    this.TX && (this.TX.lastFramePercent = -10);
    this.TY && (this.TY.lastFramePercent = -10);
    this.TZ && (this.TZ.lastFramePercent = -10);
    this.RX && (this.RX.lastFramePercent = -10);
    this.RY && (this.RY.lastFramePercent = -10);
    this.RZ && (this.RZ.lastFramePercent = -10);
    this.SX && (this.SX.lastFramePercent = -10);
    this.SY && (this.SY.lastFramePercent = -10);
    this.SZ && (this.SZ.lastFramePercent = -10);
    this.lockTransform = !1
}
    ;
AnimatedTransform.prototype.getCachedTransform = function (a) {
    return this.lockTransform ? 0 : this.cachedFrame0 == a ? this.cachedmatrix0 : this.cachedFrame1 == a ? this.cachedmatrix1 : this.cachedFrame2 == a ? this.cachedmatrix2 : this.cachedFrame3 == a ? this.cachedmatrix3 : 0
}
    ;
AnimatedTransform.prototype.getFreeCachedTransform = function (a) {
    if (this.lockTransform)
        return 0;
    this.cachedFrameUse0--;
    this.cachedFrameUse1--;
    this.cachedFrameUse2--;
    this.cachedFrameUse3--;
    if (this.cachedFrameUse0 <= this.cachedFrameUse1 && this.cachedFrameUse0 <= this.cachedFrameUse2 && this.cachedFrameUse0 <= this.cachedFrameUse3 || this.cachedFrame0 == a)
        return this.cachedFrame0 = a,
            this.cachedFrameUse0 = 0,
            this.cachedmatrix0;
    if (this.cachedFrameUse1 <= this.cachedFrameUse0 && this.cachedFrameUse1 <= this.cachedFrameUse2 && this.cachedFrameUse1 <= this.cachedFrameUse3 || this.cachedFrame1 == a)
        return this.cachedFrame1 = a,
            this.cachedFrameUse1 = 0,
            this.cachedmatrix1;
    if (this.cachedFrameUse2 <= this.cachedFrameUse0 && this.cachedFrameUse2 <= this.cachedFrameUse1 && this.cachedFrameUse2 <= this.cachedFrameUse3 || this.cachedFrame2 == a)
        return this.cachedFrame2 = a,
            this.cachedFrameUse2 = 0,
            this.cachedmatrix2;
    this.cachedFrame3 = a;
    this.cachedFrameUse3 = 0;
    return this.cachedmatrix3
}
    ;
function AnimatedProperty() {
    this.currentValue = 0;
    this.keyframeBufferStartIndexFloat = -1;
    this.lastValue = this.interpolationOffsetUShort = this.frameIndexOffsetUShort = this.weighOutOffsetFloat = this.weighInOffsetFloat = this.valueOffsetFloat = this.indexUShortSkip = this.indexFloatSkip = this.interpolationType = this.bytesPerKeyFrame = this.keyframePackingType = 0;
    this.lastFramePercent = -10;
    this.enable = true;
    this.name = "NONE";
    this.splineKF0 = new KeyFrame(0, 0);
    this.splineKF1 = new KeyFrame(0, 0);
    this.splineKF2 = new KeyFrame(0, 0);
    this.splineKF3 = new KeyFrame(0, 0);
    this.debugMe = true;
    this.debugString = "";
    this.lastSearchIndex = 1;
    this.savedSearchIndex = 0;
    this.splineKF0.frameIndex = 0;
    this.splineKF1.frameIndex = 1;
    this.splineKF2.frameIndex = 2;
    this.splineKF3.frameIndex = 3;
    this.numKeyframes = 0
}
AnimatedProperty.prototype.evaluateCurve = function (a, c) {
    var b = this.splineKF1.frameIndex
        , d = this.splineKF2.frameIndex
        , e = this.splineKF1.value
        , f = this.splineKF2.value
        , g = b - (this.splineKF2.frameIndex - this.splineKF0.frameIndex)
        , h = d - (this.splineKF1.frameIndex - this.splineKF3.frameIndex)
        , k = e - (this.splineKF2.value - this.splineKF0.value) * this.splineKF1.weighOut
        , n = f - (this.splineKF1.value - this.splineKF3.value) * this.splineKF2.weighIn;
    3 == this.splineKF1.interpolation && (g = b - (this.splineKF2.frameIndex - this.splineKF1.frameIndex),
        k = e - this.splineKF1.weighOut);
    3 == this.splineKF2.interpolation && (h = d - (this.splineKF1.frameIndex - this.splineKF2.frameIndex),
        n = f + this.splineKF2.weighIn);
    g = (a - g) / (b - g);
    b = (a - b) / (d - b);
    d = (a - d) / (h - d);
    h = e * (1 - b) + f * b;
    return ((k * (1 - g) + e * g) * (1 - b) + h * b) * (1 - b) + ((f * (1 - d) + n * d) * b + h * (1 - b)) * b
};
AnimatedProperty.prototype.evaluate = function (a, c, b) {
    if (!b)
        return c;
    if (0 == this.numKeyframes)
        return this.lastValue = c;
    if (1 == this.numKeyframes)
        return this.lastValue = 2 == this.keyframePackingType ? b.keyframesSharedBufferFloats[this.keyframeBufferStartIndexFloat] : b.keyframesSharedBufferFloats[this.keyframeBufferStartIndexFloat + this.valueOffsetFloat];
    if (this.lastFramePercent == a)
        return this.lastValue;
    var d = this.keyframeBufferStartIndexFloat
        , e = 2 * this.keyframeBufferStartIndexFloat;
    this.lastValue = c;
    this.lastFramePercent = a;
    if (2 == this.keyframePackingType) {
        c = Math.floor(a);
        var f = a - c;
        a >= this.numKeyframes && (c -= Math.floor(a / this.numKeyframes) * this.numKeyframes);
        if (c >= this.numKeyframes - 1)
            return this.lastValue = b.keyframesSharedBufferFloats[d + (this.numKeyframes - 1)];
        if (0 > c)
            return this.lastValue = b.keyframesSharedBufferFloats[d];
        if (0 == f)
            return this.lastValue = b.keyframesSharedBufferFloats[d + c];
        a = e = b.keyframesSharedBufferFloats[d + c];
        c++;
        c >= this.numKeyframes && (c -= this.numKeyframes);
        0 <= c && c < this.numKeyframes ? a = e * (1 - f) + b.keyframesSharedBufferFloats[d + c] * f : b.debugString += "<br>bad lerp frame " + c + " of " + this.numKeyframes;
        return this.lastValue = a
    }
    var g = this.numKeyframes
        , f = b.keyframesSharedBufferUShorts[e + this.frameIndexOffsetUShort];
    if (a >= b.keyframesSharedBufferUShorts[e + (g - 1) * this.indexUShortSkip + this.frameIndexOffsetUShort])
        return this.lastValue = b.keyframesSharedBufferFloats[d + (g - 1) * this.indexFloatSkip + this.valueOffsetFloat];
    if (a < f)
        return this.lastValue = b.keyframesSharedBufferFloats[d + this.valueOffsetFloat];
    this.lastSearchIndex < this.numKeyframes && a > b.keyframesSharedBufferUShorts[e + this.lastSearchIndex * this.indexUShortSkip + this.frameIndexOffsetUShort] && (this.lastSearchIndex = 1);
    for (var h = this.lastSearchIndex; h < g; h++) {
        var f = d + h * this.indexFloatSkip
            , k = d + (h - 1) * this.indexFloatSkip
            , n = e + h * this.indexUShortSkip
            , m = e + (h - 1) * this.indexUShortSkip;
        if (a >= b.keyframesSharedBufferUShorts[m + this.frameIndexOffsetUShort] && a <= b.keyframesSharedBufferUShorts[n + this.frameIndexOffsetUShort]) {
            this.lastSearchIndex = h;
            var l = b.keyframesSharedBufferUShorts[m + this.interpolationOffsetUShort];
            if (2 == l) {
                this.lastValue = a = a >= b.keyframesSharedBufferUShorts[n + this.frameIndexOffsetUShort] ? b.keyframesSharedBufferFloats[f + this.valueOffsetFloat] : b.keyframesSharedBufferFloats[k + this.valueOffsetFloat];
                break
            }
            if (0 == l) {
                d = b.keyframesSharedBufferUShorts[m + this.frameIndexOffsetUShort];
                c = b.keyframesSharedBufferFloats[k + this.valueOffsetFloat];
                e = b.keyframesSharedBufferFloats[f + this.valueOffsetFloat];
                f = (a - d) / (b.keyframesSharedBufferUShorts[n + this.frameIndexOffsetUShort] - d);
                this.lastValue = a = c * (1 - f) + e * f;
                break
            }
            if (1 == l || 3 == l) {
                var p = l = false
                    , r = 0
                    , s = b.keyframesSharedBufferFloats[k + this.valueOffsetFloat]
                    , u = b.keyframesSharedBufferFloats[f + this.valueOffsetFloat]
                    , q = 0
                    , x = 0
                    , m = b.keyframesSharedBufferUShorts[m + this.frameIndexOffsetUShort]
                    , n = b.keyframesSharedBufferUShorts[n + this.frameIndexOffsetUShort]
                    , w = 0
                    , v = 1
                    , t = 1
                    , y = 1
                    , E = 1
                    , F = 1
                    , A = 1
                    , B = 1
                    , z = 1;
                0 != this.weighInOffsetFloat && (t = b.keyframesSharedBufferFloats[k + this.weighInOffsetFloat],
                    y = b.keyframesSharedBufferFloats[f + this.weighInOffsetFloat],
                    A = b.keyframesSharedBufferFloats[k + this.weighOutOffsetFloat],
                    B = b.keyframesSharedBufferFloats[f + this.weighOutOffsetFloat]);
                1 < h && (l = true,
                    r = b.keyframesSharedBufferFloats[d + (h - 2) * this.indexFloatSkip + this.valueOffsetFloat],
                    x = b.keyframesSharedBufferUShorts[e + (h - 2) * this.indexUShortSkip + this.frameIndexOffsetUShort],
                    0 != this.weighInOffsetFloat && (v = b.keyframesSharedBufferFloats[d + (h - 2) * this.indexFloatSkip + this.weighInOffsetFloat],
                        F = b.keyframesSharedBufferFloats[d + (h - 2) * this.indexFloatSkip + this.weighOutOffsetFloat]));
                h < g - 1 && (p = true,
                    q = b.keyframesSharedBufferFloats[d + (h + 1) * this.indexFloatSkip + this.valueOffsetFloat],
                    w = b.keyframesSharedBufferUShorts[e + (h + 1) * this.indexUShortSkip + this.frameIndexOffsetUShort],
                    0 != this.weighInOffsetFloat && (E = b.keyframesSharedBufferFloats[d + (h + 1) * this.indexFloatSkip + this.weighInOffsetFloat],
                        z = b.keyframesSharedBufferFloats[d + (h + 1) * this.indexFloatSkip + this.weighOutOffsetFloat]));
                l && p ? (this.splineKF0.value = r,
                    this.splineKF1.value = s,
                    this.splineKF2.value = u,
                    this.splineKF3.value = q,
                    this.splineKF0.frameIndex = x,
                    this.splineKF1.frameIndex = m,
                    this.splineKF2.frameIndex = n,
                    this.splineKF3.frameIndex = w,
                    this.splineKF0.weighIn = v,
                    this.splineKF0.weighOut = F,
                    this.splineKF1.weighIn = t,
                    this.splineKF1.weighOut = A,
                    this.splineKF2.weighIn = y,
                    this.splineKF2.weighOut = B,
                    this.splineKF3.weighIn = E,
                    this.splineKF3.weighOut = z) : (this.splineKF0.value = s,
                        this.splineKF1.value = s,
                        this.splineKF2.value = u,
                        this.splineKF3.value = u,
                        this.splineKF0.frameIndex = m,
                        this.splineKF1.frameIndex = m,
                        this.splineKF2.frameIndex = n,
                        this.splineKF3.frameIndex = n,
                        this.splineKF1.weighIn = t,
                        this.splineKF2.weighIn = y,
                        this.splineKF1.weighOut = A,
                        this.splineKF2.weighOut = B,
                        p ? (this.splineKF3.value = q,
                            this.splineKF3.frameIndex = w,
                            this.splineKF3.weighIn = E,
                            this.splineKF3.weighOut = z) : (this.splineKF3.frameIndex++,
                                this.splineKF3.value = this.splineKF1.value,
                                this.splineKF3.weighIn = 1,
                                this.splineKF3.weighOut = 1),
                        l ? (this.splineKF0.value = r,
                            this.splineKF0.frameIndex = x,
                            this.splineKF0.weighIn = v,
                            this.splineKF0.weighOut = F) : (this.splineKF0.value = this.splineKF2.value,
                                this.splineKF0.weighIn = 1,
                                this.splineKF0.weighOut = 1,
                                0 < this.splineKF0.frameIndex ? this.splineKF0.frameIndex-- : (this.splineKF1.frameIndex++,
                                    this.splineKF2.frameIndex++,
                                    this.splineKF3.frameIndex++,
                                    a++)));
                this.lastValue = a = this.evaluateCurve(a, c);
                break
            }
        }
    }
    return this.lastValue
};
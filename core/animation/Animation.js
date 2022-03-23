function Animation(a, c) {
    this.originalFPS = 1;
    this.name = c.name;
    this.totalSeconds = c.length;
    this.originalFPS = c.originalFPS;
    this.totalFrames = c.totalFrames;
    this.expectedNumAnimatedObjects = c.numAnimatedObjects;
    this.animatedObjects = [];
    this.sceneTransform = Matrix.identity();
    this.debugString = "";
    if (c.animatedObjects)
        for (var b = c.animatedObjects.length, d = 0; d < b; ++d) {
            var e = new AnimatedObject(a, c.animatedObjects[d], d);
            this.animatedObjects.push(e);
            this.debugString += e.debugString
        }
    this.meshObjects = [];
    this.lightObjects = [];
    this.materialObjects = [];
    this.turnTableObjects = [];
    this.cameraObjects = []
}
Animation.prototype.evaluateModelPartTransformAtFrame = function (a, c, b, d) {
    Matrix.copy(b, Matrix.identity());
    for (var e = 0; 100 > e; e++) {
        var f = this.animatedObjects[a];
        if (a == f.parentIndex)
            break;
        if (f.useFixedWorldTransform) {
            Matrix.mul(b, f.cachedWorldTransform0, b);
            break
        } else {
            var g = 0;
            d && (g = f.getCachedWorldTransform(c));
            if (g) {
                Matrix.mul(b, g, b);
                break
            } else
                g = Matrix.identity(),
                    f.evaluateLocalTransformAtFramePercent(c, g, !1, d),
                    Matrix.mul(b, g, b),
                    a == f.parentIndex && (e = 100),
                    a = f.parentIndex
        }
    }
}
    ;
Animation.prototype.lerpModelPartTransform = function (a, c, b, d) {
    var e = this.animatedObjects[a];
    if (e.useFixedWorldTransform)
        Matrix.copy(b, e.cachedWorldTransform0);
    else {
        var f = c * e.modelPartFPS
            , f = f - Math.floor(f)
            , g = Math.floor(this.getObjectAnimationFramePercent(e, c))
            , h = g + 1
            , k = c = 0;
        d && (c = e.getCachedWorldTransform(g),
            k = e.getCachedWorldTransform(h));
        c || ((c = e.getFreeCachedWorldTransform(g)) || (c = Matrix.identity()),
            this.evaluateModelPartTransformAtFrame(a, g, c, d));
        k || ((k = e.getFreeCachedWorldTransform(h)) || (k = Matrix.identity()),
            this.evaluateModelPartTransformAtFrame(a, h, k, d));
        a = 1 - f;
        for (d = 0; 16 > d; d++)
            b[d] = c[d] * a + k[d] * f
    }
}
    ;
Animation.prototype.getModelPartTransform = function (a, c, b, d) {
    this.lerpModelPartTransform(a, c, b, d)
}
    ;
Animation.prototype.getAnimatedLocalTransform = function (a, c, b, d) {
    a = this.animatedObjects[a];
    var e = this.animatedObjects[a.parentIndex]
        , f = e.modelPartIndex != e.id
        , g = Matrix.identity();
    this.getModelPartTransform(a.modelPartIndex, c, g, d);
    if (f) {
        var f = Matrix.identity()
            , h = Matrix.identity();
        this.getModelPartTransform(e.modelPartIndex, c, f, d);
        Matrix.invert(h, f);
        Matrix.mul(b, h, g);
        b[12] *= a.modelPartScale;
        b[13] *= a.modelPartScale;
        b[14] *= a.modelPartScale
    } else
        Matrix.copy(b, g)
}
    ;
Animation.prototype.isVisibleAtFramePercent = function (a, c) {
    for (var b = a, d = 0, e = 0; 100 > e; e++) {
        d = this.animatedObjects[b];
        if (d.visibleProperty) {
            d.visibleProperty.evaluate(c, 1, d);
            if ("" != d.debugString || "" != d.visibleProperty.debugString)
                return this.debugString += d.debugString,
                    this.debugString += d.visibleProperty.debugString,
                    !1;
            if (0 == d.visibleProperty.lastValue)
                return !1
        }
        b == d.parentIndex && (e = 100);
        b = d.parentIndex
    }
    return !0
}
    ;
Animation.prototype.getWorldTransform = function (a, c, b, d, e) {
    a = this.animatedObjects[a];
    if (a.useFixedWorldTransform)
        Matrix.copy(b, a.cachedWorldTransform0);
    else {
        var f = this.getObjectAnimationFramePercent(a, c)
            , g = Matrix.identity();
        a.evaluateLocalTransformAtFramePercent(f, g, !0, e);
        if (f = a.modelPartIndex != a.id) {
            var f = Matrix.identity()
                , h = Matrix.identity();
            Matrix.copy(h, g);
            this.getAnimatedLocalTransform(a.id, c, f);
            Matrix.mul(g, f, h)
        }
        Matrix.copy(b, g);
        if (a.parentIndex != a.id)
            for (var k = a.parentIndex, n = 0; 100 > n; n++)
                a = this.animatedObjects[k],
                    f = this.getObjectAnimationFramePercent(a, c),
                    g = Matrix.identity(),
                    a.evaluateLocalTransformAtFramePercent(f, g, !0, e),
                    (f = a.modelPartIndex != a.id) ? (f = Matrix.identity(),
                        this.getAnimatedLocalTransform(a.id, c, f),
                        h = Matrix.identity(),
                        Matrix.mul(h, g, b),
                        Matrix.mul(b, f, h)) : (h = Matrix.identity(),
                            Matrix.copy(h, b),
                            Matrix.mul(b, g, h)),
                    k == a.parentIndex && (n = 100),
                    k = a.parentIndex;
        b[12] *= d;
        b[13] *= d;
        b[14] *= d
    }
}
    ;
Animation.prototype.hasParentInHierarchy = function (a, c) {
    for (var b = a.parentIndex, d = 0; 100 > d; d++) {
        a = this.animatedObjects[b];
        if (a.id == c)
            return !0;
        b == a.parentIndex && (d = 100);
        b = a.parentIndex
    }
    return !1
}
    ;
Animation.prototype.hasParentTypeInHierarchy = function (a, c) {
    for (var b = a.parentIndex, d = 0; 100 > d; d++) {
        a = this.animatedObjects[b];
        if (a.sceneObjectType == c)
            return !0;
        b == a.parentIndex && (d = 100);
        b = a.parentIndex
    }
    return !1
}
    ;
Animation.prototype.searchAnimationUpHierarchy = function (a) {
    for (var c = a.id, b = 0; 100 > b; b++) {
        a = this.animatedObjects[c];
        if (a.animatedLocalTransform && (a.hasAnimatedTransform() || a.id != a.modelPartIndex && this.searchAnimationUpHierarchy(this.animatedObjects[a.modelPartIndex])))
            return !0;
        c == a.parentIndex && (b = 100);
        c = a.parentIndex
    }
    return !1
}
    ;
Animation.prototype.hasAnimationInHierarchy = function (a) {
    return this.searchAnimationUpHierarchy(a) || a.id != a.modelPartIndex && this.searchAnimationUpHierarchy(this.animatedObjects[a.modelPartIndex]) || this.hasParentTypeInHierarchy(a, "TurnTableSO") || this.hasParentTypeInHierarchy(a, "CameraSO") || "CameraSO" == a.sceneObjectType ? !0 : !1
}
    ;
Animation.prototype.getObjectAnimationFramePercent = function (a, c) {
    if (0 == this.totalFrames || 0 == a.animationLength)
        return 0;
    if (a.endTime == this.totalSeconds)
        return c * a.modelPartFPS;
    var b = c / a.animationLength
        , b = Math.floor(b);
    c -= a.animationLength * b;
    b = c * a.modelPartFPS;
    b >= a.totalFrames + 1 && (b = a.totalFrames);
    return b
}
    ;
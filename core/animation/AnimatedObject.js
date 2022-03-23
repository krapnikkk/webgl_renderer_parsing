function AnimatedObject(a, c, b) {
    this.name = c.partName;
    this.animatedProperties = [];
    this.sceneObjectType = c.sceneObjectType;
    this.skinningRigIndex = c.skinningRigIndex;
    this.id = b;
    this.mesh = this.skinningRig = 0;
    this.materialIndex = this.lightIndex = this.meshIndex = -1;
    this.emissiveProperty = this.offsetVProperty = this.offsetUProperty = this.material = 0;
    this.debugMe = c.debugMe;
    this.debugString = "";
    this.hasTransform = !1;
    this.modelPartIndex = c.modelPartIndex;
    this.modelPartFPS = c.modelPartFPS;
    this.modelPartScale = c.modelPartScale;
    this.parentIndex = c.parentIndex;
    this.startTime = c.startTime;
    this.endTime = c.endTime;
    this.animationLength = this.endTime - this.startTime;
    this.totalFrames = c.totalFrames;
    this.pivot = Vect.empty();
    this.pivot.x = 0;
    this.pivot.y = 0;
    this.pivot.z = 0;
    c.pivotx && (this.pivot.x = c.pivotx);
    c.pivoty && (this.pivot.y = c.pivoty);
    c.pivotz && (this.pivot.z = c.pivotz);
    this.turnTableSpinOffset = this.turnTableSpin = this.spinProperty = this.dispersionProperty = this.lightIllumProperty = this.skyIllumProperty = this.opacityProperty = this.spotSharpnessProperty = this.spotAngleProperty = this.distanceProperty = this.brightnessProperty = this.blueProperty = this.greenProperty = this.redProperty = this.visibleProperty = 0;
    if (c.animatedProperties) {
        b = c.animatedProperties.length;
        for (var d = 0; d < b; ++d) {
            var e = c.animatedProperties[d]
                , f = new AnimatedProperty;
            f.name = e.name;
            this.animatedProperties.push(f);
            "Red" != f.name || this.redProperty || (this.redProperty = f);
            "Green" != f.name || this.greenProperty || (this.greenProperty = f);
            "Blue" != f.name || this.blueProperty || (this.blueProperty = f);
            "Brightness" != f.name || this.brightnessProperty || (this.brightnessProperty = f);
            "Distance" != f.name || this.distanceProperty || (this.distanceProperty = f);
            "Spot Angle" != f.name || this.spotAngleProperty || (this.spotAngleProperty = f);
            "Spot Sharpness" != f.name || this.spotSharpnessProperty || (this.spotSharpnessProperty = f);
            "Opacity" != f.name || this.opacityProperty || (this.opacityProperty = f);
            "Sky Illumination" != f.name || this.skyIllumProperty || (this.skyIllumProperty = f);
            "Light Illumination" != f.name || this.lightIllumProperty || (this.lightIllumProperty = f);
            "Dispersion" != f.name || this.dispersionProperty || (this.dispersionProperty = f);
            "Visible" != f.name || this.visibleProperty || (this.visibleProperty = f);
            "Spin Rate" == f.name && (this.spinProperty = f);
            "OffsetU" == f.name && (this.offsetUProperty = f);
            "OffsetV" == f.name && (this.offsetVProperty = f);
            "EmissiveIntensity" == f.name && (this.emissiveProperty = f)
        }
    }
    this.keyframesSharedBufferUShorts = this.keyframesSharedBufferFloats = this.keyFramesByteStream = 0;
    if (a = a.get(c.file))
        this.keyFramesByteStream = new ByteStream(a.data),
            this.unPackKeyFrames();
    this.animatedLocalTransform = new AnimatedTransform(this);
    this.hasTransform = this.animatedLocalTransform.hasTranslation || this.animatedLocalTransform.hasRotation || this.animatedLocalTransform.hasScale;
    this.cachedWorldTransform0 = Matrix.identity();
    this.cachedWorldTransform1 = Matrix.identity();
    this.cachedWorldTransform2 = Matrix.identity();
    this.cachedWorldTransform3 = Matrix.identity();
    this.cachedFrame3 = this.cachedFrame2 = this.cachedFrame1 = this.cachedFrame0 = -10;
    this.cachedFrameUse3 = this.cachedFrameUse2 = this.cachedFrameUse1 = this.cachedFrameUse0 = 0;
    this.useFixedLocalTransform = this.useFixedWorldTransform = !1
}
AnimatedObject.prototype.setFixedWorldTransform = function (a) {
    this.useFixedWorldTransform = !0;
    Matrix.copy(this.cachedWorldTransform0, a)
}
    ;
AnimatedObject.prototype.setFixedLocalTransform = function (a) {
    this.useFixedLocalTransform = !0;
    this.animatedLocalTransform.lockTransform = !0;
    Matrix.copy(this.animatedLocalTransform.cachedmatrix0, a)
}
    ;
AnimatedObject.prototype.getCachedWorldTransform = function (a) {
    return this.useFixedWorldTransform ? 0 : a == this.cachedFrame0 ? this.cachedmatrix0 : a == this.cachedFrame1 ? this.cachedmatrix1 : a == this.cachedFrame2 ? this.cachedmatrix2 : a == this.cachedFrame3 ? this.cachedmatrix3 : 0
}
    ;
AnimatedObject.prototype.getFreeCachedWorldTransform = function (a) {
    if (this.useFixedWorldTransform)
        return 0;
    this.cachedFrameUse0--;
    this.cachedFrameUse1--;
    this.cachedFrameUse2--;
    this.cachedFrameUse3--;
    if (this.cachedFrameUse0 <= this.cachedFrameUse1 && this.cachedFrameUse0 <= this.cachedFrameUse2 && this.cachedFrameUse0 <= this.cachedFrameUse3)
        return this.cachedFrame0 = a,
            this.cachedFrameUse0 = 0,
            this.cachedWorldTransform0;
    if (this.cachedFrameUse1 <= this.cachedFrameUse0 && this.cachedFrameUse1 <= this.cachedFrameUse2 && this.cachedFrameUse1 <= this.cachedFrameUse3)
        return this.cachedFrame1 = a,
            this.cachedFrameUse1 = 0,
            this.cachedWorldTransform1;
    if (this.cachedFrameUse2 <= this.cachedFrameUse0 && this.cachedFrameUse2 <= this.cachedFrameUse1 && this.cachedFrameUse2 <= this.cachedFrameUse3)
        return this.cachedFrame2 = a,
            this.cachedFrameUse2 = 0,
            this.cachedWorldTransform2;
    this.cachedFrame3 = a;
    this.cachedFrameUse3 = 0;
    return this.cachedWorldTransform3
}
    ;
AnimatedObject.prototype.unPackKeyFrames = function () {
    if (this.keyFramesByteStream) {
        var a = new Float32Array(this.keyFramesByteStream.bytes.buffer)
            , c = new Uint32Array(this.keyFramesByteStream.bytes.buffer)
            , b = new Uint16Array(this.keyFramesByteStream.bytes.buffer)
            , d = new Uint8Array(this.keyFramesByteStream.bytes.buffer);
        this.keyframesSharedBufferFloats = a;
        this.keyframesSharedBufferUShorts = c;
        for (var a = 0, c = c[0], a = 1 + c, c = this.animatedProperties.length, e = 0; e < c; e++) {
            var f = this.animatedProperties[e]
                , g = 2 + 2 * e
                , h = 2 * g;
            f.keyframeBufferStartIndexFloat = a;
            f.numKeyframes = b[g];
            f.keyframePackingType = d[h + 2];
            f.interpolationType = d[h + 3];
            f.indexFloatSkip = 0;
            f.indexUShortSkip = 0;
            0 < f.numKeyframes && (0 == f.keyframePackingType ? (f.bytesPerKeyFrame = 16,
                f.indexFloatSkip = 4,
                f.indexUShortSkip = 8,
                f.valueOffsetFloat = 0,
                f.weighInOffsetFloat = 1,
                f.weighOutOffsetFloat = 2,
                f.frameIndexOffsetUShort = 6,
                f.interpolationOffsetUShort = 7) : 1 == f.keyframePackingType ? (f.bytesPerKeyFrame = 8,
                    f.indexFloatSkip = 2,
                    f.indexUShortSkip = 4,
                    f.valueOffsetFloat = 0,
                    f.weighInOffsetFloat = 0,
                    f.weighOutOffsetFloat = 0,
                    f.frameIndexOffsetUShort = 2,
                    f.interpolationOffsetUShort = 3) : 2 == f.keyframePackingType && (f.bytesPerKeyFrame = 4,
                        f.indexFloatSkip = 1,
                        f.indexUShortSkip = 2,
                        f.valueOffsetFloat = 0,
                        f.weighInOffsetFloat = 0,
                        f.weighOutOffsetFloat = 0,
                        f.frameIndexOffsetUShort = 0,
                        f.interpolationOffsetUShort = 0));
            a += f.numKeyframes * f.indexFloatSkip
        }
    }
}
    ;
AnimatedObject.prototype.setupSkinningRig = function (a, c, b, d) {
    var e = Matrix.identity()
        , f = Matrix.identity()
        , g = a.animatedObjects[c]
        , h = b * g.modelPartFPS
        , h = h - Math.floor(h);
    b = Math.floor(a.getObjectAnimationFramePercent(g, b));
    var g = b + 1
        , k = 1 - h
        , n = d.skinningClusters.length;
    if (0 < n)
        for (var m = 0; m < n; m++) {
            var l = d.skinningClusters[m];
            l.solveClusterTransformAtFrame(a, c, b, e);
            l.solveClusterTransformAtFrame(a, c, g, f);
            for (var l = l.matrix, p = 0; 16 > p; p++)
                l[p] = e[p] * k + f[p] * h
        }
}
    ;
AnimatedObject.prototype.evaluateLocalTransformAtFramePercent = function (a, c, b, d) {
    if (this.useFixedLocalTransform)
        Matrix.copy(c, this.animatedLocalTransform.cachedmatrix0);
    else {
        var e = 0;
        d && (e = this.animatedLocalTransform.getCachedTransform(a));
        e ? Matrix.copy(c, e) : ((e = this.animatedLocalTransform.getFreeCachedTransform(a)) ? (this.animatedLocalTransform.evaluateMatrix(e, this.totalFrames, a, b),
            Matrix.copy(c, e)) : this.animatedLocalTransform.evaluateMatrix(c, this.totalFrames, a, b),
            0 != this.turnTableSpin && (a = Matrix.rotation(Matrix.empty(), this.turnTableSpin, 1),
                Matrix.mul(c, c, a)),
            c[12] -= c[0] * this.pivot.x + c[4] * this.pivot.y + c[8] * this.pivot.z,
            c[13] -= c[1] * this.pivot.x + c[5] * this.pivot.y + c[9] * this.pivot.z,
            c[14] -= c[2] * this.pivot.x + c[6] * this.pivot.y + c[10] * this.pivot.z,
            c[15] -= c[3] * this.pivot.x + c[7] * this.pivot.y + c[11] * this.pivot.z)
    }
}
    ;
AnimatedObject.prototype.hasAnimatedTransform = function () {
    var a = this.animatedLocalTransform;
    return a.TX && 1 < a.TX.numKeyframes || a.TY && 1 < a.TY.numKeyframes || a.TZ && 1 < a.TZ.numKeyframes || a.RX && 1 < a.RX.numKeyframes || a.RY && 1 < a.RY.numKeyframes || a.RZ && 1 < a.RZ.numKeyframes || a.SX && 1 < a.SX.numKeyframes || a.SY && 1 < a.SY.numKeyframes || a.SZ && 1 < a.SZ.numKeyframes ? !0 : !1
};
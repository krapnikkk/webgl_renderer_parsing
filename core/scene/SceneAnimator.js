function SceneAnimator(a, c, b) {
    this.scene = a;
    this.animations = [];
    this.skinningRigs = [];
    this.meshIDs = [];
    this.lightIDs = [];
    this.materialIDs = [];
    this.views = [];
    this.viewYawOffsets = [];
    this.viewPitchOffsets = [];
    this.cameraObjectIndices = [];
    this.cameraChildrenIndices = [];
    this.subMeshObjectIndices = [];
    this.subMeshLiveIndices = [];
    this.scene = a;
    this.selectedCameraIndex = -1;
    this.selectedAnimationIndex = 0;
    this.debugString = "";
    this.scenePlaybackSpeed = this.playbackSpeed = 1;
    this.animationProgress = this.totalSeconds = 0;
    this.paused = this.autoAdvanceNextAnimation = !1;
    this.animateVisibility = this.drawAnimated = this.linkSceneObjects = this.loadSkinningRigs = this.animateMaterials = this.animateTurntables = this.enableSkinning = this.animateMeshes = this.animateLights = this.playAnimations = this.loadAnimations = !0;
    this.showDebugInfo = !1;
    this.loopCount = 0;
    this.loopTurntables = this.lockPlayback = !1;
    this.fogObjectIndex = -1;
    this.unitScaleSkinnedMeshes = !0;
    this.sceneScale = b.sceneScale;
    this.defaultCameraGlobalIndex = b.selectedCamera;
    this.selectedAnimationIndex = b.selectedAnimation;
    this.autoPlayAnims = b.autoPlayAnims;
    this.showPlayControls = b.showPlayControls;
    b.scenePlaybackSpeed && (this.scenePlaybackSpeed = b.scenePlaybackSpeed,
        0 == this.scenePlaybackSpeed && (this.scenePlaybackSpeed = 1));
    this.autoPlayAnims || (this.paused = !0);
    if (this.loadAnimations) {
        if (b.meshIDs)
            for (var d = b.meshIDs.length, e = 0; e < d; ++e) {
                var f = b.meshIDs[e].partIndex;
                this.meshIDs.push(f)
            }
        if (b.lightIDs)
            for (d = b.lightIDs.length,
                e = 0; e < d; ++e)
                f = b.lightIDs[e],
                    f = f.partIndex,
                    this.lightIDs.push(f);
        if (b.materialIDs)
            for (d = b.materialIDs.length,
                e = 0; e < d; ++e)
                f = b.materialIDs[e],
                    f = f.partIndex,
                    this.materialIDs.push(f);
        this.numMatricesInTable = b.numMatrices;
        e = c.get("MatTable.bin");
        f = new ByteStream(e.data);
        e || (this.numMatricesInTable = 0,
            this.debugString += "<br>No mattable?");
        if (b.skinningRigs && this.loadSkinningRigs)
            for (d = b.skinningRigs.length,
                e = 0; e < d; ++e) {
                var g = new SkinningRig(c, b.skinningRigs[e], f);
                "" == g.debugString ? this.skinningRigs.push(g) : (this.debugString += "<br>Error loading skinning rig " + e + " :" + g.debugString,
                    this.debugString += "<br>Skipping the rest",
                    e = d)
            }
        if (b.animations)
            for (f = b.animations.length,
                e = 0; e < f; ++e)
                d = new Animation(c, b.animations[e]),
                    this.animations.push(d);
        this.startMS = Date.now();
        f = this.animations.length;
        if (this.linkSceneObjects && 0 != f) {
            for (e = 0; e < f; e++)
                for (c = this.animations[e],
                    d = c.animatedObjects.length,
                    b = 0; b < d; b++)
                    g = c.animatedObjects[b],
                        "LightSO" == g.sceneObjectType && (g.lightIndex = this.findLightIndexByPartIndex(b),
                            -1 != g.lightIndex ? c.lightObjects.push(g) : this.debugString += "<br> got light not in scene " + g.name),
                        "FogSO" == g.sceneObjectType && (this.fogObjectIndex = b),
                        "SubMeshSO" == g.sceneObjectType && 0 == e && (this.subMeshObjectIndices.push(b),
                            this.subMeshLiveIndices.push(-1)),
                        "Material" == g.sceneObjectType && (g.materialIndex = this.findMaterialIndexByPartIndex(b),
                            -1 == g.materialIndex ? this.debugString += "<br> can't find material index for object " + b : c.materialObjects.push(g)),
                        "TurnTableSO" == g.sceneObjectType && c.turnTableObjects.push(g),
                        "MeshSO" == g.sceneObjectType && (g.meshIndex = this.findMeshIndexByPartIndex(this.scene.meshes, b),
                            -1 == g.meshIndex ? (this.debugString += "<br> can't find mesh index for object " + b,
                                this.logObjectInfo(b, 0)) : (c.meshObjects.push(g),
                                    g.mesh = this.scene.meshes[g.meshIndex],
                                    -1 != g.skinningRigIndex && g.mesh && g.skinningRigIndex < this.skinningRigs.length && (g.skinningRig = this.skinningRigs[g.skinningRigIndex],
                                        g.skinningRig.isRigidSkin || (g.mesh.dynamicVertexData ? g.skinningRig.useOriginalMeshVertices(g.mesh) : (this.debugString += "Skinning object - but mesh is not dynamic",
                                            this.debugString += "<br>Rig index " + g.skinningRigIndex,
                                            this.debugString += " not tagged as rigid"))))),
                        "CameraSO" == g.sceneObjectType && c.cameraObjects.push(g);
            c = this.animations[0];
            b = c.cameraObjects.length;
            for (e = 0; e < b; e++)
                if (f = c.cameraObjects[e],
                    d = this.scene.cameras[f.name]) {
                    if (d = d.view)
                        d = new View(d),
                            this.cameraObjectIndices.push(f.id),
                            this.views.push(d),
                            this.viewYawOffsets.push(0),
                            this.viewPitchOffsets.push(0)
                } else
                    this.debugString += "<br>no camDesc for " + f.name,
                        this.views.push(a.view);
            a = this.scene.meshes.length;
            f = this.subMeshObjectIndices.length;
            for (e = d = 0; e < a; e++)
                for (g = this.scene.meshes[e],
                    b = 0; b < f; b++) {
                    var h = this.subMeshObjectIndices[b]
                        , k = c.animatedObjects[h]
                        , n = c.animatedObjects[k.parentIndex];
                    n.mesh || (this.debugString += "<br>submesh parent object has no mesh?",
                        this.debugString += "<br>obj.name " + k.name,
                        this.debugString += "<br>parent.name " + n.name,
                        this.debugString += "<br>submesh index " + b,
                        this.debugString += "<br>obj.index " + h);
                    if (n.mesh == g) {
                        for (h = 0; h < g.numSubMeshes; h++)
                            this.subMeshLiveIndices[b + (g.numSubMeshes - 1 - h)] = d,
                                d++;
                        b = f
                    }
                }
            for (e = 0; e < f; e++)
                -1 == this.subMeshLiveIndices[e] && (this.debugString += "<br>Missing mesh? Unused submesh " + e + " of " + f);
            this.showDebugInfo = this.stopEverything = this.runDebugMode = !1;
            this.selectDefaultCamera();
            this.findCameraChildren();
            this.findFixedTransforms();
            this.runDebugMode && (this.setAnimationProgress(0, !0),
                "" != this.debugString ? this.stopEverything = !0 : this.checkDebug())
        }
    } else
        this.debugString += "<br>Skip loading animation data"
}
SceneAnimator.prototype.logTimes = function () {
    this.debugString += "<br>Times";
    var a = this.animations[0]
        , c = a.animatedObjects.length;
    this.debugString += "<br>Animation totalSeconds " + a.totalSeconds;
    this.debugString += "<br>Animation totalFrames " + a.totalFrames;
    this.debugString += "<br>Animation totalObjects " + c;
    for (var b = 0; b < c; b++) {
        var d = a.animatedObjects[b];
        this.debugString += "<br>Object: " + b;
        this.debugString += " End: " + d.endTime;
        this.debugString += " Length: " + d.animationLength;
        this.debugString += " Frames: " + d.totalFrames
    }
}
    ;
SceneAnimator.prototype.flagAllForDebugging = function () {
    for (var a = this.animations.length, c = 0; c < a; c++)
        for (var b = this.animations[c], d = b.animatedObjects.length, e = 0; e < d; e++)
            b.animatedObjects[e].debugMe = !0
}
    ;
SceneAnimator.prototype.checkDebug = function () {
    this.debugString = "<br>--------------------------------------Debug Info:";
    this.debugString += "<br>this.selectedAnimationIndex :" + this.selectedAnimationIndex;
    var a = this.animations[this.selectedAnimationIndex]
        , c = a.animatedObjects.length;
    this.debugString += "<br>numAnimatedObjects :" + c;
    "" != a.debugString && (this.debugString += "<br>--------------------------------------------------Got animation bug info:",
        this.debugString += a.debugString,
        this.showDebugInfo = this.stopEverything = !0,
        a.debugString = "");
    for (var b = 0; b < c; b++) {
        var d = a.animatedObjects[b];
        if ("" != d.debugString || "" != d.animatedLocalTransform.debugString)
            this.debugString += "<br>--------------------------------------------------Got object bug info:",
                this.debugString += d.debugString,
                this.debugString += d.animatedLocalTransform.debugString,
                this.showDebugInfo = this.stopEverything = !0,
                d.debugString = "",
                d.animatedLocalTransform.debugString = "";
        d.skinningRig && "" != d.skinningRig.debugString && (this.debugString += "<br>--------------------------------------------------Got skin rig info:",
            this.debugString += d.skinningRig.debugString,
            d.skinningRig.debugString = "",
            this.showDebugInfo = this.stopEverything = !0)
    }
    this.debugString += "<br>--------------------------------------Done Debug Info:"
}
    ;
SceneAnimator.prototype.logObjectInfo = function (a, c) {
    var b = this.animations[this.selectedAnimationIndex]
        , d = c * b.originalFPS;
    if (a >= b.animatedObjects.length)
        this.debugString += "object index " + a + " exceeds " + b.animatedObjects.length;
    else {
        var e = b.animatedObjects[a]
            , f = b.animatedObjects[e.modelPartIndex]
            , g = b.getObjectAnimationFramePercent(e, c)
            , h = b.getObjectAnimationFramePercent(f, c);
        this.debugString = "";
        this.debugString += "<br>Object Name: " + e.name;
        this.debugString += "<br>Object Type: " + e.sceneObjectType;
        this.debugString += "<br>Object Index: " + e.id;
        this.debugString += "<br>Part Index: " + e.modelPartIndex;
        this.debugString += "<br>Part Scale: " + e.modelPartScale;
        this.debugString += "<br>Mesh Index: " + e.meshIndex;
        this.debugString += "<br>Light Index: " + e.lightIndex;
        this.debugString += "<br>Deformer Index: " + e.skinningRigIndex;
        this.debugString += "<br>Parent Index: " + e.parentIndex;
        this.debugString += "<br>Scene time " + c;
        this.debugString += "<br>Scene framepercent " + d;
        this.debugString += "<br>Object looped framepercent " + g;
        this.debugString += "<br>Model  looped framepercent " + h;
        this.debugString += "<br>Object Anim length " + e.animationLength;
        this.debugString += "<br>Object Total frames " + e.totalFrames;
        this.debugString += "<br>Object FPS " + e.modelPartFPS;
        this.debugString += "<br>Model Part Anim length " + f.animationLength;
        this.debugString += "<br>Model total frames " + f.totalFrames;
        this.debugString += "<br>Model Part FPS " + f.modelPartFPS;
        d = Matrix.identity();
        b.getWorldTransform(e.id, c, d, this.sceneScale, !0);
        this.debugString += e.debugString;
        var b = d[0]
            , e = d[1]
            , f = d[2]
            , g = d[4]
            , h = d[5]
            , k = d[6]
            , n = d[8]
            , m = d[9]
            , d = d[10];
        Math.sqrt(b * b + e * e + f * f);
        Math.sqrt(g * g + h * h + k * k);
        Math.sqrt(n * n + m * m + d * d)
    }
}
    ;
SceneAnimator.prototype.resetPlayback = function () {
    this.startMS = Date.now();
    this.animationProgress = this.totalSeconds = 0;
    this.setAnimationProgress(0, !0)
}
    ;
SceneAnimator.prototype.pause = function (a) {
    this.paused = a;
    this.startMS = Date.now() - 1E3 * this.totalSeconds / (this.playbackSpeed * this.scenePlaybackSpeed)
}
    ;
SceneAnimator.prototype.setAnimationProgress = function (a, c) {
    var b = this.animations[this.selectedAnimationIndex];
    this.animationProgress = a;
    this.totalSeconds = b.totalSeconds * this.animationProgress;
    this.totalSeconds -= 1 / b.originalFPS;
    0 > this.totalSeconds && (this.totalSeconds = 0);
    this.startMS = Date.now() - 1E3 * this.totalSeconds / (this.playbackSpeed * this.scenePlaybackSpeed);
    c && this.updateScene()
}
    ;
SceneAnimator.prototype.setPlaybackSpeed = function (a) {
    this.playbackSpeed = a;
    this.startMS = Date.now() - 1E3 * this.totalSeconds / (this.playbackSpeed * this.scenePlaybackSpeed)
}
    ;
SceneAnimator.prototype.resetCustomView = function () {
    0 <= this.selectedCameraIndex && this.selectedCameraIndex < this.views.length && (this.viewYawOffsets[this.selectedCameraIndex] = 0,
        this.viewPitchOffsets[this.selectedCameraIndex] = 0,
        this.scene.view.rotation[1] = this.views[this.selectedCameraIndex].rotation[1],
        this.scene.view.rotation[0] = this.views[this.selectedCameraIndex].rotation[0],
        this.setViewFromSelectedCamera())
}
    ;
SceneAnimator.prototype.updateUserCamera = function () {
    this.clearCacheForCameraChildren();
    if (0 <= this.selectedCameraIndex && this.selectedCameraIndex < this.views.length && this.selectedAnimationIndex < this.animations.length) {
        var a = this.cameraObjectIndices[this.selectedCameraIndex]
            , c = this.animations[this.selectedAnimationIndex];
        if (a < c.animatedObjects.length) {
            var b = this.views[this.selectedCameraIndex]
                , d = this.scene.view.rotation[1]
                , e = this.scene.view.rotation[0]
                , f = e - b.rotation[0];
            this.viewYawOffsets[this.selectedCameraIndex] = d - b.rotation[1];
            this.viewPitchOffsets[this.selectedCameraIndex] = f;
            b = c.animatedObjects[a];
            c.getObjectAnimationFramePercent(b, this.totalSeconds);
            var f = Matrix.identity()
                , g = Matrix.identity();
            b.useFixedWorldTransform = !1;
            b.useFixedLocalTransform = !1;
            b.animatedLocalTransform.lockTransform = !1;
            b.animatedLocalTransform.clearCachedTransforms();
            b.cachedFrame0 = -1;
            b.cachedFrame1 = -1;
            b.cachedFrame2 = -1;
            b.cachedFrame3 = -1;
            b.cachedFrameUse0 = 0;
            b.cachedFrameUse1 = 0;
            b.cachedFrameUse2 = 0;
            b.cachedFrameUse3 = 0;
            c.getWorldTransform(a, this.totalSeconds, g, this.sceneScale, !1);
            var a = g[0]
                , h = g[1]
                , k = g[2]
                , n = g[4]
                , m = g[5]
                , l = g[6]
                , p = g[8]
                , r = g[9]
                , s = g[10]
                , a = Math.sqrt(a * a + h * h + k * k)
                , n = Math.sqrt(n * n + m * m + l * l)
                , m = Math.sqrt(p * p + r * r + s * s)
                , l = -(this.scene.view.pivot[0] - g[12])
                , h = -(this.scene.view.pivot[1] - g[13])
                , g = -(this.scene.view.pivot[2] - g[14]);
            0 >= l * p + h * r + g * s && (d += 180);
            d = Matrix.rotation(Matrix.empty(), d, 1);
            e = Matrix.rotation(Matrix.empty(), e, 0);
            Matrix.mul(f, d, e);
            e = Math.sqrt(l * l + h * h + g * g);
            d = this.scene.view.pivot[1] + f[9] * e;
            g = this.scene.view.pivot[2] + f[10] * e;
            f[12] = this.scene.view.pivot[0] + f[8] * e;
            f[13] = d;
            f[14] = g;
            e = Matrix.identity();
            c.getWorldTransform(b.parentIndex, this.totalSeconds, e, this.sceneScale, !1);
            c = Matrix.identity();
            Matrix.invert(c, e);
            e = Matrix.identity();
            Matrix.mul(e, c, f);
            e[12] /= this.sceneScale;
            e[13] /= this.sceneScale;
            e[14] /= this.sceneScale;
            f[0] *= a;
            f[1] *= a;
            f[2] *= a;
            f[4] *= n;
            f[5] *= n;
            f[6] *= n;
            f[8] *= m;
            f[9] *= m;
            f[10] *= m;
            b.setFixedWorldTransform(f);
            b.setFixedLocalTransform(e)
        }
    }
}
    ;
SceneAnimator.prototype.setViewFromSelectedCamera = function () {
    if (0 <= this.selectedCameraIndex && this.selectedCameraIndex < this.views.length) {
        var a = this.views[this.selectedCameraIndex]
            , c = this.scene.view
            , b = this.viewYawOffsets[this.selectedCameraIndex]
            , d = this.viewPitchOffsets[this.selectedCameraIndex];
        c.pivot[0] = a.pivot[0];
        c.pivot[1] = a.pivot[1];
        c.pivot[2] = a.pivot[2];
        c.rotation[0] = a.rotation[0] + d;
        c.rotation[1] = a.rotation[1] + b;
        c.radius = a.radius;
        c.nearPlane = a.nearPlane;
        c.fov = a.fov;
        c.limits = a.limits;
        c.saveResetView();
        c.updateProjection();
        c.updateView()
    }
}
    ;
SceneAnimator.prototype.selectDefaultCamera = function () {
    if (-1 != this.defaultCameraGlobalIndex && 0 < this.animations.length)
        for (var a = this.animations[0], c = a.cameraObjects.length, b = 0; b < c; b++)
            if (a.cameraObjects[b].id == this.defaultCameraGlobalIndex) {
                this.selectedCameraIndex = b;
                return
            }
    this.selectedCameraIndex = 0
}
    ;
SceneAnimator.prototype.updateAnimationPlayback = function () {
    if (!this.stopEverything || !this.runDebugMode) {
        var a = this.animations[this.selectedAnimationIndex];
        this.updateUserCamera();
        if (this.paused || !this.playAnimations)
            this.startMS = 0 < this.playbackSpeed ? Date.now() - 1E3 * this.totalSeconds / (this.playbackSpeed * this.scenePlaybackSpeed) : Date.now() - 1E3 * this.totalSeconds,
                this.refreshTransformsOnly(),
                this.runDebugMode && this.checkDebug(),
                a = this.scene.view,
                a.saveResetView(),
                a.updateProjection(),
                a.updateView();
        else {
            this.lockPlayback && 0 < this.playbackSpeed && (this.startMS = Date.now() - 1E3 * this.totalSeconds / (this.playbackSpeed * this.scenePlaybackSpeed));
            var c = (Date.now() - this.startMS) / 1E3 * this.playbackSpeed * this.scenePlaybackSpeed;
            this.totalSeconds = (Date.now() - this.startMS) / 1E3 * this.playbackSpeed * this.scenePlaybackSpeed;
            var b = c / a.totalSeconds
                , c = Math.floor(b)
                , b = b - c;
            c != this.loopCount && (this.loopCount++,
                this.loopTurntables && this.rolloverTurntables(),
                this.autoAdvanceNextAnimation && (this.nextAnimation(),
                    this.resetPlayback()));
            this.totalSeconds = a.totalSeconds * b;
            this.animationProgress = this.totalSeconds / a.totalSeconds - Math.floor(this.totalSeconds / a.totalSeconds);
            this.updateScene();
            this.runDebugMode && this.checkDebug()
        }
    }
}
    ;
SceneAnimator.prototype.updateScene = function () {
    this.lastSceneFramePercent = this.totalSeconds * this.animations[this.selectedAnimationIndex].originalFPS;
    0 != this.fogObjectIndex && this.updateFog();
    this.animateTurntables && this.updateTurntables();
    this.animateMeshes && this.poseMeshes();
    this.animateLights && this.updateLights();
    this.animateMaterials && this.updateMaterials();
    this.animateVisibility && this.updateVisibility()
}
    ;
SceneAnimator.prototype.findCameraChildren = function () {
    for (var a = this.animations[0], c = a.animatedObjects.length, b = 0; b < c; b++)
        a.hasParentTypeInHierarchy(a.animatedObjects[b], "CameraSO") && this.cameraChildrenIndices.push(b)
}
    ;
SceneAnimator.prototype.findFixedTransforms = function () {
    for (var a = this.animations.length, c = 0; c < a; c++)
        for (var b = this.animations[c], d = b.animatedObjects.length, e = 0; e < d; e++) {
            var f = b.animatedObjects[e];
            if (!f.useFixedWorldTransform && !b.hasAnimationInHierarchy(f))
                if ("Material" == f.sceneObjectType)
                    f.setFixedWorldTransform(Matrix.identity()),
                        f.setFixedLocalTransform(Matrix.identity());
                else {
                    var g = Matrix.identity()
                        , h = Matrix.identity();
                    b.hasParentTypeInHierarchy(f, "SceneRootSO") ? (b.getWorldTransform(f.id, 0, g, this.sceneScale, !1),
                        f.evaluateLocalTransformAtFramePercent(0, h, !0, !1)) : (b.evaluateModelPartTransformAtFrame(f.id, 0, g, !1),
                            f.evaluateLocalTransformAtFramePercent(0, h, !1, !1));
                    f.setFixedWorldTransform(g);
                    f.setFixedLocalTransform(h)
                }
        }
}
    ;
SceneAnimator.prototype.clearCacheForCameraChildren = function () {
    for (var a = this.animations[this.selectedAnimationIndex], c = this.cameraChildrenIndices.length, b = 0; b < c; b++) {
        var d = a.animatedObjects[this.cameraChildrenIndices[b]];
        d.useFixedWorldTransform = !1;
        d.useFixedLocalTransform = !1;
        d.cachedFrame0 = -10;
        d.cachedFrame1 = -10;
        d.cachedFrame2 = -10;
        d.cachedFrame3 = -10;
        d.cachedFrameUse0 = 0;
        d.cachedFrameUse1 = 0;
        d.cachedFrameUse2 = 0;
        d.cachedFrameUse3 = 0;
        d.animatedLocalTransform.clearCachedTransforms();
        d.animatedLocalTransform.lockTransform = !1
    }
}
    ;
SceneAnimator.prototype.refreshTransformsOnly = function () {
    for (var a = this.animations[this.selectedAnimationIndex], c = a.meshObjects.length, b = 0; b < c; b++) {
        var d = a.meshObjects[b];
        a.getWorldTransform(d.id, this.totalSeconds, d.mesh.displayMatrix, this.sceneScale, !0);
        if (this.enableSkinning && d.skinningRig && this.unitScaleSkinnedMeshes && !d.skinningRig.isRigidSkin) {
            var d = d.mesh.displayMatrix
                , e = d[0]
                , f = d[1]
                , g = d[2]
                , h = d[4]
                , k = d[5]
                , n = d[6]
                , m = d[8]
                , l = d[9]
                , p = d[10]
                , e = Math.sqrt(e * e + f * f + g * g)
                , h = Math.sqrt(h * h + k * k + n * n)
                , m = Math.sqrt(m * m + l * l + p * p)
                , m = (e + h + m) / 2;
            d[0] /= m;
            d[1] /= m;
            d[2] /= m;
            d[4] /= m;
            d[5] /= m;
            d[6] /= m;
            d[8] /= m;
            d[9] /= m;
            d[10] /= m
        }
    }
    if (this.animateLights)
        for (c = a.lightObjects.length,
            b = 0; b < c; b++)
            d = a.lightObjects[b],
                d.useFixedWorldTransform || (m = this.scene.lights.getLightPos(d.lightIndex),
                    l = this.scene.lights.getLightDir(d.lightIndex),
                    p = Matrix.identity(),
                    a.getWorldTransform(d.id, this.totalSeconds, p, this.sceneScale, !0),
                    l[0] = p[8],
                    l[1] = p[9],
                    l[2] = p[10],
                    0 != m[3] ? (m[0] = p[12],
                        m[1] = p[13],
                        m[2] = p[14],
                        this.scene.lights.setLightPos(d.lightIndex, m)) : this.scene.lights.setLightPos(d.lightIndex, l),
                    this.scene.lights.setLightDir(d.lightIndex, l))
}
    ;
SceneAnimator.prototype.findMeshIndexByPartIndex = function (a, c) {
    for (var b = 0; b < this.meshIDs.length; ++b)
        if (c == this.meshIDs[b])
            return b;
    return -1
}
    ;
SceneAnimator.prototype.findLightIndexByPartIndex = function (a) {
    for (var c = 0; c < this.lightIDs.length; c++)
        if (a == this.lightIDs[c])
            return c;
    return -1
}
    ;
SceneAnimator.prototype.findMaterialIndexByPartIndex = function (a) {
    for (var c = 0; c < this.materialIDs.length; c++)
        if (a == this.materialIDs[c])
            return c;
    return -1
}
    ;
SceneAnimator.prototype.nextAnimation = function () {
    this.selectedAnimationIndex++;
    this.selectedAnimationIndex >= this.animations.length && (this.selectedAnimationIndex = 0)
}
    ;
SceneAnimator.prototype.selectAnimation = function (a) {
    0 <= a && a < this.animations.length && (this.selectedAnimationIndex = a);
    this.paused && this.setAnimationProgress(this.animationProgress, !0)
}
    ;
SceneAnimator.prototype.selectCamera = function (a) {
    -1 != a && this.selectedCameraIndex != a && (this.selectedCameraIndex = a,
        this.setViewFromSelectedCamera())
}
    ;
SceneAnimator.prototype.getAnimatedCamera = function () {
    if (0 <= this.selectedCameraIndex && this.selectedAnimationIndex < this.animations.length) {
        var a = this.animations[this.selectedAnimationIndex];
        if (this.selectedCameraIndex < a.cameraObjects.length)
            return a.cameraObjects[this.selectedCameraIndex]
    }
}
    ;
SceneAnimator.prototype.poseMeshes = function () {
    for (var a = this.animations[this.selectedAnimationIndex], c = a.meshObjects.length, b = 0; b < c; b++) {
        var d = a.meshObjects[b];
        if (this.enableSkinning && d.skinningRig)
            if (d.skinningRig.isRigidSkin)
                a.getWorldTransform(d.id, this.totalSeconds, d.mesh.displayMatrix, this.sceneScale, !0);
            else {
                d.setupSkinningRig(a, d.modelPartIndex, this.totalSeconds, d.skinningRig);
                a.getWorldTransform(d.id, this.totalSeconds, d.mesh.displayMatrix, this.sceneScale, !0);
                var e = d.modelPartScale * this.sceneScale;
                if (this.unitScaleSkinnedMeshes) {
                    var f = d.mesh.displayMatrix
                        , g = f[0]
                        , h = f[1]
                        , k = f[2]
                        , n = f[4]
                        , m = f[5]
                        , l = f[6]
                        , p = f[8]
                        , r = f[9]
                        , s = f[10]
                        , g = Math.sqrt(g * g + h * h + k * k)
                        , n = Math.sqrt(n * n + m * m + l * l)
                        , p = Math.sqrt(p * p + r * r + s * s)
                        , p = (g + n + p) / 2;
                    f[0] /= p;
                    f[1] /= p;
                    f[2] /= p;
                    f[4] /= p;
                    f[5] /= p;
                    f[6] /= p;
                    f[8] /= p;
                    f[9] /= p;
                    f[10] /= p;
                    e *= p
                }
                d.skinningRig.deformMesh(d.mesh, e)
            }
        else
            a.getWorldTransform(d.id, this.totalSeconds, d.mesh.displayMatrix, this.sceneScale, !0)
    }
}
    ;
SceneAnimator.prototype.updateLights = function () {
    for (var a = this.animations[this.selectedAnimationIndex], c = this.totalSeconds * a.originalFPS, b = a.lightObjects.length, d = 0; d < b; d++) {
        var e = a.lightObjects[d]
            , f = this.scene.lights.getLightPos(e.lightIndex)
            , g = this.scene.lights.getLightDir(e.lightIndex)
            , h = this.scene.lights.getLightColor(e.lightIndex)
            , k = Matrix.identity()
            , n = 1;
        e.useFixedWorldTransform || a.getWorldTransform(e.id, this.totalSeconds, k, this.sceneScale, !0);
        e.redProperty && (e.redProperty.evaluate(c, h[0], e),
            h[0] = e.redProperty.lastValue);
        e.greenProperty && (e.greenProperty.evaluate(c, h[1], e),
            h[1] = e.greenProperty.lastValue);
        e.blueProperty && (e.blueProperty.evaluate(c, h[2], e),
            h[2] = e.blueProperty.lastValue);
        e.brightnessProperty && (e.brightnessProperty.evaluate(c, n, e),
            n = e.brightnessProperty.lastValue);
        h[0] *= n;
        h[1] *= n;
        h[2] *= n;
        0 != f[3] ? (e.useFixedWorldTransform || (f[0] = k[12],
            f[1] = k[13],
            f[2] = k[14],
            this.scene.lights.setLightPos(e.lightIndex, f)),
            e.spotAngleProperty && 0 < this.scene.lights.spot[3 * e.lightIndex] && (f = 0,
                e.spotAngleProperty.evaluate(c, f, e),
                f = e.spotAngleProperty.lastValue,
                this.scene.lights.setLightSpotAngle(e.lightIndex, f)),
            e.spotSharpnessProperty && (f = 0,
                e.spotSharpnessProperty.evaluate(c, f, e),
                f = e.spotSharpnessProperty.lastValue,
                this.scene.lights.setLightSpotSharpness(e.lightIndex, f)),
            e.distanceProperty && (f = 1,
                e.distanceProperty.evaluate(c, f, e),
                f = e.distanceProperty.lastValue * this.sceneScale,
                this.scene.lights.setLightDistance(e.lightIndex, f))) : this.scene.lights.setLightPos(e.lightIndex, g);
        e.useFixedWorldTransform || (g[0] = k[8],
            g[1] = k[9],
            g[2] = k[10],
            this.scene.lights.setLightDir(e.lightIndex, g));
        this.scene.lights.setLightColor(e.lightIndex, h)
    }
}
    ;
SceneAnimator.prototype.updateTurntables = function () {
    for (var a = this.animations[this.selectedAnimationIndex], c = this.totalSeconds * a.originalFPS, b = a.turnTableObjects.length, d = 0; d < b; d++) {
        var e = a.turnTableObjects[d];
        e.spinProperty.evaluate(c, 0, e);
        e.turnTableSpin = e.turnTableSpinOffset + e.spinProperty.lastValue * this.totalSeconds
    }
}
    ;
SceneAnimator.prototype.rolloverTurntables = function () {
    for (var a = this.animations[this.selectedAnimationIndex], c = a.turnTableObjects.length, b = 0; b < c; b++) {
        var d = a.turnTableObjects[b];
        d.turnTableSpinOffset = d.turnTableSpin
    }
}
    ;
SceneAnimator.prototype.updateMaterials = function () {
    for (var a = this.animations[this.selectedAnimationIndex], c = this.totalSeconds * a.originalFPS, b = a.materialObjects.length, d = 0; d < b; d++) {
        var e = a.materialObjects[d];
        e.offsetUProperty && (e.offsetUProperty.evaluate(c, 0, e),
            this.scene.materialsList[e.materialIndex].uOffset = e.offsetUProperty.lastValue);
        e.offsetVProperty && (e.offsetVProperty.evaluate(c, 0, e),
            this.scene.materialsList[e.materialIndex].vOffset = e.offsetVProperty.lastValue);
        e.emissiveProperty && 1 < e.emissiveProperty.numKeyframes && (e.emissiveProperty.evaluate(c, 0, e),
            this.scene.materialsList[e.materialIndex].emissiveIntensity = e.emissiveProperty.lastValue)
    }
}
    ;
SceneAnimator.prototype.updateFog = function () {
    var a = this.animations[this.selectedAnimationIndex]
        , c = this.totalSeconds * a.originalFPS;
    0 <= this.fogObjectIndex && this.fogObjectIndex < a.animatedObjects.length && this.scene.fog && (a = a.animatedObjects[this.fogObjectIndex],
        a.redProperty && (this.scene.fog.desc.color[0] = a.redProperty.evaluate(c, this.scene.fog.desc.color[0], a)),
        a.greenProperty && (this.scene.fog.desc.color[1] = a.greenProperty.evaluate(c, this.scene.fog.desc.color[1], a)),
        a.blueProperty && (this.scene.fog.desc.color[2] = a.blueProperty.evaluate(c, this.scene.fog.desc.color[2], a)),
        a.distanceProperty && (this.scene.fog.desc.distance = a.distanceProperty.evaluate(c, this.scene.fog.desc.distance, a)),
        a.opacityProperty && (this.scene.fog.desc.opacity = a.opacityProperty.evaluate(c, this.scene.fog.desc.opacity, a)),
        a.skyIllumProperty && (this.scene.fog.desc.skyIllum = a.skyIllumProperty.evaluate(c, this.scene.fog.desc.skyIllum, a)),
        a.lightIllumProperty && (this.scene.fog.desc.lightIllum = a.lightIllumProperty.evaluate(c, this.scene.fog.desc.lightIllum, a)),
        a.dispersionProperty && (this.scene.fog.desc.dispersion = a.dispersionProperty.evaluate(c, this.scene.fog.desc.dispersion, a)))
}
    ;
SceneAnimator.prototype.updateVisibility = function () {
    for (var a = this.animations[this.selectedAnimationIndex], c = this.subMeshObjectIndices.length, b = 0; b < c; b++) {
        var d = this.subMeshLiveIndices[b];
        if (-1 != d) {
            var e = this.subMeshObjectIndices[b]
                , d = this.scene.meshRenderables[d]
                , f = a.getObjectAnimationFramePercent(a.animatedObjects[e], this.totalSeconds);
            d.visible = a.isVisibleAtFramePercent(e, f)
        }
    }
};
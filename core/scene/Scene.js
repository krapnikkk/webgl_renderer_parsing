function Scene(a) {
    this.gl = a;
    this.name = "untitled";
    this.meshes = [];
    this.meshRenderables = [];
    this.materials = {};
    this.sky = this.view = null;
    this.selectedPartIndex = 0;
    this.soloPart = !1;
    this.miscnotes = "";
    this.nextView = null;
    this.viewFade = 0;
    this.refractionSurface = this.shadow = this.stripData = this.lights = null;
    this.sceneAnimator = this.frameCounter = 0;
    this.sceneLoaded = !1;
    this.debugString = ""
}
Scene.prototype.load = function (a) {
    var c = this.gl, b, d = a.extract("scene.json");
    if (void 0 !== d) {
        if (!a.checkSignature(d))
            return !1;
        d = (new ByteStream(d.data)).asString();
        if (null == d || 0 >= d.length)
            return !1;
        try {
            b = JSON.parse(d)
        } catch (e) {
            return console.error(e),
                !1
        }
    } else
        return !1;
    this.metaData = b.metaData;
    this.view = new View(b.mainCamera.view);
    this.sky = new Sky(this.gl, a, b.sky);
    this.lights = new Lights(b.lights, this.view);
    this.materialsList = [];
    this.materials = {};
    for (var f in b.materials) {
        var g = b.materials[f];
        g.lightCount = this.lights.count;
        g.shadowCount = this.lights.shadowCount;
        g.useNewAttenuation = b.lights.useNewAttenuation;
        d = new Material(this.gl, a, g);
        this.materials[g.name] = d;
        this.materialsList.push(d)
    }
    if (b.meshes)
        for (g = 0; g < b.meshes.length; ++g) {
            f = b.meshes[g];
            f = new Mesh(this.gl, f, a.extract(f.file));
            this.meshes.push(f);
            for (var h = 0; h < f.desc.subMeshes.length; ++h) {
                var k = f.desc.subMeshes[h];
                if (d = this.materials[k.material])
                    f.numSubMeshes++,
                        this.meshRenderables.push(new MeshRenderable(f, k, d))
            }
        }
    this.bounds = new Bounds(this.meshes);
    this.postRender = new PostRender(this.gl, b.mainCamera.post, !0);
    this.shadow = new ShadowCollector(c, this.lights.shadowCount);
    this.cameras = b.Cameras;
    b.AnimData && (this.sceneAnimator = new SceneAnimator(this, a, b.AnimData));
    b.fog && (this.fog = new Fog(c, b.fog));
    b.shadowFloor && (this.shadowFloor = new ShadowFloor(c, b.shadowFloor, this.shadow, this.lights));
    return this.sceneLoaded = !0
}
    ;
Scene.prototype.update = function () {
    this.sceneAnimator && (this.frameCounter++,
        this.lights.flagUpdateAnimatedLighting(),
        this.sceneAnimator.drawAnimated && (1 == this.frameCounter ? this.sceneAnimator.resetPlayback() : this.sceneAnimator.updateAnimationPlayback()));
    this.lights.update(this.view, this.bounds)
}
    ;
Scene.prototype.collectShadows = function (a) {
    this.shadow.collect(this, a)
}
    ;
Scene.prototype.draw = function (a) {
    var c = this.gl;
    if (this.sceneLoaded) {
        this.sky.setClearColor();
        c.clear(c.COLOR_BUFFER_BIT | c.DEPTH_BUFFER_BIT | c.STENCIL_BUFFER_BIT);
        c.enable(c.DEPTH_TEST);
        this.sky.draw(this);
        this.shadowFloor && this.shadowFloor.draw(this);
        for (var b = 0; b < this.meshRenderables.length; ++b)
            this.meshRenderables[b].material.usesBlending || this.meshRenderables[b].material.usesRefraction || !this.meshRenderables[b].visible || this.meshRenderables[b].draw(this);
        c.enable(c.POLYGON_OFFSET_FILL);
        c.polygonOffset(1, 1);
        c.colorMask(!1, !1, !1, !1);
        for (b = 0; b < this.meshRenderables.length; ++b)
            this.meshRenderables[b].drawAlphaPrepass(this);
        c.colorMask(!0, !0, !0, !0);
        c.disable(c.POLYGON_OFFSET_FILL);
        c.depthFunc(c.LEQUAL);
        c.depthMask(!1);
        for (b = 0; b < this.meshRenderables.length; ++b)
            this.meshRenderables[b].material.usesBlending && this.meshRenderables[b].visible && this.meshRenderables[b].draw(this);
        c.disable(c.BLEND);
        c.depthMask(!0);
        c.depthFunc(c.LESS);
        for (var d = !1, b = 0; b < this.meshRenderables.length; ++b)
            if (this.meshRenderables[b].material.usesRefraction) {
                d = !0;
                break
            }
        if (d)
            for (this.refractionSurface && this.refractionSurface.desc.width == a.color0.desc.width && this.refractionSurface.desc.height == a.color0.desc.height || (this.refractionSurface = new Texture(c, a.color0.desc),
                this.refractionSurface.loadArray(null, a.color0.format, a.color0.componentType),
                this.refractionBuffer = new Framebuffer(this.gl, {
                    color0: this.refractionSurface
                })),
                this.refractionBuffer.bind(),
                this.postRender.blitTexture(a.color0),
                a.bind(),
                b = 0; b < this.meshRenderables.length; ++b)
                this.meshRenderables[b].material.usesRefraction && this.meshRenderables[b].visible && this.meshRenderables[b].draw(this);
        if (this.stripData.activeWireframe() && 0 < this.meshRenderables.length) {
            for (b = 0; b < this.meshRenderables.length; ++b)
                this.meshRenderables[b].visible && this.meshRenderables[b].drawWire(this);
            c.depthMask(!0)
        }
        c.disable(c.BLEND)
    }
}
    ;
Scene.prototype.drawSecondary = function (a) {
    this.fog && this.fog.draw(this, a)
}
    ;
Scene.prototype.complete = function () {
    if (!this.sky.complete() || !this.shadow.complete() || this.fog && !this.fog.complete() || this.shadowFloor && !this.shadowFloor.complete())
        return !1;
    for (var a = 0; a < this.meshRenderables.length; ++a)
        if (!this.meshRenderables[a].complete())
            return !1;
    return !0
}
    ;
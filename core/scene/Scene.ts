import Bounds from "../Bounds";
import ByteStream from "../ByteStream";
import Framebuffer from "../Framebuffer";
import { IWebGLRenderingContext } from "../interface";
import Mesh from "../Mesh";
import ShadowCollector from "../shader/ShadowCollector";
import ShadowFloor from "../shader/ShadowFloor";
import Texture from "../Texture";
import SceneAnimator from "./SceneAnimator";
import View from "./View";

export default class Scene {
    gl: IWebGLRenderingContext;
    name: string;
    meshes: any[];
    meshRenderables: any[];
    materials: {};
    sky: any;
    view: any;
    selectedPartIndex: number;
    soloPart: boolean;
    miscnotes: string;
    nextView: any;
    viewFade: number;
    refractionSurface: any;
    shadow: any;
    stripData: any;
    lights: any;
    sceneAnimator: SceneAnimator;
    frameCounter: number;
    sceneLoaded: boolean;
    debugString: string;
    metaData: any;
    materialsList: any[];
    bounds: any;
    postRender: any;
    cameras: any;
    fog: any;
    shadowFloor: any;
    refractionBuffer: any;
    constructor(gl:IWebGLRenderingContext) {
        this.gl = gl;
        this.name = "untitled";
        this.meshes = [];
        this.meshRenderables = [];
        this.materials = {};
        this.sky = this.view = null;
        this.selectedPartIndex = 0;
        this.soloPart = false;
        this.miscnotes = "";
        this.nextView = null;
        this.viewFade = 0;
        // this.refractionSurface = this.shadow = this.stripData = this.lights = null;
        this.frameCounter = 0;
        this.sceneLoaded = false;
        this.debugString = ""
    }
    load(a) {
        var c = this.gl, b, d = a.extract("scene.json");
        if (void 0 !== d) {
            if (!a.checkSignature(d))
                return false;
            d = (new ByteStream(d.data)).asString();
            if (null == d || 0 >= d.length)
                return false;
            try {
                b = JSON.parse(d)
            } catch (e) {
                return console.error(e),
                    false
            }
        } else
            return false;
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
        this.postRender = new PostRender(this.gl, b.mainCamera.post, true);
        this.shadow = new ShadowCollector(c, this.lights.shadowCount);
        this.cameras = b.Cameras;
        b.AnimData && (this.sceneAnimator = new SceneAnimator(this, a, b.AnimData));
        b.fog && (this.fog = new Fog(c, b.fog));
        b.shadowFloor && (this.shadowFloor = new ShadowFloor(c, b.shadowFloor, this.shadow, this.lights));
        return this.sceneLoaded = true
    }
    update() {
        this.sceneAnimator && (this.frameCounter++,
            this.lights.flagUpdateAnimatedLighting(),
            this.sceneAnimator.drawAnimated && (1 == this.frameCounter ? this.sceneAnimator.resetPlayback() : this.sceneAnimator.updateAnimationPlayback()));
        this.lights.update(this.view, this.bounds)
    }
    collectShadows(a) {
        this.shadow.collect(this, a)
    }
    draw(a) {
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
            c.colorMask(false, false, false, false);
            for (b = 0; b < this.meshRenderables.length; ++b)
                this.meshRenderables[b].drawAlphaPrepass(this);
            c.colorMask(true, true, true, true);
            c.disable(c.POLYGON_OFFSET_FILL);
            c.depthFunc(c.LEQUAL);
            c.depthMask(false);
            for (b = 0; b < this.meshRenderables.length; ++b)
                this.meshRenderables[b].material.usesBlending && this.meshRenderables[b].visible && this.meshRenderables[b].draw(this);
            c.disable(c.BLEND);
            c.depthMask(true);
            c.depthFunc(c.LESS);
            for (var d = false, b = 0; b < this.meshRenderables.length; ++b)
                if (this.meshRenderables[b].material.usesRefraction) {
                    d = true;
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
                c.depthMask(true)
            }
            c.disable(c.BLEND)
        }
    }
    drawSecondary(a) {
        this.fog && this.fog.draw(this, a)
    }
    complete() {
        if (!this.sky.complete() || !this.shadow.complete() || this.fog && !this.fog.complete() || this.shadowFloor && !this.shadowFloor.complete())
            return false;
        for (var a = 0; a < this.meshRenderables.length; ++a)
            if (!this.meshRenderables[a].complete())
                return false;
        return true
    }
}
import Archive from "../Archive";
import Framebuffer from "../Framebuffer";
import StripData from "../StripData";
import TextureCache from "../TextureCache";
import Network from "../utils/Network";

export default class WebViewer {
    mobile: boolean;
    mobileFast: boolean;
    desktopSlow: any;
    domRoot: HTMLDivElement;
    scene: any;
    input: any;
    sceneURL: any;
    sleepCounter: number;
    onLoad: any;
    stripData: any;
    ui: any;
    canvas: any;
    pixelRatio: number;
    gl: any;
    mainColor: Texture;
    mainDepth: any;
    mainBuffer: any;
    mainBufferNoDepth: any;
    frameRequestPending: any;
    oldRootWidth: any;
    oldRootHeight: any;
    constructor(a, c, b, d) {
        this.mobile = !!/Android|iPhone|iPod|iPad|Windows Phone|IEMobile|BlackBerry|webOS/.test(navigator.userAgent);
        this.mobileFast = !!/iPhone|iPad/.test(navigator.userAgent);
        var e;
        if (e = !this.mobile)
            a: {
                e = document.createElement("canvas");
                e.width = e.height = 16;
                if (e = e.getContext("webgl", {}) || e.getContext("experimental-webgl", {})) {
                    var f = e.getExtension("WEBGL_debug_renderer_info");
                    if (f) {
                        e = e.getParameter(f.UNMASKED_RENDERER_WEBGL);
                        e = !!/Intel|INTEL/.test(e);
                        break a
                    }
                }
                e = !1
            }
        this.desktopSlow = e;
        this.domRoot = document.createElement("div");
        this.domRoot.style.width = a + "px";
        this.domRoot.style.height = c + "px";
        this.initCanvas(a, c);
        this.scene = this.input = null;
        this.sceneURL = b;
        this.sleepCounter = 8;
        this.onLoad = null;
        this.stripData = new StripData();
        this.ui = new UI(this);
        this.ui.setSize(a, c);
        this.ui.showPreview(d)
    }

    initCanvas(a, c) {
        this.canvas && this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas);
        this.canvas = document.createElement("canvas");
        this.pixelRatio = window.devicePixelRatio || 1;
        if (this.mobile) {
            var b = this.mobileFast ? 1.5 : 1;
            this.pixelRatio = this.pixelRatio > b ? b : this.pixelRatio
        } else
            this.desktopSlow && (this.pixelRatio = 1);
        this.canvas.width = a * this.pixelRatio;
        this.canvas.height = c * this.pixelRatio;
        this.canvas.style.width = a + "px";
        this.canvas.style.height = c + "px";
        this.canvas.style.position = "absolute";
        this.domRoot.appendChild(this.canvas)
    }
    initGL() {
        var a = {
            alpha: !!marmoset.transparentBackground,
            depth: !1,
            stencil: !1,
            antialias: !1,
            premultipliedAlpha: !!marmoset.transparentBackground,
            preserveDrawingBuffer: !1
        }
            , a = this.gl = this.canvas.getContext("webgl", a) || this.canvas.getContext("experimental-webgl", a);
        if (!this.gl)
            return this.ui.showFailure('Please <a href="http://get.webgl.org/" target=_blank>check<a/> to ensure your browser has support for WebGL.'),
                !1;
        this.canvas.addEventListener("webglcontextlost", function (a) {
            a.preventDefault()
        }
            .bind(this), !1);
        this.canvas.addEventListener("webglcontextrestored", function (a) {
            this.loadScene(this.sceneURL)
        }
            .bind(this), !1);
        a.ext = {
            textureAniso: a.getExtension("EXT_texture_filter_anisotropic") || a.getExtension("WEBKIT_EXT_texture_filter_anisotropic") || a.getExtension("MOZ_EXT_texture_filter_anisotropic"),
            textureFloat: a.getExtension("OES_texture_float"),
            textureFloatLinear: a.getExtension("OES_texture_float_linear"),
            textureHalf: a.getExtension("OES_texture_half_float"),
            textureHalfLinear: a.getExtension("OES_texture_half_float_linear"),
            textureDepth: a.getExtension("WEBGL_depth_texture"),
            colorBufferFloat: a.getExtension("WEBGL_color_buffer_float"),
            colorBufferHalf: a.getExtension("EXT_color_buffer_half_float"),
            index32bit: a.getExtension("OES_element_index_uint"),
            loseContext: a.getExtension("WEBGL_lose_context"),
            derivatives: a.getExtension("OES_standard_derivatives"),
            renderInfo: a.getExtension("WEBGL_debug_renderer_info")
        };
        a.limits = {
            textureSize: a.getParameter(a.MAX_TEXTURE_SIZE),
            textureCount: a.getParameter(a.MAX_TEXTURE_IMAGE_UNITS),
            varyings: a.getParameter(a.MAX_VARYING_VECTORS),
            vertexAttribs: a.getParameter(a.MAX_VERTEX_ATTRIBS),
            vertexUniforms: a.getParameter(a.MAX_VERTEX_UNIFORM_VECTORS),
            fragmentUniforms: a.getParameter(a.MAX_FRAGMENT_UNIFORM_VECTORS),
            viewportSizes: a.getParameter(a.MAX_VIEWPORT_DIMS),
            vendor: a.getParameter(a.VENDOR),
            version: a.getParameter(a.VERSION)
        };
        a.hints = {
            mobile: this.mobile,
            pixelRatio: this.pixelRatio
        };
        a.enable(a.DEPTH_TEST);
        a.shaderCache = new ShaderCache(a);
        a.textureCache = new TextureCache(a);
        this.allocBacking();
        return !0
    }
    allocBacking() {
        var a = this.gl
            , c = !1
            , b = {
                width: this.canvas.width,
                height: this.canvas.height
            };
        this.mainColor = new Texture(a, b);
        this.mainDepth = null;
        a.ext.textureDepth && (this.mainDepth = new Texture(a, {
            width: this.canvas.width,
            height: this.canvas.height,
            nofilter: !0
        }),
            this.mainDepth.loadArray(null, a.DEPTH_COMPONENT, a.UNSIGNED_INT));
        a.ext.textureHalf && a.ext.textureHalfLinear && (this.mainColor.loadArray(null, a.RGBA, a.ext.textureHalf.HALF_FLOAT_OES),
            this.mainBuffer = new Framebuffer(a, {
                color0: this.mainColor,
                depth: this.mainDepth,
                createDepth: !this.mainDepth
            }),
            c = this.mainBuffer.valid);
        !c && a.ext.textureFloat && a.ext.textureFloatLinear && !a.hints.mobile && (this.mainColor.loadArray(null, a.RGBA, a.FLOAT),
            this.mainBuffer = new Framebuffer(a, {
                color0: this.mainColor,
                depth: this.mainDepth,
                createDepth: !this.mainDepth
            }),
            c = this.mainBuffer.valid);
        for (; !c;)
            this.mainColor = new Texture(a, b),
                this.mainColor.loadArray(null, a.RGBA, a.UNSIGNED_BYTE),
                this.mainBuffer = new Framebuffer(a, {
                    color0: this.mainColor,
                    depth: this.mainDepth,
                    createDepth: !this.mainDepth
                }),
                c = this.mainBuffer.valid,
                b.width /= 2,
                b.height /= 2,
                this.mainDepth && (this.mainDepth.destroy(),
                    this.mainDepth = null);
        this.mainBufferNoDepth = new Framebuffer(a, {
            color0: this.mainColor
        })
    }
    loadScene(a) {
        this.sceneURL = a || this.sceneURL;
        this.scene = this.input = null;
        if (this.initGL() && this.sceneURL) {
            var c = this.ui.signalLoadProgress.bind(this.ui);
            a(a) {
                c(1, 1);
                this.scene = new Scene(this.gl);
                this.scene.stripData = this.stripData;
                if (this.scene.load(new Archive(a)))
                    if (2070 >= this.scene.metaData.tbVersion)
                        this.ui.showFailure("This .mview file is from an out-of-date beta version of Toolbag. Please re-export it with the new version. Thanks!");
                    else {
                        if (this.bindInput(),
                            this.requestFrame(this.updateLoad.bind(this)),
                            this.onLoad)
                            this.onLoad()
                    }
                else
                    this.ui.showFailure("Package file could not be read or is invalid.")
            }
                .bind(this);
            var b() {
                this.ui.showFailure("Package file (" + this.sceneURL + ") could not be retrieved.")
            }
                .bind(this);
            Network.fetchBinary(this.sceneURL, a, b, c)
        }
    }
    unload() {
        delete this.scene;
        delete this.input;
        delete this.ui;
        delete this.mainColor;
        delete this.mainBuffer;
        delete this.gl;
        var a = this.domRoot.clientWidth
            , c = this.domRoot.clientHeight;
        this.initCanvas(a, c);
        this.ui = new UI(this);
        this.ui.setSize(a, c);
        this.ui.showPreview();
        this.cancelFrame()
    }
    bindInput() {
        this.input = new Input(this.ui.container);
        this.input.onDrag.push(function (a, c, b, d) {
            a = 1 - 2.2 / (Math.sqrt(b * b + d * d) + 2.2);
            c = this.scene.view;
            c.rotation[1] -= 0.4 * b * a;
            c.rotation[0] -= 0.4 * d * a;
            c.rotation[0] = 90 < c.rotation[0] ? 90 : c.rotation[0];
            c.rotation[0] = -90 > c.rotation[0] ? -90 : c.rotation[0];
            c.updateView();
            this.wake()
        }
            .bind(this));
        this.input.onPan.push(function (a, c) {
            var b = this.scene.view
                , d = b.fov / 45 * 0.8 * (b.radius / this.domRoot.clientHeight)
                , e = -a * d
                , d = c * d;
            b.pivot[0] += e * b.transform[0] + d * b.transform[4];
            b.pivot[1] += e * b.transform[1] + d * b.transform[5];
            b.pivot[2] += e * b.transform[2] + d * b.transform[6];
            b.updateView();
            this.wake()
        }
            .bind(this));
        this.input.onPan2.push(function (a, c) {
            var b = 1 - 2.2 / (Math.sqrt(a * a + c * c) + 2.2);
            this.scene.lights.rotation -= 0.4 * a * b;
            this.wake()
        }
            .bind(this));
        this.input.onZoom.push(function (a) {
            var c = this.scene.view;
            c.radius *= 1 - 0.002 * a;
            c.radius = 0.001 > c.radius ? 0.001 : c.radius;
            c.radius = 1E3 < c.radius ? 1E3 : c.radius;
            c.updateView();
            this.wake()
        }
            .bind(this));
        this.input.onDoubleTap.push(function (a, c) {
            this.scene.view.reset();
            this.scene.sceneAnimator && this.scene.sceneAnimator.resetCustomView();
            this.wake()
        }
            .bind(this));
        this.ui.bindInput(this.input)
    }
    wake(a) {
        a = a || 16;
        this.sleepCounter = this.sleepCounter < a ? a : this.sleepCounter;
        this.scene.postRender.discardAAHistory();
        this.requestFrame(this.update.bind(this))
    }
    requestFrame(a) {
        var c = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        if (!this.frameRequestPending) {
            var b() {
                this.frameRequestPending = 0;
                a()
            }
                .bind(this);
            this.frameRequestPending = c(b, this.canvas)
        }
    }
    cancelFrame() {
        this.frameRequestPending && (window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame)(this.frameRequestPending)
    }
    fullscreenChange() {
        FullScreen.active() ? (this.oldRootWidth = this.domRoot.style.width,
            this.oldRootHeight = this.domRoot.style.height,
            this.domRoot.style.width = "100%",
            this.domRoot.style.height = "100%") : (this.domRoot.style.width = this.oldRootWidth,
                this.domRoot.style.height = this.oldRootHeight);
        this.wake()
    }
    resize(a, c) {
        a && c ? (this.domRoot.style.width = a + "px",
            this.domRoot.style.height = c + "px") : (a = this.domRoot.clientWidth,
                c = this.domRoot.clientHeight);
        this.canvas.width = a * this.pixelRatio;
        this.canvas.height = c * this.pixelRatio;
        this.canvas.style.width = a + "px";
        this.canvas.style.height = c + "px";
        this.ui.setSize(a, c);
        this.allocBacking();
        this.wake()
    }
    updateLoad() {
        this.scene.complete() ? this.start() : this.requestFrame(this.updateLoad.bind(this));
        this.ui.animate()
    }
    start() {
        this.scene.view.updateView();
        this.ui.showActiveView();
        this.requestFrame(this.update.bind(this))
    }
    update() {
        var a = this.scene.sceneAnimator && !this.scene.sceneAnimator.paused;
        if (0 < this.sleepCounter || this.ui.animating() || a || this.stripData.animationActive)
            this.stripData.update(),
                this.ui.animate(),
                this.scene.update(),
                this.drawScene(),
                this.requestFrame(this.update.bind(this));
        a ? this.scene.postRender.discardAAHistory() : this.sleepCounter--
    }
    reDrawScene() {
        this.stripData.update();
        this.ui.animate();
        this.scene.update();
        this.drawScene();
        this.requestFrame(this.update.bind(this));
        this.scene.postRender.discardAAHistory()
    }
    drawScene() {
        this.gl.isContextLost() || (this.domRoot.clientWidth == this.canvas.clientWidth && this.domRoot.clientHeight == this.canvas.clientHeight || this.resize(),
            this.scene.view.size = [this.mainBuffer.width, this.mainBuffer.height],
            this.scene.view.updateProjection(),
            this.scene.postRender.adjustProjectionForSupersampling(this.scene.view),
            this.scene.collectShadows(this.mainBuffer),
            this.mainBuffer.bind(),
            this.scene.draw(this.mainBuffer),
            this.mainDepth && (this.mainBufferNoDepth.bind(),
                this.scene.drawSecondary(this.mainDepth)),
            this.scene.postRender.present(this.mainColor, this.canvas.width, this.canvas.height, this.stripData.active()))
    }
}


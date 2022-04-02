import Archive from "../Archive";
import { FullScreen } from "../constant";
import Framebuffer from "../Framebuffer";
import { IWebGLRenderingContext } from "../interface";
import ShaderCache from "../shader/ShaderCache";
import StripData from "../StripData";
import Texture from "../Texture";
import TextureCache from "../TextureCache";
import Network from "../utils/Network";
import Input from "./Input";
import UI from "./UI";

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
    ui: UI;
    canvas: HTMLCanvasElement;
    pixelRatio: number;
    gl: IWebGLRenderingContext;
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
                e = false
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
        var options = {
            alpha: !!marmoset.transparentBackground,
            depth: false,
            stencil: false,
            antialias: false,
            premultipliedAlpha: !!marmoset.transparentBackground,
            preserveDrawingBuffer: false
        };
        this.gl = this.canvas.getContext("webgl", options) as IWebGLRenderingContext;
        if (!this.gl)
            return this.ui.showFailure('Please <a href="http://get.webgl.org/" target=_blank>check<a/> to ensure your browser has support for WebGL.'),
                false;
        this.canvas.addEventListener("webglcontextlost", function (a) {
            a.preventDefault()
        }
            .bind(this), false);
        this.canvas.addEventListener("webglcontextrestored", function (a) {
            this.loadScene(this.sceneURL)
        }
            .bind(this), false);
        this.gl.ext = {
            textureAniso: this.gl.getExtension("EXT_texture_filter_anisotropic") || this.gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") || this.gl.getExtension("MOZ_EXT_texture_filter_anisotropic"),
            textureFloat: this.gl.getExtension("OES_texture_float"),
            textureFloatLinear: this.gl.getExtension("OES_texture_float_linear"),
            textureHalf: this.gl.getExtension("OES_texture_half_float"),
            textureHalfLinear: this.gl.getExtension("OES_texture_half_float_linear"),
            textureDepth: this.gl.getExtension("WEBGL_depth_texture"),
            colorBufferFloat: this.gl.getExtension("WEBGL_color_buffer_float"),
            colorBufferHalf: this.gl.getExtension("EXT_color_buffer_half_float"),
            index32bit: this.gl.getExtension("OES_element_index_uint"),
            loseContext: this.gl.getExtension("WEBGL_lose_context"),
            derivatives: this.gl.getExtension("OES_standard_derivatives"),
            renderInfo: this.gl.getExtension("WEBGL_debug_renderer_info")
        };
        this.gl.limits = {
            textureSize: this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE),
            textureCount: this.gl.getParameter(this.gl.MAX_TEXTURE_IMAGE_UNITS),
            varyings: this.gl.getParameter(this.gl.MAX_VARYING_VECTORS),
            vertexAttribs: this.gl.getParameter(this.gl.MAX_VERTEX_ATTRIBS),
            vertexUniforms: this.gl.getParameter(this.gl.MAX_VERTEX_UNIFORM_VECTORS),
            fragmentUniforms: this.gl.getParameter(this.gl.MAX_FRAGMENT_UNIFORM_VECTORS),
            viewportSizes: this.gl.getParameter(this.gl.MAX_VIEWPORT_DIMS),
            vendor: this.gl.getParameter(this.gl.VENDOR),
            version: this.gl.getParameter(this.gl.VERSION)
        };
        this.gl.hints = {
            mobile: this.mobile,
            pixelRatio: this.pixelRatio
        };
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.shaderCache = new ShaderCache(this.gl);
        this.gl.textureCache = new TextureCache(this.gl);
        this.allocBacking();
        return true
    }
    allocBacking() {
        var a = this.gl
            , c = false
            , b = {
                width: this.canvas.width,
                height: this.canvas.height
            };
        this.mainColor = new Texture(a, b);
        this.mainDepth = null;
        a.ext.textureDepth && (this.mainDepth = new Texture(a, {
            width: this.canvas.width,
            height: this.canvas.height,
            nofilter: true
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
            a = (a) => {
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
            };
            var b = () => {
                this.ui.showFailure("Package file (" + this.sceneURL + ") could not be retrieved.")
            };
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
        }.bind(this));
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
    wake(sleepCounter?: number) {
        sleepCounter = sleepCounter || 16;
        this.sleepCounter = this.sleepCounter < sleepCounter ? sleepCounter : this.sleepCounter;
        this.scene.postRender.discardAAHistory();
        this.requestFrame(this.update.bind(this))
    }
    requestFrame(a) {
        var c = window.requestAnimationFrame;
        if (!this.frameRequestPending) {
            var b = () => {
                this.frameRequestPending = 0;
                a()
            };
            this.frameRequestPending = c(b, this.canvas)
        }
    }
    cancelFrame() {
        this.frameRequestPending && window.cancelAnimationFrame(this.frameRequestPending)
    }
    fullscreenChange() {
        FullScreen.active() ? (this.oldRootWidth = this.domRoot.style.width,
            this.oldRootHeight = this.domRoot.style.height,
            this.domRoot.style.width = "100%",
            this.domRoot.style.height = "100%") : (this.domRoot.style.width = this.oldRootWidth,
                this.domRoot.style.height = this.oldRootHeight);
        this.wake();
    }
    resize(width?: number, height?: number) {
        if(width && height){
            this.domRoot.style.width = width + "px", this.domRoot.style.height = height + "px"
        }else{
            width = this.domRoot.clientWidth;
            height = this.domRoot.clientHeight
        }
        this.canvas.width = width * this.pixelRatio;
        this.canvas.height = height * this.pixelRatio;
        this.canvas.style.width = width + "px";
        this.canvas.style.height = height + "px";
        this.ui.setSize(width, height);
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


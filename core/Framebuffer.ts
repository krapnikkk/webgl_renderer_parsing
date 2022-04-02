import { IFramebufferOptions } from "./interface";
import Texture from "./Texture";

export default class Framebuffer {
    gl: WebGLRenderingContext;
    fbo: WebGLFramebuffer;
    width: number;
    height: number;
    color0: Texture;
    depthBuffer: WebGLRenderbuffer;
    depth: Texture;
    valid: boolean;
    constructor(gl: WebGLRenderingContext, option?: IFramebufferOptions) {
        this.gl = gl;
        this.fbo = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
        if (option) {
            this.width = option.width;
            this.height = option.height;
            if (option.color0) {
                this.color0 = option.color0,
                    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.color0.id, 0),
                    this.width = option.color0.desc.width,
                    this.height = option.color0.desc.height
            }
            if (option.depth) {
                this.depth = option.depth;
                this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, this.depth.id, 0);
            } else {
                this.depthBuffer = option.depthBuffer;
                if (option.createDepth && !this.depthBuffer) {
                    this.depthBuffer = Framebuffer.createDepthBuffer(this.gl, this.width, this.height);
                    if (option.createDepth) {
                        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthBuffer);
                        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.depthBuffer);
                        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
                    }
                }
            }
        }
        this.valid = option && option.ignoreStatus || this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) == this.gl.FRAMEBUFFER_COMPLETE;
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
    }

    bind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
        this.gl.viewport(0, 0, this.width, this.height)
    }

    static createDepthBuffer(gl: WebGLRenderingContext, width: number, height: number) {
        var renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        return renderbuffer
    }

    static bindNone(gl: WebGLRenderingContext) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }
}
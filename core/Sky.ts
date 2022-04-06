import Archive from "./Archive";
import { transparentBackground } from "./Config";
import Framebuffer from "./Framebuffer";
import { ISkyDesc, IWebGLRenderingContext } from "./interface";
import Shader from "./shader/Shader";
import Texture from "./Texture";

export default class Sky {
    gl: IWebGLRenderingContext;
    specularTexture: Texture;
    diffuseCoefficients: Float32Array;
    backgroundMode: number;
    backgroundBrightness: any;
    backgroundColor: Float32Array;
    backgroundShader: any;
    vertexBuffer: any;
    indexBuffer: any;
    skyIndexCount: any;
    backgroundCoefficients: Float32Array;
    backgroundTexture: any;
    constructor(gl: IWebGLRenderingContext, archive: Archive, skyDesc: ISkyDesc) {
        this.gl = gl;
        var file = archive.extract("sky.dat") || archive.extract("sky.png");
        if (file) {
            this.specularTexture = new Texture(this.gl, {
                width: 256,
                height: 2048,
                clamp: true
            });
            let data = file.data;
            for (var len = file.data.length, e = len / 4, buffer = new Uint8Array(len), g = 0, h = 0; g < len; ++h)
                buffer[g++] = data[h + 2 * e],
                    buffer[g++] = data[h + e],
                    buffer[g++] = data[h],
                    buffer[g++] = data[h + 3 * e];
            this.specularTexture.loadArray(buffer)
        }
        this.diffuseCoefficients = new Float32Array(skyDesc.diffuseCoefficients);
        this.backgroundMode = skyDesc.backgroundMode || 0;
        this.backgroundBrightness = skyDesc.backgroundBrightness || 1;
        this.backgroundColor = new Float32Array(skyDesc.backgroundColor);
        let size: number = 0;
        if (1 <= this.backgroundMode) {
            this.backgroundShader = this.gl.shaderCache.fromURLs("skyvert.glsl", 3 == this.backgroundMode ? "skySH.glsl" : "sky.glsl", ["#define SKYMODE " + this.backgroundMode]),
                this.vertexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
            size = 1 / 256;
            let times = 0.5 / 256,
                d = 2.8 * times,
                e = 0.5 * times;
            let data = new Float32Array(
                [0, 1, 0, 0.49609375 + size,
                    0.49609375 + size, 1, 0, 0, 0.9921875 + size, 0.49609375 + size, 0, 0, 1, 0.49609375 + size, 0.9921875 + size, -1, 0, 0, 0 + size, 0.49609375 + size, 0, 0, -1, 0.49609375 + size, 0 + size, 0, -1, 0, 0.9921875 + size, 0 + size, 0, -1, 0, 0.9921875 + size, 0.9921875 + size, 0, -1, 0, 0 + size, 0.9921875 + size, 0, -1, 0, 0 + size, 0 + size, d, 1 - d, -d, 0.5 + times, 0.5 - times, d, 1 - d, d, 0.5 + times, 0.5 + times, -d, 1 - d, d, 0.5 - times, 0.5 + times, -d, 1 - d, -d, 0.5 - times, 0.5 - times, -d, 0, -1 + d, 0.5 - times, 0 + size + times, d, 0, -1 + d, 0.5 + times, 0 + size + times, 1 - d, 0, -d, 0.9921875 + size - times, 0.5 - times, 1 - d, 0, d, 0.9921875 + size - times, 0.5 + times, d, 0, 1 - d, 0.5 + times, 0.9921875 + size - times, -d, 0, 1 - d, 0.5 - times, 0.9921875 + size - times, -1 + d, 0, d, 0 + size + times, 0.5 + times, -1 + d, 0, -d, 0 + size + times, 0.5 - times, 1, 0, 0, 0.9921875 + size - e, 0.49609375 + size, 0, 0, 1, 0.49609375 + size, 0.9921875 + size - e, -1, 0, 0, 0 + size + e, 0.49609375 + size, 0, 0, -1, 0.49609375 + size, 0 + size + e, 0, 1, 0, 0.49609375 + size - e, 0.49609375 + size, 0, 1, 0, 0.49609375 + size, 0.49609375 + size - e, 0, 1, 0, 0.49609375 + size + e, 0.49609375 + size, 0, 1, 0, 0.49609375 + size, 0.49609375 + size + e
                ]);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
            this.indexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            let skyIndexData = new Uint16Array([2, 1, 6, 3, 2, 7, 8, 4, 3, 4, 5, 1, 9, 14, 15, 17, 10, 16, 18, 19, 11, 20, 13, 12, 28, 12, 13, 13, 24, 28, 28, 24, 9, 9, 24, 14, 25, 9, 15, 25, 15, 21, 10, 25, 21, 10, 21, 16, 22, 26, 10, 22, 10, 17, 18, 11, 26, 22, 18, 26, 19, 23, 27, 19, 27, 11, 23, 20, 27, 27, 20, 12]);
            this.skyIndexCount = skyIndexData.length;
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, size, this.gl.STATIC_DRAW);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
            if (3 == this.backgroundMode) {
                for (this.backgroundCoefficients = new Float32Array(this.diffuseCoefficients),
                    g = 0; g < this.backgroundCoefficients.length; ++g)
                    this.backgroundCoefficients[g] *= this.backgroundBrightness;
            }
        } else {
            this.backgroundTexture = new Texture(this.gl, {
                width: 256,
                height: 256,
                clamp: true
            });
            let textureHalfFlag = false;
            let bgTexFrameBuffer: Framebuffer;
            if (this.gl.ext.textureHalf && this.gl.ext.textureHalfLinear) {
                this.backgroundTexture.loadArray(null, this.gl.RGB, this.gl.ext.textureHalf.HALF_FLOAT_OES);
                bgTexFrameBuffer = new Framebuffer(this.gl, {
                    color0: this.backgroundTexture
                });
                textureHalfFlag = bgTexFrameBuffer.valid;
            }

            if (!textureHalfFlag && this.gl.ext.textureFloat && this.gl.ext.textureFloatLinear && !this.gl.hints.mobile) {
                this.backgroundTexture.loadArray(null, this.gl.RGB, this.gl.FLOAT),
                    bgTexFrameBuffer = new Framebuffer(this.gl, {
                        color0: this.backgroundTexture
                    }),
                    textureHalfFlag = bgTexFrameBuffer.valid;
            }
            if (!textureHalfFlag) {
                this.backgroundTexture.loadArray();
                bgTexFrameBuffer = new Framebuffer(this.gl, {
                    color0: this.backgroundTexture
                });
            }
            bgTexFrameBuffer.bind();
            let bgShader = new Shader(this.gl);
            bgShader.build("precision highp float; varying vec2 tc; attribute vec4 p; void main(){ gl_Position=p; tc=vec2(0.5,0.5/8.0)*p.xy+vec2(0.5,6.5/8.0); }", "precision highp float; varying vec2 tc; uniform sampler2D tex; uniform float b; void main(){vec4 s=texture2D(tex,tc); gl_FragColor.xyz=s.xyz*(b*s.w);}");
            bgShader.bind();
            this.gl.uniform1f(bgShader.params.location, 7 * Math.sqrt(this.backgroundBrightness));
            this.specularTexture.bind(bgShader.samplers.tex);
            let glBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, glBuffer);
            let bufferData = new Float32Array([-1, -1, 0.5, 1, 3, -1, 0.5, 1, -1, 3, 0.5, 1]);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, bufferData, this.gl.STATIC_DRAW);
            this.gl.enableVertexAttribArray(bgShader.attribs.index);
            this.gl.vertexAttribPointer(bgShader.attribs.index, 4, this.gl.FLOAT, false, 0, 0);
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
            this.gl.disableVertexAttribArray(bgShader.attribs.index)
        }

    }
    setClearColor() {
        if (transparentBackground)
            this.gl.clearColor(0, 0, 0, 0);
        else if (1 > this.backgroundMode) {
            var a = this.backgroundColor;
            this.gl.clearColor(a[0], a[1], a[2], 1)
        } else
            this.gl.clearColor(0.0582, 0.06772, 0.07805, 1)
    }
    draw(a) {
        if (1 > this.backgroundMode || transparentBackground)
            return false;
        if (this.complete()) {
            var  b = this.backgroundShader
                , d = a.view
                , e = a.lights.invMatrix;
            b.bind();
            this.gl.uniformMatrix4fv(b.params.uInverseSkyMatrix, false, e);
            this.gl.uniformMatrix4fv(b.params.uViewProjection, false, d.viewProjectionMatrix);
            3 == this.backgroundMode ? this.gl.uniform4fv(b.params.uSkyCoefficients, this.backgroundCoefficients) : this.backgroundTexture.bind(b.samplers.tSkyTexture);
            a = 0.07 + 0.94 * (1 - a.stripData.activeFade());
            this.gl.uniform1f(b.params.uAlpha, a);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
            this.gl.enableVertexAttribArray(b.attribs.vPosition);
            this.gl.vertexAttribPointer(b.attribs.vPosition, 3, this.gl.FLOAT, false, 20, 0);
            this.gl.enableVertexAttribArray(b.attribs.vTexCoord);
            this.gl.vertexAttribPointer(b.attribs.vTexCoord, 2, this.gl.FLOAT, false, 20, 12);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            1 > a && (this.gl.enable(this.gl.BLEND),
                this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA));
            this.gl.depthMask(false);
            this.gl.disable(this.gl.DEPTH_TEST);
            this.gl.drawElements(this.gl.TRIANGLES, this.skyIndexCount, this.gl.UNSIGNED_SHORT, 0);
            this.gl.enable(this.gl.DEPTH_TEST);
            this.gl.depthMask(true);
            1 > a && this.gl.disable(this.gl.BLEND);
            this.gl.disableVertexAttribArray(b.attribs.vPosition);
            this.gl.disableVertexAttribArray(b.attribs.vTexCoord)
        }
    }
    complete() {
        return this.backgroundShader && !this.backgroundShader.complete() ? false : this.specularTexture.complete()
    }

}
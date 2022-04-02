import Framebuffer from "./Framebuffer";
import { IFile, IWebGLRenderingContext } from "./interface";
import Shader from "./shader/Shader";
import Texture from "./Texture";
import Network from "./utils/Network";

export default class TextureCache {
    gl: IWebGLRenderingContext;
    cache: { [key: string]: Texture } = {};
    blitShader: Shader;
    mergeVerts: WebGLBuffer;
    constructor(gl: IWebGLRenderingContext) {
        this.gl = gl;
        // this.cache = []
    }

    fromURL(url: string, desc: TextureDesc): Texture {
        let texture = this.cache[url];
        if (texture)
            return texture;
        texture = new Texture(this.gl, desc);
        Network.fetchImage(url, function (a) {
            texture.loadImage(a);
        });
        return this.cache[url] = texture;
    }

    fromFile(file: IFile, desc: TextureDesc): Texture {
        if (!file)
            return null;
        let texture = this.cache[file.name];
        if (texture) {
            return texture;
        } else {
            texture = new Texture(this.gl, desc);
            this.cache[file.name] = texture;
            TextureCache.parseFile(file, function (a) {
                texture.loadImage(a);
                TextureCache.closeImage(a)
            });
            return texture;
        }
    }

    fromFilesMergeAlpha(albedoTex: IFile, alphaTex: IFile, desc: TextureDesc) {
        if (!alphaTex)
            return this.fromFile(albedoTex, desc);
        let textureName = albedoTex.name + "|" + alphaTex.name,
            e = this.cache[textureName];
        if (e)
            return e;
        let vShader = "precision highp float; varying vec2 c; attribute vec2 pos; void main(){ gl_Position.xy = 2.0*pos-vec2(1.0); gl_Position.zw = vec2(0.5,1.0); c=pos; }";
        let fShader = "precision highp float; varying vec2 c; uniform sampler2D tTex; void main(){ gl_FragColor=texture2D(tTex,c).rgbr; }";
        if (!this.blitShader) {
            this.blitShader = new Shader(this.gl);
            this.blitShader.build(vShader, fShader);
            this.mergeVerts = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.mergeVerts);
            let data = new Float32Array([0, 0, 2, 0, 0, 2]);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        }
        let originTex = new Texture(this.gl, desc);
        this.cache[textureName] = originTex;
        let albedoImage:HTMLImageElement, alphaImage:HTMLImageElement;
        
        TextureCache.parseFile(albedoTex, function (img) {
            albedoImage = img;
            this.mergeAlpha(originTex,albedoImage, alphaImage);
        });
        TextureCache.parseFile(alphaTex, function (img) {
            alphaImage = img;
            this.mergeAlpha(originTex,albedoImage, alphaImage);
        });
        return originTex;
    }

    static parseFile(file: IFile, complete: (image?: HTMLImageElement) => void, image?: HTMLImageElement) {
        let img = image || new Image();
        if ("undefined" != typeof URL && "undefined" != typeof URL.createObjectURL) {
            let blob = new Blob([file.data], {
                type: file.type
            });
            let url = URL.createObjectURL(blob);
            img.onload = function () {
                URL.revokeObjectURL(url);
                complete && complete(img)
            };
            img.src = url;
        } else {
            let blob = new Blob([file.data], {
                type: file.type
            });
            let fileReader = new FileReader();
            fileReader.onload = function (a) {
                img.src = fileReader.result as string;
            };
            img.onload = function () {
                complete && complete(img)
            };
            fileReader.readAsDataURL(blob)
        }
    }

    static closeImage(image: HTMLImageElement) {
        image && 256 < image.width * image.height && (image.onload = null,
            image.onerror = null,
            image.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D")
    }

    mergeAlpha(originTex:Texture,albedoImage: HTMLImageElement, alphaTex: HTMLImageElement, texture: Texture) {
        if (albedoImage && alphaTex) {
            let width:number, height:number;
            if(alphaTex.width * alphaTex.height > albedoImage.width * albedoImage.height ){
                width = alphaTex.width, height = alphaTex.height
            }else{
                width = albedoImage.width, height = albedoImage.height
            }
            texture.desc.width = width;
            texture.desc.height = height;
            if (width <= this.gl.limits.viewportSizes[0] && height <= this.gl.limits.viewportSizes[1]) {
                let desc = {
                    clamp: true
                };

                let blitTex:Texture,frameBuffer:Framebuffer;
                if(albedoImage.width == width && albedoImage.height == height ){
                    texture.loadImage(albedoImage, this.gl.RGBA),
                    frameBuffer = new Framebuffer(this.gl, {
                        color0: texture,
                        ignoreStatus: true
                    }),
                    TextureCache.closeImage(albedoImage)
                }else{
                    blitTex = new Texture(this.gl, desc),
                    blitTex.loadImage(albedoImage, this.gl.RGB),
                    TextureCache.closeImage(albedoImage),
                    texture.loadArray(null),
                    frameBuffer = new Framebuffer(this.gl, {
                        color0: texture,
                        ignoreStatus: true
                    }),
                    frameBuffer.bind(),
                    this.buildBlit(blitTex),
                    blitTex.destroy()
                }
                blitTex = new Texture(this.gl, desc);
                blitTex.loadImage(albedoImage, this.gl.RGB);
                TextureCache.closeImage(albedoImage);
                frameBuffer.bind();
                this.gl.colorMask(false, false, false, true);
                this.buildBlit(blitTex);
                this.gl.colorMask(true, true, true, true);
                blitTex.destroy();
                Framebuffer.bindNone(this.gl);
                originTex.rebuildMips();
            } else {
                let canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                let context = canvas.getContext("2d");
                context.drawImage(albedoImage, 0, 0);
                TextureCache.closeImage(albedoImage);
                let imageData = context.getImageData(0, 0, width, height);
                let data = new Uint8Array(imageData.data.buffer, imageData.data.byteOffset, imageData.data.length);
                context.drawImage(alphaTex, 0, 0);
                TextureCache.closeImage(alphaTex);
                let uint8ClampedArray = context.getImageData(0, 0, width, height).data;
                let dataLen = width * height * 4;
                for (let i = 0; i < dataLen; i += 4){
                    data[i + 3] = uint8ClampedArray[i];
                }
                
                originTex.loadArray(data)
            }
            TextureCache.closeImage(alphaTex)
        }
    }

    buildBlit(tex:Texture){
        this.blitShader.bind();
        tex.bind(this.blitShader.samplers.tTex);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.mergeVerts);
        this.gl.enableVertexAttribArray(this.blitShader.attribs.pos);
        this.gl.vertexAttribPointer(this.blitShader.attribs.pos, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
        this.gl.disableVertexAttribArray(this.blitShader.attribs.pos);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }
}
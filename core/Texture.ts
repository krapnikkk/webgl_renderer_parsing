

class Texture {
    gl: IWebGLRenderingContext;
    componentType: GLenum;
    format: GLenum;
    type: GLenum;
    id: WebGLTexture = null;
    desc: TextureDesc
    constructor(gl: IWebGLRenderingContext, desc: TextureDesc) {
        this.gl = gl;
        this.type = gl.TEXTURE_2D;
        this.format = gl.RGBA;
        this.componentType = gl.UNSIGNED_BYTE;
        this.desc = {
            width: desc.width || 1,
            height: desc.height || 1,
            mipmap: desc.mipmap,
            clamp: desc.clamp,
            mirror: desc.mirror,
            aniso: desc.aniso,
            nofilter: desc.nofilter
        }
    }

    loadImage(image: HTMLImageElement, format?: GLenum) {
        if (image && image.width && image.height) {
            this.desc.width = image.width;
            this.desc.height = image.height;
        }

        this.id = this.gl.createTexture();
        this.gl.bindTexture(this.type, this.id);
        this.format = format || this.gl.RGBA;
        this.componentType = this.gl.UNSIGNED_BYTE;
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.texImage2D(this.type, 0, this.format, this.format, this.componentType, image);
        this.setParams();
        this.gl.bindTexture(this.type, null);
    }

    loadArray(buffer?: ArrayBufferView, format?: GLenum, componentType?: GLenum) {
        this.id = this.gl.createTexture();
        this.gl.bindTexture(this.type, this.id);
        this.format = format || this.gl.RGBA;
        this.componentType = componentType || this.gl.UNSIGNED_BYTE;
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.texImage2D(this.type, 0, this.format, this.desc.width, this.desc.height, 0, this.format, this.componentType, buffer || null);
        this.setParams();
        this.gl.bindTexture(this.type, null)
    }

    setParams() {
        if (!this.isEven(this.desc.width) || !this.isEven(this.desc.height)) {
            this.desc.clamp = true;
            this.desc.mipmap = false;
        }
        var nofilter = !this.desc.nofilter;

        if (this.desc.mipmap) {
            this.gl.generateMipmap(this.type);
            this.gl.texParameteri(this.type, this.gl.TEXTURE_MIN_FILTER, nofilter ? this.gl.LINEAR_MIPMAP_LINEAR : this.gl.NEAREST_MIPMAP_NEAREST);
        } else {
            this.gl.texParameteri(this.type, this.gl.TEXTURE_MIN_FILTER, nofilter ? this.gl.LINEAR : this.gl.NEAREST);
        }
        this.gl.texParameteri(this.type, this.gl.TEXTURE_MAG_FILTER, nofilter ? this.gl.LINEAR : this.gl.NEAREST);
        if (this.desc.clamp || this.desc.mirror) {
            let clamp = this.desc.clamp ? this.gl.CLAMP_TO_EDGE : this.gl.MIRRORED_REPEAT;
            this.gl.texParameteri(this.type, this.gl.TEXTURE_WRAP_S, clamp);
            this.gl.texParameteri(this.type, this.gl.TEXTURE_WRAP_T, clamp);
        }
        this.desc.aniso && this.gl.ext.textureAniso && this.gl.texParameteri(this.type, this.gl.ext.textureAniso.TEXTURE_MAX_ANISOTROPY_EXT, this.desc.aniso)
    }

    rebuildMips() {
        if (this.desc.mipmap) {
            this.gl.bindTexture(this.type, this.id);
            this.gl.generateMipmap(this.type);
        }
    }

    copyColorBuffer() {
        this.gl.bindTexture(this.type, this.id);
        this.gl.copyTexSubImage2D(this.type, 0, 0, 0, 0, 0, this.desc.width, this.desc.height);
    }

    bind(a) {
        if (a) {
            var c = this.gl;
            this.gl.uniform1i(a.location, a.unit);
            this.gl.activeTexture(this.gl.TEXTURE0 + a.unit);
            this.gl.bindTexture(this.type, this.id)
        }
    }

    destroy = function () {
        this.gl.deleteTexture(this.id);
        this.id = null
    }

    complete() {
        return !!this.id
    }

    isEven(num: number): boolean {
        return 0 < num && 0 == (num & num - 1);
    }

}
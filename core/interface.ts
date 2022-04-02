import Button from "./gui/Button"
import ControlRect from "./gui/ControlRect"
import ListBox from "./gui/ListBox"
import ShaderCache from "./shader/ShaderCache"
import Texture from "./Texture"
import TextureCache from "./TextureCache"

export interface ITextureDesc {
    width?: number,
    height?: number,
    mipmap?: boolean,
    clamp?: boolean,
    mirror?: boolean,
    aniso?: number,
    nofilter?: boolean
}

export interface IMeshDesc {
    transform: any
    name: string
    vertexColor: any
    secondaryTexCoord: any
    indexCount: number
    indexTypeSize: number
    wireCount: number
    vertexCount: number
    minBound: any
    maxBound: any
    isDynamicMesh: boolean
}


export interface IWebGLRenderingContext extends WebGLRenderingContext {
    limits: {
        textureSize: GLenum,
        textureCount: GLenum,
        varyings: GLenum,
        vertexAttribs: GLenum,
        vertexUniforms: GLenum,
        fragmentUniforms: GLenum,
        viewportSizes: GLenum,
        vendor: GLenum,
        version: GLenum,
    },
    ext: {
        textureAniso: EXT_texture_filter_anisotropic,
        textureFloat: OES_texture_float,
        textureFloatLinear: OES_texture_float,
        textureHalf: OES_texture_half_float,
        textureHalfLinear: OES_texture_half_float_linear,
        textureDepth: WEBGL_depth_texture,
        colorBufferFloat: WEBGL_color_buffer_float,
        colorBufferHalf: EXT_color_buffer_half_float,
        index32bit: OES_element_index_uint,
        loseContext: WEBGL_lose_context,
        derivatives: OES_standard_derivatives,
        renderInfo: WEBGL_debug_renderer_info
    },
    hints: {
        mobile: boolean,
        pixelRatio: number
    },
    location: number,
    unit: number,
    textureCache:TextureCache,
    shaderCache:ShaderCache
}

export interface IShaderParams{
    uModelViewProjectionMatrix?:WebGLUniformLocation,
    uLightPositions?:WebGLUniformLocation,
    uLightDirections?:WebGLUniformLocation,
    uLightColors?:WebGLUniformLocation,
    uLightParams?:WebGLUniformLocation,
    uModelSkyMatrix?:WebGLUniformLocation,
    uLightSpot?:WebGLUniformLocation,
    uShadowKernelRotation?:WebGLUniformLocation,
    uShadowMapSize?:WebGLUniformLocation,
    uShadowMatrices?:WebGLUniformLocation,
    uInvShadowMatrices?:WebGLUniformLocation,
    uShadowTexelPadProjections?:WebGLUniformLocation,
    uShadowCatcherParams?:WebGLUniformLocation,
}

export interface IFile {
    name: string,
    data: BlobPart,
    type: string
}

export interface IFramebufferOptions {
    color0?: Texture,
    width?: number,
    height?: number,
    ignoreStatus?: boolean
    createDepth?: boolean
    depth?: Texture
    depthBuffer?: WebGLRenderbuffer;
}

export interface IArchiveFileData {
    name: string;
    type: string;
    data: any;
}

export interface IExtrasTexCoordRanges{
    subdermisTex?:any,
    translucencyTex?:any,
    fuzzTex?:any,
    anisoTex?:any,
    refractionMaskTex?:any,
    aoTex?:any,
    emissiveTex?:any,
}

export type GUIType = Button|ControlRect|ListBox

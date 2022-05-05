import Button from "./gui/Button"
import ControlRect from "./gui/ControlRect"
import ListBox from "./gui/ListBox"
import Mesh from "./Mesh"
import ShaderCache from "./shader/ShaderCache"
import Texture from "./Texture"
import TextureCache from "./TextureCache"


export interface ISceneData {
    AnimData: {

    },
    Cameras: {
    },
    mainCamera: {
        view: IViewDesc
    },
    materials: IMaterialDesc[],
    meshes: Mesh[],
    metaData: IMetaData,
    sky: ISkyDesc,
    lights: ILightDesc
}

export interface IMetaData {
    author: string,
    date: number,
    link: string,
    tbVersion: number,
    title: string
}

export interface IViewDesc {
    angles: number[],
    pivot: number[],
    orbitRadius: number,
    fov: number,
    limits: number
}

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

export interface ISkyDesc {
    imageURL: string,
    diffuseCoefficients: Iterable<number>,
    backgroundMode: number,
    backgroundBrightness: number,
    backgroundColor: Iterable<number>,
}

export interface ILightDesc {
    colors: Float32Array,
    count: number,
    positions: Float32Array,
    directions: Float32Array,
    rotation: number,
    shadowCount: number,
    sky: ISkyDesc,
    matrixWeights: Float32Array,
    parameters: Float32Array,
    useNewAttenuation: boolean
}

export interface IMaterialDesc {
    name: string,
    albedoTex: string,
    reflectivityTex: string,
    normalTex: string,
    glossTex: string,
    blend: string,
    alphaTest: number,
    fresnel: number[],
    horizonOcclude: number,
    horizonSmoothing: number,
    tangentOrthogonalize: boolean,
    tangentNormalize: boolean,
    tangentGenerateBitangent: boolean,
    useSkin: boolean,
    skinParams: IskinParams,
    aniso: boolean,
    microfiber: boolean,
    refraction: boolean,
    lightCount: number,
    shadowCount: number,
    useNewAttenuation: boolean,
    textureWrapClamp: boolean,
    textureWrapMirror: boolean,
    textureFilterNearest: boolean,
    extrasTexCoordRanges: IExtrasTexCoordRanges,
    extrasTex: string,
    extrasTexA: string,
    alphaTex: string,
    blendTint: number[],
    emissiveIntensity: number,
    ggxSpecular: boolean,
    anisoParams: IAnisoParams,
    microfiberParams: IMicrofiberParams,
    refractionParams:IRefractionParams,
    vertexColor:boolean,
    vertexColorsRGB:boolean,
    vertexColorAlpha:boolean,
    unlitDiffuse:boolean,
    emissiveSecondaryUV:boolean,
    aoSecondaryUV:boolean,
}

export interface IAnisoParams {
    strength: number,
    tangent: number[],
    integral: number
}

export interface IMicrofiberParams {
    fresnelColor: number[],
    fresnelOcc: number,
    fresnelGlossMask: number,
    fresnelIntegral?:number
}

export interface IRefractionParams {
    distantBackground: boolean,
    tint: number[],
    useAlbedoTint: boolean,
    IOR: number,
    newRefraction?:boolean
}

export interface IskinParams {
    version?: number,
    millimeterScale: number,
    subdermisColor: number[],
    transColor: number[],
    transScatter: number,
    transDepth: number,
    fresnelColor: number[],
    normalSmooth: number,
    fresnelOcc: number,
    fresnelGlossMask: number,
    transSky: number,
    shadowBlur: number,
    scaleAdjust?: number,
    transIntegral?: number,
    fresnelIntegral?: number
}

export interface IWebGLRenderingContext extends WebGLRenderingContext {
    length: number
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
    textureCache: TextureCache,
    shaderCache: ShaderCache
}

export interface IShaderParams {
    uModelViewProjectionMatrix?: WebGLUniformLocation,
    uLightPositions?: WebGLUniformLocation,
    uLightDirections?: WebGLUniformLocation,
    uLightColors?: WebGLUniformLocation,
    uLightParams?: WebGLUniformLocation,
    uModelSkyMatrix?: WebGLUniformLocation,
    uLightSpot?: WebGLUniformLocation,
    uShadowKernelRotation?: WebGLUniformLocation,
    uShadowMapSize?: WebGLUniformLocation,
    uShadowMatrices?: WebGLUniformLocation,
    uInvShadowMatrices?: WebGLUniformLocation,
    uShadowTexelPadProjections?: WebGLUniformLocation,
    uShadowCatcherParams?: WebGLUniformLocation,
    location?: GLenum
    uKernel?: GLenum
}

export interface IFile {
    name: string,
    data: BlobPart,
    type: string
}

export interface IFramebufferDesc {
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

export interface IExtrasTexCoordRanges {
    subdermisTex?: any,
    translucencyTex?: any,
    fuzzTex?: any,
    anisoTex?: any,
    refractionMaskTex?: any,
    aoTex?: any,
    emissiveTex?: any,
}


export type GUIType = Button | ControlRect | ListBox

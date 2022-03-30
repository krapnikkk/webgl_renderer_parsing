interface TextureDesc {
    width?: number,
    height?: number,
    mipmap?: boolean,
    clamp?: boolean,
    mirror?: number,
    aniso?: number,
    nofilter?: number
}

interface MeshDesc {
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


interface IWebGLRenderingContext extends WebGLRenderingContext {
    limits: any
    ext: any,
    location: number,
    unit: number
}

interface IFile {
    name:string,
    data: BlobPart,
    type: string
}

interface IFramebufferOptions {
    color0?: Texture,
    width?: number,
    height?: number,
    ignoreStatus?: boolean
    createDepth?: boolean
    depth?: Texture
    depthBuffer?: WebGLRenderbuffer;
}

interface IArchiveFileData {
    name: string;
    type: string;
    data: any;
}
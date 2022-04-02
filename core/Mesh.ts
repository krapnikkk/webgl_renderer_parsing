import ByteStream from "./ByteStream";
import { IMeshDesc, IArchiveFileData } from "./interface";
import Matrix from "./math/Matrix";
import Vect from "./math/Vector";

export default class Mesh{
    numSubMeshes: number;
    dynamicVertexData: Uint8Array;
    displayMatrix: any;
    name: string;
    modelMatrix: any;
    origin: any;
    stride: number;
    vertexColor: any;
    secondaryTexCoord: any;
    indexCount: number;
    indexTypeSize: number;
    indexType: GLenum;
    indexBuffer: WebGLBuffer;
    wireCount: number;
    wireBuffer: WebGLBuffer;
    vertexCount: number;
    vertexBuffer: WebGLBuffer;
    bounds: { min: any; max: any;maxExtent?:any,averageExtent?:any };
    constructor(gl:WebGLRenderingContext,desc:IMeshDesc,archiveFileData:IArchiveFileData){
        var d = desc.isDynamicMesh;
        this.numSubMeshes = 0;
        this.displayMatrix = Matrix.identity();
        this.name = desc.name;
        this.modelMatrix = Matrix.identity();
        this.origin = desc.transform ? Vect.create(desc.transform[12], desc.transform[13], desc.transform[14], 1) : Vect.create(0, 5, 0, 1);
        this.stride = 32;
        this.vertexColor = desc.vertexColor;
        if (this.vertexColor){
            this.stride += 4;
        }
        this.secondaryTexCoord = desc.secondaryTexCoord
        if (this.secondaryTexCoord){
            this.stride += 8;
        }
        let byteStream = new ByteStream(archiveFileData.data);
        this.indexCount = desc.indexCount;
        this.indexTypeSize = desc.indexTypeSize;
        this.indexType = 4 == this.indexTypeSize ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        var e = byteStream.readBytes(this.indexCount * this.indexTypeSize);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, e, gl.STATIC_DRAW);
        this.wireCount = desc.wireCount;
        this.wireBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.wireBuffer);
        e = byteStream.readBytes(this.wireCount * this.indexTypeSize);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, e, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        this.vertexCount = desc.vertexCount;
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        let data = byteStream.readBytes(this.vertexCount * this.stride);
        d ? (this.dynamicVertexData = new Uint8Array(data),
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW)) : gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        this.bounds = void 0 === desc.minBound || void 0 === desc.maxBound ? {
            min: Vect.create(-10, -10, -10, 1),
            max: Vect.create(10, 10, -0, 1)
        } : {
            min: Vect.create(desc.minBound[0], desc.minBound[1], desc.minBound[2], 1),
            max: Vect.create(desc.maxBound[0], desc.maxBound[1], desc.maxBound[2], 1)
        };
        this.bounds.maxExtent = Math.max(Math.max(desc.maxBound[0] - desc.minBound[0], desc.maxBound[1] - desc.minBound[1]), desc.maxBound[2] - desc.minBound[2]);
        this.bounds.averageExtent = (desc.maxBound[0] - desc.minBound[0] + (desc.maxBound[1] - desc.minBound[1]) + (desc.maxBound[2] - desc.minBound[2])) / 3
    }
}